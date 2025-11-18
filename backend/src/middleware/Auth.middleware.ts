import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { SupabaseService } from '@src/modules/supabase/supabase.service';
import { OAuth2Service } from '@src/modules/oauth2/oauth2.service';
import { GoogleProviderMetadata, isGoogleProviderMetadata } from '@src/types';

/**
 * Authentication Middleware
 * =========================
 * Validates Supabase session tokens and manages Google OAuth tokens.
 *
 * Workflow:
 * 1. Extract Supabase token from Authorization header
 * 2. Verify token with Supabase
 * 3. Extract Google OAuth tokens from user metadata
 * 4. Auto-refresh Google token if expiring within 5 minutes
 * 5. Attach user info and tokens to request object
 *
 * Protected routes can access:
 * - req.user (authenticated user info)
 * - req.googleAccessToken (for YouTube API calls)
 * - req.googleRefreshToken (for token refresh)
 */
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AuthMiddleware.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly oauth2Service: OAuth2Service,
  ) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // ========================
      // 1. Extract and verify Supabase token
      // ========================
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        throw new UnauthorizedException('No authorization header');
      }

      const token = authHeader.replace('Bearer ', '');

      this.logger.log(token);

      const supabase = this.supabaseService.getClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);

      if (error || !user) {
        this.logger.error('Token verification failed:', error?.message);
        throw new UnauthorizedException('Invalid token');
      }

      // ========================
      // 2. Attach user info to request
      // ========================
      req.user = {
        id: user.id,
        email: user.email ?? '',
      };

      // ========================
      // 3. Extract Google OAuth metadata
      // ========================
      const metadata = user.user_metadata;

      // Use type guard to safely check metadata
      if (!isGoogleProviderMetadata(metadata)) {
        this.logger.debug('No valid Google provider metadata found for user');
        next();
        return;
      }

      // TypeScript now knows metadata is GoogleProviderMetadata
      let googleAccessToken = metadata.provider_token;
      const googleRefreshToken = metadata.provider_refresh_token;
      const tokenExpiresAt = metadata.provider_token_expires_at;

      // ========================
      // 4. Auto-refresh token if needed
      // ========================
      if (googleRefreshToken && tokenExpiresAt) {
        const now = Date.now();
        const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds

        // Check if token expires within buffer time
        if (tokenExpiresAt - now < bufferTime) {
          this.logger.log(
            `🔄 Token expires in ${Math.round((tokenExpiresAt - now) / 1000)}s, refreshing...`,
          );

          try {
            const newTokens =
              await this.oauth2Service.refreshAccessToken(googleRefreshToken);

            // Create updated metadata with new tokens
            const updatedMetadata: GoogleProviderMetadata = {
              ...metadata,
              provider_token: newTokens.access_token,
              provider_refresh_token:
                newTokens.refresh_token || googleRefreshToken,
              provider_token_expires_at:
                Date.now() + newTokens.expires_in * 1000,
            };

            // Update Supabase user metadata with new tokens
            const supabaseAdmin = this.supabaseService.getAdminClient();
            await supabaseAdmin.auth.admin.updateUserById(user.id, {
              user_metadata: updatedMetadata,
            });

            googleAccessToken = newTokens.access_token;
            this.logger.log('✅ Token refreshed and updated in Supabase');
          } catch (refreshError) {
            this.logger.error('Failed to refresh token:', refreshError);
            // Continue with current token - will fail at API call if expired
          }
        }
      }

      // ========================
      // 5. Attach tokens to request
      // ========================
      req.googleAccessToken = googleAccessToken;
      req.googleRefreshToken = googleRefreshToken;

      next();
    } catch (error) {
      this.logger.error('Auth middleware error:', error);
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
