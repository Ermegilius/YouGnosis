import { Controller, Get, Logger, Headers } from '@nestjs/common';
import { YouTubeService } from './youtube.service';

@Controller('youtube')
export class YouTubeController {
  private readonly logger = new Logger(YouTubeController.name);

  constructor(private readonly youtubeService: YouTubeService) {}

  @Get('report-types')
  async fetchAllReportTypes(@Headers('Authorization') authHeader: string) {
    this.logger.log('Fetching report types from YouTube Reporting API...');
    const accessToken = authHeader?.replace('Bearer ', '');
    if (!accessToken) {
      throw new Error('Authorization token is missing');
    }
    return this.youtubeService.getAllReportTypes(accessToken);
  }
}
