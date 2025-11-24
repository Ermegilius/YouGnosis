import {
  Injectable,
  Logger,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import type {
  YouTubeReportType,
  YouTubeJob,
  YouTubeReport,
} from '@common/youtube.types';
import type { Database, Json } from '@common/supabase.types';
import { lastValueFrom } from 'rxjs';
import { SupabaseService } from '../supabase/supabase.service';
import { AxiosResponse, AxiosError } from 'axios';
import {
  isGoogleProviderMetadata,
  isYouTubeApiErrorResponse,
} from '@src/types';
import { Cron } from '@nestjs/schedule';
import { createHash } from 'crypto';

/**
 * YouTube Reporting API response for report types
 */
interface ReportTypesResponse {
  reportTypes: YouTubeReportType[];
}

export interface GetDailyMetricsResponse {
  data: YoutubeDailyMetricRow[];
}

/**
 * YouTube Reporting API response for reports list
 */
interface ReportsResponse {
  reports?: YouTubeReport[];
}

type YoutubeDailyMetricRow =
  Database['public']['Tables']['youtube_daily_metrics']['Row'];

type YoutubeDailyMetricInsert =
  Database['public']['Tables']['youtube_daily_metrics']['Insert'];

interface ParsedMetricRow {
  reportDate: string;
  channelId: string;
  videoId: string | null;
  views: number;
  watchTimeMinutes: number;
  estimatedRevenue: number | null;
  subscribersGained: number;
  subscribersLost: number;
  metricPayload: Record<string, unknown>;
}

@Injectable()
export class YouTubeService {
  private readonly logger = new Logger(YouTubeService.name);
  private readonly baseUrl = 'https://youtubereporting.googleapis.com/v1';
  private readonly dataApiBaseUrl = 'https://www.googleapis.com/youtube/v3';

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
        'Content-Type': 'application/json',
      };
      const body = {
        reportTypeId,
        name,
      };

      this.logger.debug('Creating a new reporting job');
      this.logger.debug(`Request body: ${JSON.stringify(body, null, 2)}`);

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
   * List all existing YouTube Reporting jobs
   */
  async listReportingJobs(googleAccessToken: string): Promise<YouTubeJob[]> {
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

      this.logger.debug('Fetching existing YouTube reporting jobs');

      interface JobsResponse {
        jobs?: YouTubeJob[];
      }

      const response: AxiosResponse<JobsResponse> = await lastValueFrom(
        this.httpService.get<JobsResponse>(url, { headers }),
      );

      return response.data.jobs || [];
    } catch (error: unknown) {
      this.handleYouTubeApiError(error, 'Failed to fetch reporting jobs');
    }
  }

  /**
   * List all available reports for a specific job
   * Reports are generated periodically by YouTube (usually daily)
   *
   * @param googleAccessToken - Google OAuth access token
   * @param jobId - YouTube job ID to fetch reports for
   * @returns Array of available reports with download URLs
   */
  async listReports(
    googleAccessToken: string,
    jobId: string,
  ): Promise<YouTubeReport[]> {
    if (!googleAccessToken) {
      throw new UnauthorizedException(
        'No Google access token found. Please re-authenticate.',
      );
    }

    try {
      const url = `${this.baseUrl}/jobs/${jobId}/reports`;
      const headers = {
        Authorization: `Bearer ${googleAccessToken}`,
      };

      this.logger.debug(`Fetching reports for job: ${jobId}`);

      const response: AxiosResponse<ReportsResponse> = await lastValueFrom(
        this.httpService.get<ReportsResponse>(url, { headers }),
      );

      const reports = response.data.reports || [];
      this.logger.log(`Found ${reports.length} reports for job ${jobId}`);

      return reports;
    } catch (error: unknown) {
      this.handleYouTubeApiError(error, 'Failed to fetch reports');
    }
  }

  /**
   * Download report data from YouTube
   * Returns raw CSV data from the report
   *
   * @param googleAccessToken - Google OAuth access token
   * @param jobId - YouTube job ID
   * @param reportId - YouTube report ID to download
   * @returns CSV data as string
   */
  async downloadReport(
    googleAccessToken: string,
    jobId: string,
    reportId: string,
  ): Promise<string> {
    if (!googleAccessToken) {
      throw new UnauthorizedException(
        'No Google access token found. Please re-authenticate.',
      );
    }

    try {
      const url = `${this.baseUrl}/jobs/${jobId}/reports/${reportId}`;
      const headers = {
        Authorization: `Bearer ${googleAccessToken}`,
        Accept: 'text/csv', // Request CSV format
      };

      this.logger.debug(`Downloading report: ${reportId} from job: ${jobId}`);

      // Get the report metadata first to get the download URL
      const metadataResponse: AxiosResponse<YouTubeReport> =
        await lastValueFrom(
          this.httpService.get<YouTubeReport>(url, { headers }),
        );

      const downloadUrl = metadataResponse.data.downloadUrl;

      if (!downloadUrl) {
        throw new InternalServerErrorException('Report download URL not found');
      }

      this.logger.debug(`Downloading from URL: ${downloadUrl}`);

      // Download the actual report data
      const dataResponse: AxiosResponse<string> = await lastValueFrom(
        this.httpService.get<string>(downloadUrl, {
          headers: {
            Authorization: `Bearer ${googleAccessToken}`,
          },
          responseType: 'text', // Get response as text (CSV)
        }),
      );

      this.logger.log(`Successfully downloaded report: ${reportId}`);
      return dataResponse.data;
    } catch (error: unknown) {
      this.handleYouTubeApiError(error, 'Failed to download report');
    }
  }

  /**
   * Refresh metadata for a YouTube job
   * Ensures compliance with YouTube API Services Developer Policies
   *
   * @param jobId - YouTube job ID
   * @param googleAccessToken - Google OAuth access token
   */
  async refreshJobMetadata(
    jobId: string,
    googleAccessToken: string,
  ): Promise<void> {
    if (!googleAccessToken) {
      throw new UnauthorizedException(
        'No Google access token found. Please re-authenticate.',
      );
    }

    try {
      const url = `${this.baseUrl}/jobs/${jobId}`;
      const headers = {
        Authorization: `Bearer ${googleAccessToken}`,
      };

      this.logger.debug(`Refreshing metadata for job: ${jobId}`);

      const response: AxiosResponse<YouTubeJob> = await lastValueFrom(
        this.httpService.get<YouTubeJob>(url, { headers }),
      );

      const job = response.data;

      // Update the job metadata in the database
      const supabase = this.supabaseService.getClient();
      const { error } = await supabase
        .from('youtube_jobs')
        .update({
          name: job.name,
          report_type_id: job.reportTypeId,
          create_time: job.createTime,
          last_refreshed: new Date().toISOString(),
        })
        .eq('job_id', jobId);

      if (error) {
        this.logger.error(
          'Failed to update job metadata in database',
          error.message,
        );
        throw new InternalServerErrorException(
          'Failed to update job metadata in database',
        );
      }

      this.logger.log(`Successfully refreshed metadata for job: ${jobId}`);
    } catch (error: unknown) {
      this.handleYouTubeApiError(
        error,
        `Failed to refresh metadata for job: ${jobId}`,
      );
    }
  }

  /**
   * Scheduled task to refresh metadata for all jobs older than 30 days
   */
  @Cron('0 0 * * *') // Runs daily at midnight
  async refreshAllJobMetadata(): Promise<void> {
    this.logger.log('Running scheduled metadata refresh for all jobs');

    try {
      const supabase = this.supabaseService.getClient();
      const { data: jobs, error } = await supabase
        .from('youtube_jobs')
        .select('job_id, user_id, last_refreshed')
        .lte(
          'last_refreshed',
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        );

      if (error) {
        this.logger.error(
          'Failed to fetch jobs for metadata refresh',
          error.message,
        );
        throw new InternalServerErrorException(
          'Failed to fetch jobs for metadata refresh',
        );
      }

      if (!jobs || jobs.length === 0) {
        this.logger.log('No jobs require metadata refresh');
        return;
      }

      for (const job of jobs) {
        const { job_id, user_id } = job;

        // Fetch the user's Google access token
        const user = await supabase.auth.admin.getUserById(user_id);
        const metadata = user?.data?.user?.user_metadata;

        // Validate metadata using the type guard
        if (!isGoogleProviderMetadata(metadata)) {
          this.logger.warn(
            `Skipping job ${job_id}: No valid Google access token found`,
          );
          continue;
        }

        await this.refreshJobMetadata(job_id, metadata.provider_token);
      }

      this.logger.log('Completed scheduled metadata refresh for all jobs');
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(
          'Error during scheduled metadata refresh',
          error.message,
        );
      } else {
        this.logger.error(
          'Unknown error during scheduled metadata refresh',
          error,
        );
      }
    }
  }

  /**
   * Debug helper: list channels for the current Google account
   * Direct YouTube Data API v3 call: channels.list?part=id,snippet,statistics&mine=true
   *
   * @param googleAccessToken - Google OAuth access token (with youtube.readonly scope)
   */
  async listMyChannels(googleAccessToken: string): Promise<unknown> {
    if (!googleAccessToken) {
      throw new UnauthorizedException(
        'No Google access token found. Please re-authenticate.',
      );
    }

    const url = `${this.dataApiBaseUrl}/channels`;
    const params = {
      part: 'id,snippet,statistics',
      mine: 'true',
    };

    try {
      this.logger.debug('Calling YouTube Data API: channels.list?mine=true');

      const response: AxiosResponse<unknown> = await lastValueFrom(
        this.httpService.get<unknown>(url, {
          headers: {
            Authorization: `Bearer ${googleAccessToken}`,
          },
          params,
        }),
      );

      this.logger.debug(
        `channels.list response: ${JSON.stringify(response.data, null, 2)}`,
      );

      return response.data;
    } catch (error: unknown) {
      this.handleYouTubeApiError(error, 'Failed to list YouTube channels');
    }
  }

  /**
   * Handle YouTube API errors with proper logging and type checking
   * Private helper method to centralize error handling
   *
   * @param error - Unknown error object from catch block
   * @param context - Context string for logging (e.g., "Failed to fetch report types")
   * @throws UnauthorizedException for 401/403 errors
   * @throws InternalServerErrorException for other errors
   */
  private handleYouTubeApiError(error: unknown, context: string): never {
    // Handle Axios errors (HTTP errors from YouTube API)
    if (error instanceof AxiosError) {
      const status = error.response?.status;
      const responseData: unknown = error.response?.data;

      // Default error values from Axios error
      let message = error.message;
      let errorCode: number | undefined = status;
      let errorReason: string | undefined;

      // ✅ Log the full error response for debugging
      this.logger.debug(
        `Full YouTube API error response: ${JSON.stringify(responseData, null, 2)}`,
      );

      // Type guard narrows unknown to YouTubeApiErrorResponse
      // After this check, TypeScript knows responseData.error is properly typed
      if (isYouTubeApiErrorResponse(responseData)) {
        // ✅ TypeScript now knows responseData is YouTubeApiErrorResponse
        // ✅ responseData.error is YouTubeApiError (not 'any')
        message = responseData.error.message ?? error.message;
        errorCode = responseData.error.code ?? status;
        errorReason = responseData.error.status;

        // Log additional error details if available
        if (
          responseData.error.details &&
          responseData.error.details.length > 0
        ) {
          const details = responseData.error.details[0];
          this.logger.debug(
            `Error details: ${JSON.stringify({
              reason: details?.reason,
              domain: details?.domain,
              metadata: details?.metadata,
            })}`,
          );
        }
      }

      // Log error with context and details
      this.logger.error(
        `${context}: [${errorCode}] ${message}${errorReason ? ` (${errorReason})` : ''}`,
        error.stack,
      );

      // Handle authentication/authorization errors
      if (status === 401 || status === 403) {
        throw new UnauthorizedException(
          'YouTube API authentication failed. Please re-authenticate.',
        );
      }

      // ✅ Handle "Already Exists" error (409 or specific message pattern)
      if (
        status === 409 ||
        message.toLowerCase().includes('already exists') ||
        errorReason === 'ALREADY_EXISTS'
      ) {
        throw new InternalServerErrorException(
          `A reporting job for this report type already exists. Each report type can only have one active job per channel.`,
        );
      }

      // ✅ Provide more specific error messages for common issues
      if (status === 400) {
        throw new InternalServerErrorException(
          `YouTube API error: ${message}. Please verify the reportTypeId is valid.`,
        );
      }

      // Handle other HTTP errors
      throw new InternalServerErrorException(`YouTube API error: ${message}`);
    }

    // Handle standard JavaScript errors
    if (error instanceof Error) {
      this.logger.error(`${context}: ${error.message}`, error.stack);
      throw new InternalServerErrorException(error.message);
    }

    // Handle unknown error types
    this.logger.error(`${context}: Unknown error`, error);
    throw new InternalServerErrorException('An unknown error occurred');
  }

  /**
   * Fetch, parse, and persist all pending reports for a job
   */
  async ingestReportsForJob(
    googleAccessToken: string,
    jobId: string,
    userId: string,
  ): Promise<void> {
    const reports = await this.listReports(googleAccessToken, jobId);

    if (!reports.length) {
      this.logger.log(`No reports available for job ${jobId}`);
      return;
    }

    for (const report of reports) {
      await this.processReportFile({
        report,
        googleAccessToken,
        jobId,
        userId,
      });
    }
  }

  private async processReportFile(params: {
    report: YouTubeReport;
    googleAccessToken: string;
    jobId: string;
    userId: string;
  }): Promise<void> {
    const { report, googleAccessToken, jobId, userId } = params;
    const supabase = this.supabaseService.getClient();

    const { data: existing, error: lookupError } = await supabase
      .from('youtube_report_files')
      .select('id,status,file_checksum')
      .eq('user_id', userId)
      .eq('job_id', jobId)
      .eq('report_id', report.id)
      .maybeSingle();

    if (lookupError) {
      this.logger.error(
        `Failed to lookup ledger for report ${report.id}`,
        lookupError.message,
      );
      throw new InternalServerErrorException('Ledger lookup failed');
    }

    if (existing?.status === 'parsed') {
      this.logger.debug(`Report ${report.id} already ingested, skipping`);
      return;
    }

    const csv = await this.downloadReport(googleAccessToken, jobId, report.id);
    const checksum = this.computeChecksum(csv);

    const { data: ledger, error: ledgerError } = await supabase
      .from('youtube_report_files')
      .upsert(
        {
          id: existing?.id,
          user_id: userId,
          job_id: jobId,
          report_id: report.id,
          start_time: report.startTime,
          end_time: report.endTime,
          file_checksum: checksum,
          download_url: report.downloadUrl ?? null,
          status: 'pending',
          processed_at: null,
          error_message: null,
        },
        { onConflict: 'user_id,job_id,report_id' },
      )
      .select()
      .single();

    if (ledgerError || !ledger) {
      this.logger.error(
        `Failed to upsert ledger row for report ${report.id}`,
        ledgerError?.message,
      );
      throw new InternalServerErrorException('Ledger upsert failed');
    }

    try {
      const parsedRows = this.parseCsvReport(csv, report);

      await supabase
        .from('youtube_daily_metrics')
        .delete()
        .eq('report_file_id', ledger.id);

      await this.insertDailyMetrics(
        parsedRows.map((row) => ({
          user_id: userId,
          job_id: jobId,
          report_file_id: ledger.id,
          report_date: row.reportDate,
          channel_id: row.channelId,
          video_id: row.videoId ?? null,
          views: row.views,
          watch_time_minutes: row.watchTimeMinutes,
          estimated_revenue: row.estimatedRevenue,
          subscribers_gained: row.subscribersGained,
          subscribers_lost: row.subscribersLost,
          metric_payload: row.metricPayload as Json,
        })),
      );

      await supabase
        .from('youtube_report_files')
        .update({
          status: 'parsed',
          processed_at: new Date().toISOString(),
          error_message: null,
        })
        .eq('id', ledger.id);
    } catch (error: unknown) {
      await supabase
        .from('youtube_report_files')
        .update({
          status: 'error',
          error_message:
            error instanceof Error ? error.message : 'Unknown ingestion error',
        })
        .eq('id', ledger.id);

      throw error;
    }
  }

  private async insertDailyMetrics(
    rows: YoutubeDailyMetricInsert[],
  ): Promise<void> {
    if (!rows.length) {
      return;
    }

    const supabase = this.supabaseService.getClient();
    const chunkSize = 500;

    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize);
      const { error } = await supabase
        .from('youtube_daily_metrics')
        .insert(chunk);

      if (error) {
        this.logger.error(
          'Failed to insert daily metrics chunk',
          error.message,
        );
        throw new InternalServerErrorException(
          'Persisting daily metrics failed',
        );
      }
    }
  }

  private parseCsvReport(
    csvData: string,
    report: YouTubeReport,
  ): ParsedMetricRow[] {
    const content = csvData.trim();
    if (!content) {
      return [];
    }

    const [headerLine, ...rawRows] = content.split(/\r?\n/);
    const headers = this.splitCsvLine(headerLine).map((cell) => cell.trim());

    return rawRows
      .map((line) => this.splitCsvLine(line))
      .filter((cells) => cells.length === headers.length)
      .map((cells) => {
        const payload: Record<string, unknown> = {};
        headers.forEach((header, idx) => {
          payload[header] = this.stripQuotes(cells[idx]?.trim());
        });

        const reportDate =
          (payload.day as string | undefined) ??
          (payload.date as string | undefined) ??
          report.startTime ??
          report.endTime;

        const channelId =
          (payload.channel_id as string | undefined) ??
          (payload.channelId as string | undefined);

        if (!reportDate || !channelId) {
          return null;
        }

        return {
          reportDate: reportDate.slice(0, 10),
          channelId,
          videoId:
            (payload.video_id as string | undefined) ??
            (payload.videoId as string | undefined) ??
            null,
          views: this.toNumber(payload.views),
          watchTimeMinutes: this.toNumber(
            payload.watch_time_minutes ?? payload.watchTimeMinutes,
          ),
          estimatedRevenue: this.toNullableNumber(
            payload.estimated_revenue ?? payload.estimatedRevenue,
          ),
          subscribersGained: this.toNumber(
            payload.subscribers_gained ?? payload.subscribersGained,
          ),
          subscribersLost: this.toNumber(
            payload.subscribers_lost ?? payload.subscribersLost,
          ),
          metricPayload: payload,
        } as ParsedMetricRow;
      })
      .filter((row): row is ParsedMetricRow => row !== null);
  }

  private splitCsvLine(line: string): string[] {
    const cells: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i += 1) {
      const char = line[i];

      if (char === '"' && line[i + 1] === '"') {
        current += '"';
        i += 1;
        continue;
      }

      if (char === '"') {
        inQuotes = !inQuotes;
        continue;
      }

      if (char === ',' && !inQuotes) {
        cells.push(current);
        current = '';
        continue;
      }

      current += char;
    }

    cells.push(current);
    return cells;
  }

  private stripQuotes(value?: string): string | null {
    if (value === undefined) {
      return null;
    }
    return value.replace(/^"(.*)"$/, '$1');
  }

  private toNumber(value: unknown): number {
    const parsed = Number(value ?? 0);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private toNullableNumber(value: unknown): number | null {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private computeChecksum(payload: string): string {
    return createHash('sha256').update(payload).digest('hex');
  }

  /**
   * Scheduled task to ingest all available report files for every saved job.
   * Runs at minute 15 of every hour to stay within YouTube Reporting quotas.
   */
  @Cron('00 * * * *')
  async ingestReportsForAllJobs(): Promise<void> {
    this.logger.log('Running scheduled YouTube report ingestion');

    const supabase = this.supabaseService.getAdminClient();
    const { data: jobs, error } = await supabase
      .from('youtube_jobs')
      .select('job_id, user_id');

    if (error) {
      this.logger.error('Failed to fetch jobs for ingestion', error.message);
      throw new InternalServerErrorException(
        'Failed to fetch jobs for ingestion',
      );
    }

    if (!jobs?.length) {
      this.logger.log('No jobs found for ingestion');
      return;
    }

    for (const job of jobs) {
      try {
        const userResponse = await supabase.auth.admin.getUserById(job.user_id);
        const metadata = userResponse?.data?.user?.user_metadata;

        // Debug: Log actual metadata for diagnosis
        this.logger.debug(
          `User ${job.user_id} metadata: ${JSON.stringify(metadata, null, 2)}`,
        );

        if (!isGoogleProviderMetadata(metadata)) {
          this.logger.warn(
            `Skipping job ${job.job_id}: missing Google provider metadata. Metadata: ${JSON.stringify(metadata)}`,
          );
          // Optional: Mark job as inactive to avoid future warnings
          await supabase
            .from('youtube_jobs')
            .update({
              status: 'inactive',
              last_refreshed: new Date().toISOString(),
            })
            .eq('job_id', job.job_id);
          continue;
        }

        await this.ingestReportsForJob(
          metadata.provider_token,
          job.job_id,
          job.user_id,
        );
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(
          `Failed to ingest reports for job ${job.job_id}`,
          message,
        );
      }
    }
  }

  async getDailyMetrics(params: {
    userId: string;
    jobId: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<YoutubeDailyMetricRow[]> {
    const { userId, jobId, startDate, endDate, limit = 100 } = params;
    const supabase = this.supabaseService.getClient();

    let query = supabase
      .from('youtube_daily_metrics')
      .select('*')
      .eq('user_id', userId)
      .eq('job_id', jobId)
      .order('report_date', { ascending: false })
      .limit(limit);

    if (startDate) {
      query = query.gte('report_date', startDate);
    }

    if (endDate) {
      query = query.lte('report_date', endDate);
    }

    const { data, error } = await query;

    if (error) {
      this.logger.error('Failed to load daily metrics', error.message);
      throw new InternalServerErrorException(
        'Unable to load YouTube daily metrics',
      );
    }
    return data ?? [];
  }
}
