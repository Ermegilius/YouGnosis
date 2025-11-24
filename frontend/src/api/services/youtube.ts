import { api } from "../axios";
import type {
  YouTubeJob,
  YouTubeReport,
  YouTubeReportType,
} from "@src/types/index";
import type { Database } from "@common/supabase.types";

/**
 * Fetch all YouTube report types.
 * Uses Supabase token for authentication to your backend.
 * Backend will handle fetching Google token and calling YouTube API.
 * @returns {Promise<YouTubeReportType[]>} - List of report types.
 * @throws {ApiError} - Standardized error format

 */
export const reportTypesApi = async (): Promise<YouTubeReportType[]> => {
  const response = await api.get<YouTubeReportType[]>("/youtube/report-types");
  return response.data;
};

/**
 * Fetch all existing YouTube reporting jobs for the authenticated user
 * Requires valid Google OAuth token with YouTube scopes
 * @throws {ApiError} - Standardized error format

 */
export const reportingJobsApi = async (): Promise<YouTubeJob[]> => {
  const response = await api.get<YouTubeJob[]>("/youtube/jobs");
  return response.data;
};

/**
 * Create a new YouTube reporting job
 * Requires valid Google OAuth token with YouTube scopes
 * @param reportTypeId - YouTube report type ID (e.g., "channel_basic_a2")
 * @param name - Human-readable name for the job (e.g., "My Channel Analytics")
 * @returns {Promise<YouTubeJob>} - Created job details
 * @throws {ApiError} - Standardized error format
 */
export const createReportingJobApi = async (
  reportTypeId: string,
  name: string,
): Promise<YouTubeJob> => {
  const response = await api.post<YouTubeJob>("/youtube/create-job", {
    reportTypeId,
    name,
  });
  return response.data;
};

/** List all available reports for a specific job
 * @param jobId - YouTube job ID to fetch reports for
 * @returns {Promise<YouTubeReport[]>} - Array of available reports with download URLs
 * @throws {ApiError} - Standardized error format
 */
export const listReportsApi = async (
  jobId: string,
): Promise<YouTubeReport[]> => {
  const response = await api.get<YouTubeReport[]>("youtube/reports", {
    params: { jobId },
  });
  return response.data;
};

/**
 * Download a specific report's data
 * Requires valid Google OAuth token with YouTube scopes
 *
 * @param reportId - The YouTube report ID to download
 * @returns Report data as CSV string
 * @throws {ApiError} - Standardized error format
 */
export const downloadReportApi = async (
  reportId: string,
  jobId: string,
): Promise<{ data: string; filename: string }> => {
  const response = await api.get<{ data: string; filename: string }>(
    "youtube/download-report",
    { params: { reportId, jobId } },
  );
  return response.data;
};

type DailyMetricRow =
  Database["public"]["Tables"]["youtube_daily_metrics"]["Row"];

interface GetDailyMetricsParams {
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export const ingestJobReportsApi = async (
  jobId: string,
): Promise<{ jobId: string; status: string }> => {
  const response = await api.post<{ jobId: string; status: string }>(
    `/youtube/jobs/${jobId}/ingest`,
  );
  return response.data;
};

export const getDailyMetricsApi = async (
  jobId: string,
  params?: GetDailyMetricsParams,
): Promise<DailyMetricRow[]> => {
  const response = await api.get<{ data: DailyMetricRow[] }>(
    `/youtube/jobs/${jobId}/daily-metrics`,
    { params },
  );
  return response.data.data;
};
