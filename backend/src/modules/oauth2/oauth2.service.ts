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
} from '@src/types';
import { lastValueFrom } from 'rxjs';
import type { AxiosResponse, AxiosError } from 'axios';
import type { User } from '@supabase/supabase-js';

/**
 * OAuth2 Service
 * ==============
 * Handles Google OAuth2 authentication flow with YouTube scopes.
 *
 * Flow:
 * 1. Generate authorization URL → User clicks "Sign in with Google"
 * 2. User authorizes on Google → Google redirects back with code
 * 3. Exchange code for tokens → Access token + refresh token
 * 4. Fetch user info from Google
 * 5. Create/update Supabase user with tokens
 * 6. Generate session token for frontend
 *
 * @see https://developers.google.com/identity/protocols/oauth2
 */
@Injectable()
export class OAuth2Service {
  private readonly logger = new Logger(OAuth2Service.name);

  // Google OAuth endpoints
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
   * Generate Google OAuth2 authorization URL
   * User will be redirected to this URL to grant permissions
   *
   * @returns Authorization URL with required YouTube scopes
   */
  generateAuthUrl(): string {
    const clientId = this.configService.getOrThrow<string>(
      'GOOGLE_OAUTH_CLIENT_ID',
    );
    const redirectUri = `${this.configService.getOrThrow<string>('VITE_API_URL')}/oauth2/google/callback`;

    // Request YouTube Analytics and Reporting API scopes
    const scopes = [
      'openid', // Required for user ID
      'email', // Required for user email
      'profile', // Required for user name/picture
      'https://www.googleapis.com/auth/youtube.readonly', // Read YouTube data
      'https://www.googleapis.com/auth/yt-analytics.readonly', // Read analytics
      'https://www.googleapis.com/auth/yt-analytics-monetary.readonly', // Read revenue
    ].join(' ');

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scopes,
      access_type: 'offline', // Request refresh token
      prompt: 'consent', // Force consent screen to get refresh token
      state: this.generateState(),
    });

    return `${this.googleOAuthUrl}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access and refresh tokens
   *
   * @param code - Authorization code from Google OAuth callback
   * @returns Google tokens (access token, refresh token, expiration)
   * @throws UnauthorizedException if exchange fails
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

      this.logger.log('✅ Token exchange successful');
      this.logger.debug(`Scopes granted: ${response.data.scope ?? 'N/A'}`);

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      this.logger.error('Token exchange failed:', axiosError.response?.data);
      throw new UnauthorizedException('Failed to exchange authorization code');
    }
  }

  /**
   * Refresh expired Google access token using refresh token
   *
   * @param refreshToken - Google refresh token
   * @returns New tokens (access token, optional new refresh token, expiration)
   * @throws UnauthorizedException if refresh fails
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
      const axiosError = error as AxiosError;
      this.logger.error('Token refresh failed:', axiosError.response?.data);
      throw new UnauthorizedException('Failed to refresh access token');
    }
  }

  /**
   * Fetch user profile information from Google
   *
   * @param accessToken - Google access token
   * @returns User profile (email, name, picture, etc.)
   * @throws InternalServerErrorException if request fails
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
      const axiosError = error as AxiosError;
      this.logger.error(
        'Failed to fetch user info:',
        axiosError.response?.data,
      );
      throw new InternalServerErrorException(
        'Failed to fetch user information',
      );
    }
  }

  /**
   * Create or update Supabase user with Google OAuth tokens
   * Stores tokens in user_metadata for later use by AuthMiddleware
   *
   * @param userInfo - Google user profile
   * @param tokens - Google OAuth tokens
   * @returns Supabase user object
   * @throws InternalServerErrorException if Supabase operation fails
   */
  async createOrUpdateSupabaseUser(
    userInfo: GoogleUserInfoResponse,
    tokens: GoogleTokensResponse,
  ): Promise<User> {
    const supabase = this.supabaseService.getAdminClient();

    try {
      // Look up user by email (Google user ID is not a UUID)
      const { data: existingUsers, error: lookupError } =
        await supabase.auth.admin.listUsers();

      if (lookupError) {
        throw lookupError;
      }

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
        provider_scopes: tokens.scope ?? '',
        name: userInfo.name,
        given_name: userInfo.given_name,
        picture: userInfo.picture,
      };

      if (existingUser) {
        // Update existing user
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
   * Generate a session token for the user
   * Creates a Supabase magic link and extracts the token
   * Frontend uses this token to establish a session
   *
   * @param userId - Supabase user ID
   * @param email - User email
   * @returns Session token for frontend
   * @throws InternalServerErrorException if token generation fails
   */
  async generateSessionToken(userId: string, email: string): Promise<string> {
    const supabase = this.supabaseService.getAdminClient();

    try {
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

      // Extract token from magic link URL
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
   * Generate CSRF protection state parameter
   * State parameter prevents CSRF attacks in OAuth flow
   *
   * @returns Base64-encoded state with timestamp and random value
   * @private
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
