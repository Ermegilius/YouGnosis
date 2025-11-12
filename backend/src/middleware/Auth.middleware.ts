import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { SupabaseService } from '../modules/supabase/supabase.service';
import { OAuth2Service } from '../modules/oauth2/oauth2.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AuthMiddleware.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly oauth2Service: OAuth2Service,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
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

      // Attach user info
      (req as any).user = {
        id: user.id,
        email: user.email,
      };

      // Log user metadata for debugging (optional - remove in production)
      if (process.env.NODE_ENV === 'development') {
        this.logger.debug('=== User Metadata ===');
        this.logger.debug(JSON.stringify(user.user_metadata, null, 2));
      }

      // Extract Google tokens
      let googleAccessToken = user.user_metadata?.provider_token || null;
      const googleRefreshToken =
        user.user_metadata?.provider_refresh_token || null;
      const tokenExpiresAt =
        user.user_metadata?.provider_token_expires_at || null;

      // Check if token needs refresh
      if (googleAccessToken && tokenExpiresAt && googleRefreshToken) {
        const now = Date.now();
        const bufferTime = 5 * 60 * 1000; // 5 minutes buffer

        if (tokenExpiresAt - now < bufferTime) {
          this.logger.log('🔄 Refreshing Google access token...');

          try {
            // Refresh the token
            const newTokens =
              await this.oauth2Service.refreshAccessToken(googleRefreshToken);

            // Update user metadata with new token
            const supabase = this.supabaseService.getAdminClient();
            await supabase.auth.admin.updateUserById(user.id, {
              user_metadata: {
                ...user.user_metadata,
                provider_token: newTokens.access_token,
                provider_token_expires_at:
                  Date.now() + newTokens.expires_in * 1000,
              },
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
      (req as any).googleAccessToken = googleAccessToken;
      (req as any).googleRefreshToken = googleRefreshToken;

      next();
    } catch (error) {
      this.logger.error('Auth middleware error:', error);
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
