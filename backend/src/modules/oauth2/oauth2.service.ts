import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import {
  OAuth2TokenResponse,
  GoogleTokensInsert,
  GoogleTokensRow,
  StoredGoogleTokens,
} from './interfaces/oauth2.interface';
import { SupabaseService } from '../supabase/supabase.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class OAuth2Service {
  private readonly logger = new Logger(OAuth2Service.name);
  private readonly googleOAuthUrl =
    'https://accounts.google.com/o/oauth2/v2/auth';
  private readonly tokenUrl = 'https://oauth2.googleapis.com/token';

  // TODO: Replace with Redis in production
  private stateStore = new Map<string, { userId: string; expiresAt: number }>();

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly supabaseService: SupabaseService,
  ) {
    // Clean up expired states every 5 minutes
    setInterval(() => this.cleanupExpiredStates(), 5 * 60 * 1000);
  }

  private cleanupExpiredStates(): void {
    const now = Date.now();
    for (const [state, data] of this.stateStore.entries()) {
      if (data.expiresAt < now) {
        this.stateStore.delete(state);
      }
    }
  }

  /**
   * Generate the Google OAuth2 consent screen URL with state parameter
   */
  generateAuthUrl(userId: string): string {
    const clientId = this.configService.get<string>('GOOGLE_OAUTH_CLIENT_ID');
    const apiUrl = this.configService.get<string>('VITE_API_URL');
    const redirectUri = `${apiUrl}/oauth2/callback`;

    // Generate unique state to prevent CSRF and track user
    const state = uuidv4();
    this.stateStore.set(state, {
      userId,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    });

    this.logger.debug(`Generated OAuth state for user ${userId}: ${state}`);

    const scopes = [
      'https://www.googleapis.com/auth/yt-analytics-monetary.readonly',
      'https://www.googleapis.com/auth/yt-analytics.readonly',
      'https://www.googleapis.com/auth/youtube.readonly',
    ].join(' ');

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: scopes,
      access_type: 'offline',
      prompt: 'consent',
      state,
    });

    return `${this.googleOAuthUrl}?${params.toString()}`;
  }

  /**
   * Validate state and get user ID
   */
  validateStateAndGetUserId(state: string): string {
    const data = this.stateStore.get(state);

    if (!data) {
      this.logger.error(`Invalid state parameter: ${state}`);
      throw new Error('Invalid or expired state parameter');
    }

    if (data.expiresAt < Date.now()) {
      this.stateStore.delete(state);
      this.logger.error(`Expired state parameter: ${state}`);
      throw new Error('State parameter expired');
    }

    this.stateStore.delete(state);
    this.logger.debug(`Validated state for user: ${data.userId}`);
    return data.userId;
  }

  /**
   * Exchange authorization code for access and refresh tokens, then store them
   */
  async exchangeCodeForTokens(
    code: string,
    userId: string,
  ): Promise<StoredGoogleTokens> {
    const clientId = this.configService.get<string>('GOOGLE_OAUTH_CLIENT_ID');
    const clientSecret = this.configService.get<string>(
      'GOOGLE_OAUTH_CLIENT_SECRET',
    );
    const apiUrl = this.configService.get<string>('VITE_API_URL');
    const redirectUri = `${apiUrl}/oauth2/callback`;

    try {
      const response = await lastValueFrom(
        this.httpService.post<OAuth2TokenResponse>(this.tokenUrl, {
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      );

      const { access_token, refresh_token, expires_in, scope } = response.data;

      // Calculate expiration time
      const expiresAt = new Date(Date.now() + expires_in * 1000);

      // Store tokens in database
      await this.storeTokens(userId, {
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt,
        scope: scope || '',
      });

      this.logger.log(`Google API tokens stored for user ${userId}`);

      return {
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt,
        scope: scope || '',
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(
          `Failed to exchange code for tokens: ${error.message}`,
          error.stack,
        );
        throw new Error(`Failed to exchange code for tokens: ${error.message}`);
      }
      throw new Error('An unknown error occurred during token exchange');
    }
  }

  /**
   * Store or update Google tokens in database
   */
  private async storeTokens(
    userId: string,
    tokens: StoredGoogleTokens,
  ): Promise<void> {
    const supabase = this.supabaseService.getAdminClient();

    const tokenData: GoogleTokensInsert = {
      user_id: userId,
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      expires_at: tokens.expiresAt.toISOString(),
      scope: tokens.scope,
    };

    const { error } = await supabase
      .from('google_tokens')
      .upsert(tokenData, { onConflict: 'user_id' });

    if (error) {
      this.logger.error(`Failed to store tokens: ${error.message}`);
      throw new Error(`Failed to store tokens: ${error.message}`);
    }
  }

  /**
   * Get valid access token for a user (auto-refresh if expired)
   */
  async getValidAccessToken(userId: string): Promise<string> {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from('google_tokens')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      throw new Error('No tokens found for user. Please re-authenticate.');
    }

    // Validate the data structure before accessing properties
    if (
      typeof data !== 'object' ||
      !('access_token' in data) ||
      !('refresh_token' in data) ||
      !('expires_at' in data)
    ) {
      throw new Error('Invalid token data structure');
    }

    const tokens = data;
    const expiresAt = new Date(tokens.expires_at);

    // Check if token is expired or expires in less than 5 minutes
    if (expiresAt.getTime() - Date.now() < 5 * 60 * 1000) {
      this.logger.log(`Token expired for user ${userId}, refreshing...`);
      return this.refreshAndStoreAccessToken(userId, tokens.refresh_token);
    }

    return tokens.access_token;
  }

  /**
   * Refresh access token using refresh token and update database
   */
  private async refreshAndStoreAccessToken(
    userId: string,
    refreshToken: string,
  ): Promise<string> {
    const clientId = this.configService.get<string>('GOOGLE_OAUTH_CLIENT_ID');
    const clientSecret = this.configService.get<string>(
      'GOOGLE_OAUTH_CLIENT_SECRET',
    );

    try {
      const response = await lastValueFrom(
        this.httpService.post<OAuth2TokenResponse>(this.tokenUrl, {
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        }),
      );

      const { access_token, expires_in } = response.data;
      const expiresAt = new Date(Date.now() + expires_in * 1000);

      // Update only access_token and expires_at
      const supabase = this.supabaseService.getAdminClient();
      const { error } = await supabase
        .from('google_tokens')
        .update({
          access_token,
          expires_at: expiresAt.toISOString(),
        })
        .eq('user_id', userId);

      if (error) {
        throw new Error(`Failed to update tokens: ${error.message}`);
      }

      this.logger.log(`Access token refreshed for user ${userId}`);
      return access_token;
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(
          `Failed to refresh access token: ${error.message}`,
          error.stack,
        );
        throw new Error(`Failed to refresh access token: ${error.message}`);
      }
      throw new Error('An unknown error occurred while refreshing token');
    }
  }

  /**
   * Delete tokens for a user (logout)
   */
  async deleteTokens(userId: string): Promise<void> {
    const supabase = this.supabaseService.getAdminClient();

    const { error } = await supabase
      .from('google_tokens')
      .delete()
      .eq('user_id', userId);

    if (error) {
      this.logger.error(`Failed to delete tokens: ${error.message}`);
      throw new Error(`Failed to delete tokens: ${error.message}`);
    }

    this.logger.log(`Tokens deleted for user ${userId}`);
  }
}
