import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { YouTubeReportType } from './interfaces/youtube.interface';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class YouTubeService {
  private readonly logger = new Logger(YouTubeService.name);
  private readonly baseUrl = 'https://youtubereporting.googleapis.com/v1';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async getAllReportTypes(accessToken: string) {
    try {
      const url = `${this.baseUrl}/reportTypes`;
      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };

      const response = await lastValueFrom(
        this.httpService.get<{ reportTypes: YouTubeReportType[] }>(url, {
          headers,
        }),
      );
      return response.data.reportTypes;
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error('Failed to fetch report types', error.message);
        throw new Error(`Failed to fetch report types: ${error.message}`);
      } else {
        this.logger.error('An unknown error occurred');
        throw new Error('An unknown error occurred');
      }
    }
  }
}
