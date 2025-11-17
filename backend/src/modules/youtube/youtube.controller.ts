import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Query,
  Req,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { YouTubeService } from './youtube.service';
import {
  YouTubeJob,
  YouTubeReportType,
  YouTubeReport,
  AuthenticatedRequest,
  CreateJobRequest,
} from '@src/types/index';

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
   * Fetch all existing YouTube reporting jobs for the authenticated user
   * Requires valid Google OAuth token with YouTube scopes
   */
  @Get('jobs')
  async listReportingJobs(
    @Req() req: AuthenticatedRequest,
  ): Promise<YouTubeJob[]> {
    this.logger.log('Fetching existing YouTube Reporting jobs...');

    const googleAccessToken = req.googleAccessToken;

    if (!googleAccessToken) {
      throw new UnauthorizedException(
        'Google access token not found. Please re-authenticate.',
      );
    }

    return this.youtubeService.listReportingJobs(googleAccessToken);
  }

  /**
   * Create a new YouTube reporting job
   * Requires valid Google OAuth token with YouTube scopes
   * @param createJobDto - DTO containing reportTypeId and name
   * @returns Created YouTubeJob
   */
  @Post('create-job')
  async createReportingJob(
    @Req() req: AuthenticatedRequest,
    @Body() createJobDto: CreateJobRequest,
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

  /**
   * List all available reports for a specific job
   * Requires valid Google OAuth token with YouTube scopes
   *
   * @param jobId - The YouTube job ID to fetch reports for
   * @returns {Promise<YouTubeReport[]>} - List of reports for the job
   */
  @Get('reports')
  async listReports(
    @Req() req: AuthenticatedRequest,
    @Query('jobId') jobId: string,
  ): Promise<YouTubeReport[]> {
    this.logger.log(`Fetching reports for job: ${jobId}`);

    if (!jobId) {
      throw new BadRequestException('jobId query parameter is required');
    }

    const googleAccessToken = req.googleAccessToken;

    if (!googleAccessToken) {
      throw new UnauthorizedException(
        'Google access token not found. Please re-authenticate.',
      );
    }

    return this.youtubeService.listReports(googleAccessToken, jobId);
  }

  /**
   * Download a specific report's data
   * Requires valid Google OAuth token with YouTube scopes
   *
   * @param reportId - The YouTube report ID to download
   * @param jobId - The YouTube job ID the report belongs to
   * @returns Report data as CSV string
   */
  @Get('download-report')
  async downloadReport(
    @Req() req: AuthenticatedRequest,
    @Query('reportId') reportId: string,
    @Query('jobId') jobId: string,
  ): Promise<{ data: string; filename: string }> {
    this.logger.log(`Downloading report: ${reportId}`);

    if (!reportId || !jobId) {
      throw new BadRequestException(
        'reportId and jobId query parameters are required',
      );
    }

    const googleAccessToken = req.googleAccessToken;

    if (!googleAccessToken) {
      throw new UnauthorizedException(
        'Google access token not found. Please re-authenticate.',
      );
    }

    const data = await this.youtubeService.downloadReport(
      googleAccessToken,
      jobId,
      reportId,
    );

    return {
      data,
      filename: `youtube_report_${reportId}.csv`,
    };
  }
}
