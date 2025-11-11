import {
  Controller,
  Get,
  Query,
  Redirect,
  Logger,
  Res,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { OAuth2Service } from './oauth2.service';

@Controller('oauth2')
export class OAuth2Controller {
  private readonly logger = new Logger(OAuth2Controller.name);

  constructor(private readonly oauth2Service: OAuth2Service) {}

  /**
   * Redirect to Google OAuth2 consent screen
   * Requires authenticated user (x-user-id header)
   */
  @Get('authorize')
  @Redirect()
  authorize(@Req() req: Request) {
    // Get user ID from Supabase auth
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      throw new UnauthorizedException(
        'User must be authenticated to connect Google account',
      );
    }

    const url = this.oauth2Service.generateAuthUrl(userId);
    return { url };
  }

  /**
   * Handle the callback from Google
   */
  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    if (!code) {
      this.logger.error('No authorization code received from Google');
      return res.redirect(
        `${process.env.VITE_API_URL?.replace('/api', '')}/dashboard?error=no_code`,
      );
    }

    if (!state) {
      this.logger.error('No state parameter received');
      return res.redirect(
        `${process.env.VITE_API_URL?.replace('/api', '')}/dashboard?error=invalid_state`,
      );
    }

    try {
      // Validate state and get user ID
      const userId = this.oauth2Service.validateStateAndGetUserId(state);

      this.logger.log(`Received authorization code for user ${userId}`);

      await this.oauth2Service.exchangeCodeForTokens(code, userId);

      this.logger.log(`Google tokens successfully stored for user ${userId}`);

      // Redirect to dashboard with success message
      return res.redirect(
        `${process.env.VITE_API_URL?.replace('/api', '')}/dashboard?google_connected=true`,
      );
    } catch (error) {
      this.logger.error('Failed to process OAuth callback', error);
      return res.redirect(
        `${process.env.VITE_API_URL?.replace('/api', '')}/dashboard?error=token_exchange_failed`,
      );
    }
  }
}
