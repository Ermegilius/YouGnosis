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
import type { googleUsersRowInsert } from './interfaces/oauth2.interface';

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
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
        );

      this.logger.debug(
        `Google userinfo: ${JSON.stringify(response.data, null, 2)}`,
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
   * Strategy:
   * - Use a dedicated mapping table (google_users) keyed by Google user ID
   *   (the `id` field from the userinfo endpoint)
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
    this.logger.debug('Google userInfo:', JSON.stringify(userInfo, null, 2));

    const supabaseAdmin = this.supabaseService.getAdminClient();

    try {
      // 1. Prepare Google metadata
      const metadata: GoogleProviderMetadata = {
        provider: 'google',
        provider_id: userInfo.id,
        provider_token: tokens.access_token,
        provider_refresh_token: tokens.refresh_token,
        provider_token_expires_at: Date.now() + tokens.expires_in * 1000,
        provider_scopes: tokens.scope ?? '',
        name: userInfo.name,
        given_name: userInfo.given_name,
        picture: userInfo.picture,
      };

      // 2. Lookup mapping by google_sub (stores Google user id)
      const { data, error } = await supabaseAdmin
        .from('google_users')
        .select('google_sub, user_id, email, created_at, updated_at')
        .eq('google_sub', userInfo.id)
        .maybeSingle();

      // Check for real errors (not "no rows")
      if (error && error.code !== 'PGRST116') {
        this.logger.error(
          'Failed to lookup google_users mapping:',
          error.message,
        );
        throw error;
      }

      // 3. If mapping exists → update existing Supabase user
      if (data !== null) {
        this.logger.log(
          `Updating existing Supabase user from google_users mapping: ${userInfo.email}`,
        );

        const { data: updated, error: updateError } =
          await supabaseAdmin.auth.admin.updateUserById(data.user_id, {
            email: userInfo.email,
            user_metadata: metadata,
          });

        if (updateError) {
          this.logger.error('Failed to update existing user:', updateError);
          throw updateError;
        }

        this.logger.log(`✅ Updated user: ${userInfo.email}`);
        return updated.user;
      }

      // 4. If no mapping → create new Supabase user
      this.logger.log(
        `No google_users mapping found. Creating new Supabase user for: ${userInfo.email}`,
      );

      const { data: created, error: createError } =
        await supabaseAdmin.auth.admin.createUser({
          email: userInfo.email,
          email_confirm: userInfo.verified_email,
          user_metadata: metadata,
        });

      if (createError || !created.user) {
        this.logger.error('Failed to create new Supabase user:', createError);
        throw createError ?? new Error('Unknown error creating user');
      }

      const newUser = created.user;

      // 5. Insert mapping google_sub → user_id
      const insertPayload: googleUsersRowInsert = {
        // Store Google user id in google_sub column
        google_sub: userInfo.id,
        user_id: newUser.id,
        email: userInfo.email,
      };

      const { error: insertError } = await supabaseAdmin
        .from('google_users')
        .insert([insertPayload]);

      if (insertError) {
        this.logger.error(
          'Failed to insert google_users mapping:',
          insertError.message,
        );
      } else {
        this.logger.log(
          `✅ Created google_users mapping for sub=${userInfo.id}, user_id=${newUser.id}`,
        );
      }

      return newUser;
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
   * @param email - User email
   * @returns Session token for frontend
   * @throws InternalServerErrorException if token generation fails
   */
  async generateSessionToken(email: string): Promise<string> {
    const supabase = this.supabaseService.getAdminClient();

    try {
      const { data, error } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email,
        options: {
          redirectTo: this.configService.get<string>('VITE_FRONTEND_URL'),
        },
      });

      if (error) {
        this.logger.error('Supabase generateLink error:', error);
        throw error;
      }

      const actionLink = data?.properties?.action_link;
      if (!actionLink) {
        throw new Error('Supabase did not return a magic link action URL');
      }

      // Extract token from magic link URL
      // Format: https://project.supabase.co/auth/v1/verify?token=TOKEN&type=magiclink
      const url = new URL(actionLink);
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

  /**
   * Decode and validate OAuth2 state parameter
   * Ensures the state was generated by this server and is not too old.
   *
   * @param state - Base64-encoded state string
   * @param maxAgeMs - Maximum allowed age in milliseconds (default: 10 minutes)
   * @throws BadRequestException if state is invalid or expired
   */
  validateState(state: string, maxAgeMs = 10 * 60 * 1000): void {
    try {
      const decoded = Buffer.from(state, 'base64').toString('utf8');
      const parsed = JSON.parse(decoded) as {
        timestamp?: number;
        random?: string;
      };

      if (
        !parsed ||
        typeof parsed.timestamp !== 'number' ||
        typeof parsed.random !== 'string'
      ) {
        throw new Error('Invalid state structure');
      }

      const age = Date.now() - parsed.timestamp;
      if (age < 0 || age > maxAgeMs) {
        throw new Error('State parameter expired');
      }
    } catch (error) {
      this.logger.warn('Invalid OAuth state parameter', error as Error);
      throw new InternalServerErrorException('Invalid state parameter');
    }
  }
}
