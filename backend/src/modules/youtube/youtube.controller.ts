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

    // Extract user ID from request (set by auth middleware)
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      throw new UnauthorizedException('User ID is required');
    }

    return this.youtubeService.getAllReportTypes(userId);
  }
}
