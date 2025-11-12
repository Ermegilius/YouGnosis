import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import type { YouTubeReportType } from '@common/youtube.interfaces';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class YouTubeService {
  private readonly logger = new Logger(YouTubeService.name);
  private readonly baseUrl = 'https://youtubereporting.googleapis.com/v1';

  constructor(private readonly httpService: HttpService) {}

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

      const response = await lastValueFrom(
        this.httpService.get<{ reportTypes: YouTubeReportType[] }>(url, {
          headers,
        }),
      );

      return response.data.reportTypes || [];
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error('Failed to fetch report types', error.message);
        throw new Error(`Failed to fetch report types: ${error.message}`);
      }
      throw new Error('An unknown error occurred');
    }
  }
}
