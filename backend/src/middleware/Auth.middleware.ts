import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { SupabaseService } from '@src/modules/supabase/supabase.service';
import { OAuth2Service } from '@src/modules/oauth2/oauth2.service';
import { GoogleProviderMetadata } from '@common/youtube.interfaces';
import { AuthenticatedRequest } from './interfaces/authenticated-request.interface';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AuthMiddleware.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly oauth2Service: OAuth2Service,
  ) {}

  async use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      // Extract token from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        throw new UnauthorizedException('No authorization header');
      }

      const token = authHeader.replace('Bearer ', '');

      // Verify token with Supabase
      const supabase = this.supabaseService.getClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);

      if (error || !user) {
        this.logger.error('Token verification failed:', error?.message);
        throw new UnauthorizedException('Invalid token');
      }

      // Attach user info with proper typing
      req.user = {
        id: user.id,
        email: user.email ?? '',
      };

      // Extract Google tokens - simplified without type guard
      const metadata = user.user_metadata as Partial<GoogleProviderMetadata>;

      // Check if we have valid Google OAuth data
      if (!metadata?.provider_token || !metadata?.provider_token_expires_at) {
        this.logger.debug('No valid Google provider metadata found');
        next();
        return;
      }

      // Extract Google tokens
      let googleAccessToken = metadata.provider_token;
      const googleRefreshToken = metadata.provider_refresh_token;
      const tokenExpiresAt = metadata.provider_token_expires_at;

      // Check if token needs refresh (5 minutes buffer)
      if (googleAccessToken && tokenExpiresAt && googleRefreshToken) {
        const now = Date.now();
        const bufferTime = 5 * 60 * 1000; // 5 minutes

        if (tokenExpiresAt - now < bufferTime) {
          this.logger.log('🔄 Token expiring soon, refreshing...');

          try {
            const newTokens =
              await this.oauth2Service.refreshAccessToken(googleRefreshToken);

            // Update user metadata with new tokens
            const updatedMetadata: GoogleProviderMetadata = {
              ...metadata,
              provider_token: newTokens.access_token,
              provider_refresh_token:
                newTokens.refresh_token || googleRefreshToken,
              provider_token_expires_at:
                Date.now() + newTokens.expires_in * 1000,
            } as GoogleProviderMetadata;

            const supabaseAdmin = this.supabaseService.getAdminClient();
            await supabaseAdmin.auth.admin.updateUserById(user.id, {
              user_metadata: updatedMetadata,
            });

            googleAccessToken = newTokens.access_token;
            this.logger.log('✅ Token refreshed and updated in Supabase');
          } catch (refreshError) {
            this.logger.error('Failed to refresh token:', refreshError);
            // Continue with expired token - will fail at API call
          }
        }
      }

      // Attach tokens to request
      req.googleAccessToken = googleAccessToken;
      req.googleRefreshToken = googleRefreshToken;

      next();
    } catch (error) {
      this.logger.error('Auth middleware error:', error);
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
