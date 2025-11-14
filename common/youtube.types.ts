/**
 * YouTube API Types
 * ================
 * Shared between frontend and backend for type safety.
 * These types represent data structures from:
 * - YouTube Reporting API
 * - Google OAuth2 API
 * - Supabase user metadata
 */

// ===========================
// YouTube API Response Types
// ===========================

/**
 * YouTube Reporting API - Report Type
 * Represents a specific type of YouTube analytics report
 * @see https://developers.google.com/youtube/reporting/v1/reports
 */
export interface YouTubeReportType {
  id: string;
  name: string;
  systemManaged?: boolean;
}

/**
 * YouTube Reporting API - Job
 * Represents a scheduled reporting job that generates reports
 */
export interface YouTubeJob {
  id: string;
  name: string;
  reportTypeId: string;
  createTime: string;
}

/**
 * YouTube Reporting API - Report
 * Represents a generated report ready for download
 */
export interface YouTubeReport {
  id: string;
  jobId: string;
  startTime: string;
  endTime: string;
  createTime: string;
  downloadUrl: string;
}

// ===========================
// Google OAuth Types
// ===========================

/**
 * Google OAuth2 - Token Response
 * Response when exchanging authorization code or refreshing token
 */
export interface GoogleTokensResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number; // Seconds until expiration
  scope?: string;
  token_type: string;
}

/**
 * Google OAuth2 - User Info Response
 * User profile information from Google
 */
export interface GoogleUserInfoResponse {
  sub: string; // Google user ID (unique identifier)
  email: string;
  email_verified: boolean;
  name: string;
  given_name?: string;
  picture?: string;
}

/**
 * Google Provider Metadata
 * Stored in Supabase user_metadata to persist OAuth tokens
 * This allows the backend to make YouTube API calls on behalf of the user
 */
export interface GoogleProviderMetadata {
  provider: "google";
  provider_id: string; // Google's user ID (sub)
  provider_token: string; // Google access token
  provider_refresh_token?: string; // Google refresh token
  provider_token_expires_at: number; // Unix timestamp (milliseconds)
  provider_scopes: string; // Space-separated list of granted scopes
  name: string;
  given_name?: string;
  picture?: string;
}

// ===========================
// YouTube API Error Types
// ===========================

/**
 * YouTube API Error Detail
 * Individual error detail from YouTube API error response
 */
export interface YouTubeApiErrorDetail {
  /**
   * Type URL that identifies the error detail type
   * e.g., "type.googleapis.com/google.rpc.ErrorInfo"
   */
  "@type"?: string;

  /**
   * Reason code for the error
   * e.g., "INVALID_REPORT_TYPE", "QUOTA_EXCEEDED"
   */
  reason?: string;

  /**
   * Domain where the error occurred
   * e.g., "youtubereporting.googleapis.com"
   */
  domain?: string;

  /**
   * Additional metadata about the error
   */
  metadata?: Record<string, unknown>;
}

/**
 * YouTube API Error Object
 * Error structure from Google API error format
 */
export interface YouTubeApiError {
  /**
   * HTTP status code (e.g., 400, 401, 403, 404, 500)
   */
  code?: number;

  /**
   * Human-readable error message
   */
  message?: string;

  /**
   * Error status string (e.g., "INVALID_ARGUMENT", "PERMISSION_DENIED")
   */
  status?: string;

  /**
   * Additional error details (optional)
   * Contains structured information about the error
   */
  details?: YouTubeApiErrorDetail[];
}

/**
 * YouTube API Error Response
 * Based on Google API error format
 * Returned when YouTube Reporting API requests fail
 * @see https://cloud.google.com/apis/design/errors
 * @see https://developers.google.com/youtube/reporting/v1/errors
 */
export interface YouTubeApiErrorResponse {
  error: YouTubeApiError;
}

/**
 * Type guard to check if an error response is a YouTube API error
 * Use this to safely narrow types when handling API errors
 *
 * @example
 * ```typescript
 * if (isYouTubeApiErrorResponse(error.response?.data)) {
 *   const message = error.response.data.error.message;
 *   const code = error.response.data.error.code;
 * }
 * ```
 */
export function isYouTubeApiErrorResponse(
  data: unknown
): data is YouTubeApiErrorResponse {
  // Must be an object
  if (!data || typeof data !== "object") {
    return false;
  }

  const response = data as Record<string, unknown>;

  // Must have 'error' property that is an object
  if (
    !("error" in response) ||
    typeof response.error !== "object" ||
    response.error === null
  ) {
    return false;
  }

  // Type assertion is now safe because we've validated the structure
  const error = response.error as Record<string, unknown>;

  // Validate that error has at least one of the expected properties
  // This ensures it's actually a YouTube API error, not just any object with an 'error' property
  return (
    typeof error.message === "string" ||
    typeof error.code === "number" ||
    typeof error.status === "string"
  );
}

// ===========================
// Type Guards
// ===========================

/**
 * Type guard to check if user metadata contains valid Google OAuth data
 * Use this to safely narrow types when reading from Supabase
 *
 * @example
 * ```typescript
 * const metadata = user.user_metadata;
 * if (isGoogleProviderMetadata(metadata)) {
 *   // TypeScript knows metadata is GoogleProviderMetadata
 *   const token = metadata.provider_token;
 * }
 * ```
 */
export function isGoogleProviderMetadata(
  metadata: unknown
): metadata is GoogleProviderMetadata {
  if (!metadata || typeof metadata !== "object") return false;

  const meta = metadata as Record<string, unknown>;

  return (
    meta.provider === "google" &&
    typeof meta.provider_id === "string" &&
    typeof meta.provider_token === "string" &&
    typeof meta.provider_token_expires_at === "number" &&
    typeof meta.provider_scopes === "string" &&
    typeof meta.name === "string"
  );
}
