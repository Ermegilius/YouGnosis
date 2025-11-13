import {
  Injectable,
  Logger,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import type { YouTubeReportType, YouTubeJob } from '@common/youtube.interfaces';
import { lastValueFrom } from 'rxjs';
import { SupabaseService } from '../supabase/supabase.service';
import { AxiosResponse, AxiosError } from 'axios';

/**
 * YouTube Reporting API response for report types
 */
interface ReportTypesResponse {
  reportTypes: YouTubeReportType[];
}

@Injectable()
export class YouTubeService {
  private readonly logger = new Logger(YouTubeService.name);
  private readonly baseUrl = 'https://youtubereporting.googleapis.com/v1';

  constructor(
    private readonly httpService: HttpService,
    private readonly supabaseService: SupabaseService,
  ) {}

  /**
   * Fetch all YouTube report types using Google token from Supabase session
   */
  async getAllReportTypes(
    googleAccessToken: string,
  ): Promise<YouTubeReportType[]> {
    if (!googleAccessToken) {
      throw new UnauthorizedException(
        'No Google access token found. Please re-authenticate.',
      );
    }

    try {
      const url = `${this.baseUrl}/reportTypes`;
      const headers = {
        Authorization: `Bearer ${googleAccessToken}`,
      };

      this.logger.debug('Fetching YouTube report types');

      const response: AxiosResponse<ReportTypesResponse> = await lastValueFrom(
        this.httpService.get<ReportTypesResponse>(url, { headers }),
      );

      return response.data.reportTypes || [];
    } catch (error: unknown) {
      this.handleYouTubeApiError(error, 'Failed to fetch report types');
    }
  }

  /**
   * Create a new YouTube Reporting job and save it to the database
   */
  async createReportingJob(
    googleAccessToken: string,
    reportTypeId: string,
    name: string,
    userId: string,
  ): Promise<YouTubeJob> {
    if (!googleAccessToken) {
      throw new UnauthorizedException(
        'No Google access token found. Please re-authenticate.',
      );
    }

    try {
      const url = `${this.baseUrl}/jobs`;
      const headers = {
        Authorization: `Bearer ${googleAccessToken}`,
      };
      const body = {
        reportTypeId,
        name,
      };

      this.logger.debug('Creating a new reporting job');

      const response: AxiosResponse<YouTubeJob> = await lastValueFrom(
        this.httpService.post<YouTubeJob>(url, body, { headers }),
      );

      const job = response.data;

      // Save the job to the database
      await this.saveJobToDatabase(job, userId);

      this.logger.log('Job saved to database successfully');
      return job;
    } catch (error: unknown) {
      this.handleYouTubeApiError(error, 'Failed to create reporting job');
    }
  }

  /**
   * Save YouTube job to database
   * Private helper method to separate concerns
   */
  private async saveJobToDatabase(
    job: YouTubeJob,
    userId: string,
  ): Promise<void> {
    try {
      const supabase = this.supabaseService.getClient();
      const { error } = await supabase.from('youtube_jobs').insert({
        user_id: userId,
        job_id: job.id,
        report_type_id: job.reportTypeId,
        name: job.name,
        create_time: job.createTime,
      });

      if (error) {
        this.logger.error('Failed to save job to database', error.message);
        throw new InternalServerErrorException(
          'Failed to save job to database',
        );
      }
    } catch (error: unknown) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      this.logger.error('Unexpected error saving job to database:', error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while saving job',
      );
    }
  }

  /**
   * Handle YouTube API errors with proper logging and type checking
   * Private helper method to centralize error handling
   */
  private handleYouTubeApiError(error: unknown, context: string): never {
    if (error instanceof AxiosError) {
      const status = error.response?.status;
      const message = error.response?.data?.error?.message || error.message;

      this.logger.error(`${context}: ${message}`, error.stack);

      if (status === 401 || status === 403) {
        throw new UnauthorizedException(
          'YouTube API authentication failed. Please re-authenticate.',
        );
      }

      throw new InternalServerErrorException(`YouTube API error: ${message}`);
    }

    if (error instanceof Error) {
      this.logger.error(`${context}: ${error.message}`, error.stack);
      throw new InternalServerErrorException(error.message);
    }

    this.logger.error(`${context}: Unknown error`, error);
    throw new InternalServerErrorException('An unknown error occurred');
  }
}
