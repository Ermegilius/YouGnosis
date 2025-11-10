import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { OAuth2TokenResponse } from './interfaces/oauth2.interface';

@Injectable()
export class OAuth2Service {
  private readonly logger = new Logger(OAuth2Service.name);
  private readonly googleOAuthUrl =
    'https://accounts.google.com/o/oauth2/v2/auth';
  private readonly tokenUrl = 'https://oauth2.googleapis.com/token';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  // Generate the Google OAuth2 consent screen URL
  generateAuthUrl(): string {
    const clientId = this.configService.get<string>('GOOGLE_OAUTH_CLIENT_ID');
    const redirectUri =
      this.configService.get<string>('VITE_API_URL') + '/oauth2/callback';
    const scopes = [
      'https://www.googleapis.com/auth/yt-analytics-monetary.readonly',
      'https://www.googleapis.com/auth/yt-analytics.readonly',
    ].join(' ');

    const url = `${this.googleOAuthUrl}?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes}&access_type=offline&prompt=consent`;
    return url;
  }

  // Exchange authorization code for access and refresh tokens
  async exchangeCodeForTokens(
    code: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const clientId = this.configService.get<string>('GOOGLE_OAUTH_CLIENT_ID');
    const clientSecret = this.configService.get<string>(
      'GOOGLE_OAUTH_CLIENT_SECRET',
    );
    const redirectUri =
      this.configService.get<string>('VITE_API_URL') + '/oauth2/callback';

    const response = await lastValueFrom(
      this.httpService.post<OAuth2TokenResponse>(this.tokenUrl, {
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    );

    const { access_token, refresh_token } = response.data;
    return { accessToken: access_token, refreshToken: refresh_token };
  }

  // Refresh the access token using the refresh token
  async refreshAccessToken(refreshToken: string): Promise<string> {
    const clientId = this.configService.get<string>('GOOGLE_OAUTH_CLIENT_ID');
    const clientSecret = this.configService.get<string>(
      'GOOGLE_OAUTH_CLIENT_SECRET',
    );

    const response = await lastValueFrom(
      this.httpService.post<OAuth2TokenResponse>(this.tokenUrl, {
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    );

    return response.data.access_token;
  }
}
