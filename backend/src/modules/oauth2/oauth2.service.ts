import {
  Injectable,
  Logger,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { SupabaseService } from '../supabase/supabase.service';
import {
  GoogleProviderMetadata,
  GoogleTokensResponse,
  GoogleUserInfoResponse,
} from '@common/youtube.interfaces';
import { lastValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';

@Injectable()
export class OAuth2Service {
  private readonly logger = new Logger(OAuth2Service.name);
  private readonly googleOAuthUrl =
    'https://accounts.google.com/o/oauth2/v2/auth';
  private readonly tokenUrl = 'https://oauth2.googleapis.com/token';
  private readonly userInfoUrl =
    'https://www.googleapis.com/oauth2/v2/userinfo';

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly supabaseService: SupabaseService,
  ) {}

  /**
   * Generate Google OAuth2 authorization URL with YouTube scopes
   */
  generateAuthUrl(): string {
    const clientId = this.configService.getOrThrow<string>(
      'GOOGLE_OAUTH_CLIENT_ID',
    );
    const redirectUri = `${this.configService.getOrThrow<string>('VITE_API_URL')}/oauth2/google/callback`;

    const scopes = [
      'openid',
      'email',
      'profile',
      'https://www.googleapis.com/auth/youtube.readonly',
      'https://www.googleapis.com/auth/yt-analytics.readonly',
      'https://www.googleapis.com/auth/yt-analytics-monetary.readonly',
    ].join(' ');

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scopes,
      access_type: 'offline',
      prompt: 'consent',
      state: this.generateState(),
    });

    return `${this.googleOAuthUrl}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for Google access and refresh tokens
   */
  async exchangeCodeForTokens(code: string): Promise<GoogleTokensResponse> {
    const clientId = this.configService.getOrThrow<string>(
      'GOOGLE_OAUTH_CLIENT_ID',
    );
    const clientSecret = this.configService.getOrThrow<string>(
      'GOOGLE_OAUTH_CLIENT_SECRET',
    );
    const redirectUri = `${this.configService.getOrThrow<string>('VITE_API_URL')}/oauth2/google/callback`;

    try {
      const response: AxiosResponse<GoogleTokensResponse> = await lastValueFrom(
        this.httpService.post<GoogleTokensResponse>(
          this.tokenUrl,
          new URLSearchParams({
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
          }).toString(),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        ),
      );

      this.logger.log('Token exchange successful');
      this.logger.debug(`Scopes granted: ${response.data.scope}`);

      return response.data;
    } catch (error) {
      this.logger.error('Token exchange failed:', error);
      throw new UnauthorizedException('Failed to exchange authorization code');
    }
  }

  /**
   * Get user info from Google using access token
   */
  async getUserInfo(accessToken: string): Promise<GoogleUserInfoResponse> {
    try {
      const response: AxiosResponse<GoogleUserInfoResponse> =
        await lastValueFrom(
          this.httpService.get<GoogleUserInfoResponse>(this.userInfoUrl, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }),
        );

      return response.data;
    } catch (error) {
      this.logger.error('Failed to fetch user info:', error);
      throw new InternalServerErrorException(
        'Failed to fetch user information',
      );
    }
  }

  /**
   * Create or update Supabase user with Google tokens
   * Uses email lookup instead of Google user ID (which is not a UUID)
   */
  async createOrUpdateSupabaseUser(
    userInfo: GoogleUserInfoResponse,
    tokens: GoogleTokensResponse,
  ) {
    const supabase = this.supabaseService.getAdminClient();

    try {
      // Look up user by email
      const { data: existingUsers, error: lookupError } =
        await supabase.auth.admin.listUsers();

      if (lookupError) {
        throw lookupError;
      }

      // Find user with matching email
      const existingUser = existingUsers.users.find(
        (user) => user.email === userInfo.email,
      );

      // Create type-safe metadata
      const metadata: GoogleProviderMetadata = {
        provider: 'google',
        provider_id: userInfo.sub,
        provider_token: tokens.access_token,
        provider_refresh_token: tokens.refresh_token,
        provider_token_expires_at: Date.now() + tokens.expires_in * 1000,
        provider_scopes: tokens.scope || '',
        name: userInfo.name,
        given_name: userInfo.given_name,
        picture: userInfo.picture,
      };

      if (existingUser) {
        // Update existing user with new tokens
        this.logger.log(`Updating existing user: ${userInfo.email}`);

        const { data, error } = await supabase.auth.admin.updateUserById(
          existingUser.id,
          {
            user_metadata: metadata,
          },
        );

        if (error) {
          this.logger.error('Failed to update user:', error);
          throw error;
        }

        this.logger.log(`✅ Updated user: ${userInfo.email}`);
        return data.user;
      } else {
        // Create new user
        this.logger.log(`Creating new user: ${userInfo.email}`);

        const { data, error } = await supabase.auth.admin.createUser({
          email: userInfo.email,
          email_confirm: userInfo.email_verified,
          user_metadata: metadata,
        });

        if (error) {
          this.logger.error('Failed to create user:', error);
          throw error;
        }

        this.logger.log(`✅ Created new user: ${userInfo.email}`);
        return data.user;
      }
    } catch (error) {
      this.logger.error('Failed to create/update Supabase user:', error);
      throw new InternalServerErrorException(
        'Failed to create or update user session',
      );
    }
  }

  /**
   * Generate a session token for the user using email
   * This creates a magic link that the frontend can use to establish a session
   */
  async generateSessionToken(userId: string, email: string): Promise<string> {
    const supabase = this.supabaseService.getAdminClient();

    try {
      // Generate a magic link for the user
      const { data, error } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: email,
        options: {
          redirectTo: this.configService.get<string>('VITE_FRONTEND_URL'),
        },
      });

      if (error) {
        this.logger.error('Supabase generateLink error:', error);
        throw error;
      }

      // Extract token from the magic link
      // Format: https://project.supabase.co/auth/v1/verify?token=TOKEN&type=magiclink
      const url = new URL(data.properties.action_link);
      const token = url.searchParams.get('token');

      if (!token) {
        throw new Error('Failed to extract session token from magic link');
      }

      this.logger.log(`✅ Generated session token for user: ${email}`);
      return token;
    } catch (error) {
      this.logger.error('Failed to generate session token:', error);
      throw new InternalServerErrorException(
        'Failed to generate session token',
      );
    }
  }

  /**
   * Refresh Google access token using refresh token
   */
  async refreshAccessToken(
    refreshToken: string,
  ): Promise<GoogleTokensResponse> {
    const clientId = this.configService.getOrThrow<string>(
      'GOOGLE_OAUTH_CLIENT_ID',
    );
    const clientSecret = this.configService.getOrThrow<string>(
      'GOOGLE_OAUTH_CLIENT_SECRET',
    );

    try {
      const response: AxiosResponse<GoogleTokensResponse> = await lastValueFrom(
        this.httpService.post<GoogleTokensResponse>(
          this.tokenUrl,
          new URLSearchParams({
            refresh_token: refreshToken,
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'refresh_token',
          }).toString(),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        ),
      );

      this.logger.log('✅ Access token refreshed successfully');
      return response.data;
    } catch (error) {
      this.logger.error('Failed to refresh access token:', error);
      throw new UnauthorizedException('Failed to refresh access token');
    }
  }

  /**
   * Generate CSRF protection state parameter
   */
  private generateState(): string {
    return Buffer.from(
      JSON.stringify({
        timestamp: Date.now(),
        random: Math.random().toString(36),
      }),
    ).toString('base64');
  }
}
