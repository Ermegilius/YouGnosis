import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { YouTubeService } from './youtube.service';
import { YouTubeJob, YouTubeReportType } from '@common/youtube.types';
import { AuthenticatedRequest } from '../../middleware/interfaces/authenticated-request.interface';

// Simple DTO type - no class needed
type CreateJobDto = Pick<YouTubeJob, 'reportTypeId' | 'name'>;

@Controller('youtube')
export class YouTubeController {
  private readonly logger = new Logger(YouTubeController.name);

  constructor(private readonly youtubeService: YouTubeService) {}

  /**
   * Fetch all available YouTube report types
   * Requires valid Google OAuth token with YouTube scopes
   */
  @Get('report-types')
  async fetchAllReportTypes(
    @Req() req: AuthenticatedRequest,
  ): Promise<YouTubeReportType[]> {
    this.logger.log('Fetching report types from YouTube Reporting API...');

    const googleAccessToken = req.googleAccessToken;

    if (!googleAccessToken) {
      throw new UnauthorizedException(
        'Google access token not found. Please re-authenticate.',
      );
    }

    return this.youtubeService.getAllReportTypes(googleAccessToken);
  }

  /**
   * Create a new YouTube reporting job
   * Requires valid Google OAuth token with YouTube scopes
   */
  @Post('create-job')
  async createReportingJob(
    @Req() req: AuthenticatedRequest,
    @Body() createJobDto: CreateJobDto,
  ): Promise<YouTubeJob> {
    this.logger.log('Creating a new YouTube Reporting job...');

    const googleAccessToken = req.googleAccessToken;

    if (!googleAccessToken) {
      throw new UnauthorizedException(
        'Google access token not found. Please re-authenticate.',
      );
    }

    const userId = req.user?.id;

    if (!userId) {
      throw new UnauthorizedException('User ID not found in request.');
    }

    return this.youtubeService.createReportingJob(
      googleAccessToken,
      createJobDto.reportTypeId,
      createJobDto.name,
      userId,
    );
  }
}
