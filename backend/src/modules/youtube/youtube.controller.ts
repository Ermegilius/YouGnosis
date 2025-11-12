import {
  Controller,
  Get,
  Logger,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { YouTubeService } from './youtube.service';

@Controller('youtube')
export class YouTubeController {
  private readonly logger = new Logger(YouTubeController.name);

  constructor(private readonly youtubeService: YouTubeService) {}

  @Get('report-types')
  async fetchAllReportTypes(@Req() req: Request) {
    this.logger.log('Fetching report types from YouTube Reporting API...');

    // Extract Google access token from request (set by AuthMiddleware)
    const googleAccessToken = (req as any).googleAccessToken;

    if (!googleAccessToken) {
      throw new UnauthorizedException(
        'Google access token not found. Please re-authenticate.',
      );
    }

    return this.youtubeService.getAllReportTypes(googleAccessToken);
  }
}
