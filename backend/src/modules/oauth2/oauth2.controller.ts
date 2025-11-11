import { Controller, Get, Query, Redirect, Logger } from '@nestjs/common';
import { OAuth2Service } from './oauth2.service';

@Controller('oauth2')
export class OAuth2Controller {
  private readonly logger = new Logger(OAuth2Controller.name);

  constructor(private readonly oauth2Service: OAuth2Service) {}

  // Redirect to Google OAuth2 consent screen
  @Get('authorize')
  @Redirect()
  authorize() {
    const url = this.oauth2Service.generateAuthUrl();
    return { url };
  }

  // Handle the callback from Google
  @Get('callback')
  async callback(@Query('code') code: string) {
    this.logger.log('Received authorization code from Google');
    const tokens = await this.oauth2Service.exchangeCodeForTokens(code);
    this.logger.log('Successfully exchanged code for tokens');
    return tokens; // Return tokens or store them securely
  }
}
