/**
 * API Contract Types
 * ==================
 * Define the shape of data exchanged between frontend and backend.
 * This ensures both sides agree on the API structure.
 */

import type {
  YouTubeJob,
  YouTubeReportType,
  YouTubeReport,
} from "./youtube.types";

// ===========================
// Authentication Types
// ===========================

/**
 * Authenticated user information
 * Attached to requests by AuthMiddleware
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
}

/**
 * OAuth callback query parameters
 */
export interface OAuthCallbackQuery {
  code: string;
  state: string;
  error?: string;
}

// ===========================
// YouTube API Endpoints
// ===========================

/**
 * Request body for creating a YouTube reporting job
* This is the DTO for the POST /youtube/create-job endpoint
 */
export interface CreateJobRequest {
  reportTypeId: string;
  name: string;
}

/**
 * Response when creating a YouTube reporting job
 */
export type CreateJobResponse = YouTubeJob;

/**
 * Response when fetching YouTube report types
 */
export type ReportTypesResponse = YouTubeReportType[];

/**
 * Response when fetching YouTube reporting jobs
 */
export type JobsListResponse = YouTubeJob[];

/**
 * Response when listing reports for a job
 */
export type ReportsListResponse = YouTubeReport[];

/**
 * Response when downloading a report
 */
export interface DownloadReportResponse {
  data: string; // CSV data
  filename: string;
}

// ===========================
// Error Responses
// ===========================

/**
 * Standard error response format
 */
export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  error?: string;
  timestamp?: string;
}

// ===========================
// Health Check
// ===========================

/**
 * Health check response
 */
export interface HealthCheckResponse {
  status: "healthy" | "unhealthy";
  details?: string;
  timestamp: string;
}
