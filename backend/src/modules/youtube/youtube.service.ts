import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import type { YouTubeReportType } from '@common/youtube.interfaces';
import { lastValueFrom } from 'rxjs';
import { OAuth2Service } from '../oauth2/oauth2.service';

@Injectable()
export class YouTubeService {
  private readonly logger = new Logger(YouTubeService.name);
  private readonly baseUrl = 'https://youtubereporting.googleapis.com/v1';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly oauth2Service: OAuth2Service,
  ) {}

  /**
   * Fetch all YouTube report types using stored user tokens
   */
  async getAllReportTypes(userId: string): Promise<YouTubeReportType[]> {
    try {
      // Get valid access token (auto-refreshes if needed)
      const accessToken = await this.oauth2Service.getValidAccessToken(userId);

      const url = `${this.baseUrl}/reportTypes`;
      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };

      this.logger.debug(`Fetching report types for user ${userId}`);

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
