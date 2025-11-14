import {
  Controller,
  Get,
  Query,
  Redirect,
  Res,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { OAuth2Service } from './oauth2.service';
import { ConfigService } from '@nestjs/config';

@Controller('oauth2/google')
export class OAuth2Controller {
  private readonly logger = new Logger(OAuth2Controller.name);

  constructor(
    private readonly oauth2Service: OAuth2Service,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Initiate Google OAuth flow with YouTube scopes
   * Redirects user to Google's OAuth consent page
   *
   * @returns Object with redirect URL for NestJS @Redirect decorator
   */
  @Get('authorize')
  @Redirect()
  authorize(): { url: string } {
    const url = this.oauth2Service.generateAuthUrl();
    this.logger.log('Redirecting to Google OAuth with YouTube scopes');
    return { url };
  }

  /**
   * Handle Google OAuth callback
   * Exchanges code for tokens and creates Supabase session
   *
   * @param code - Authorization code from Google
   * @param state - CSRF protection state parameter
   * @param res - Express Response object for manual redirect
   * @returns Promise that resolves when redirect is sent
   */
  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ): Promise<void> {
    // Get frontend URL from environment
    const frontendUrl =
      this.configService.get<string>('VITE_FRONTEND_URL') ||
      'http://localhost:8000';

    try {
      // Validate authorization code
      if (!code) {
        this.logger.error('No authorization code received from Google');
        throw new BadRequestException('No authorization code received');
      }

      // Validate state (CSRF protection)
      if (!state) {
        this.logger.error('No state parameter received');
        throw new BadRequestException('Invalid state parameter');
      }

      this.logger.log('Received Google OAuth callback with code');

      // Exchange code for tokens
      const tokens = await this.oauth2Service.exchangeCodeForTokens(code);
      this.logger.log('Successfully exchanged code for Google tokens');

      // Get user info from Google
      const userInfo = await this.oauth2Service.getUserInfo(
        tokens.access_token,
      );
      this.logger.log(`Retrieved user info for: ${userInfo.email}`);

      // Create or update Supabase user with Google tokens
      const user = await this.oauth2Service.createOrUpdateSupabaseUser(
        userInfo,
        tokens,
      );
      this.logger.log('Supabase user created/updated successfully');

      // Generate a session token for the frontend (pass email)
      const sessionToken = await this.oauth2Service.generateSessionToken(
        user.id,
        userInfo.email,
      );

      // Redirect to frontend dashboard with session token
      const redirectUrl = `${frontendUrl}/auth/callback?session_token=${sessionToken}&state=success`;
      this.logger.log(`Redirecting to frontend: ${redirectUrl}`);

      res.redirect(redirectUrl);
    } catch (error) {
      this.logger.error('OAuth callback error:', error);

      const errorMessage =
        error instanceof Error ? error.message : 'oauth_failed';
      res.redirect(`${frontendUrl}/?error=${encodeURIComponent(errorMessage)}`);
    }
  }
}
