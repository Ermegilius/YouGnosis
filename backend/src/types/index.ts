/**
 * Backend Types Barrel Export
 * ============================
 * Re-export all backend-specific types from one place.
 * This makes imports cleaner throughout the backend.
 *
 * @example
 * ```typescript
 * // Instead of:
 * import { GoogleProviderMetadata } from '@common/youtube.types';
 * import { CreateJobRequest } from '@common/api.types';
 *
 * // You can do:
 * import { GoogleProviderMetadata, CreateJobRequest } from '@src/types';
 * ```
 */

// Re-export common types
export type {
  YouTubeReportType,
  YouTubeJob,
  YouTubeReport,
  GoogleTokensResponse,
  GoogleUserInfoResponse,
  GoogleProviderMetadata,
  YouTubeApiErrorResponse,
  YouTubeApiError,
  YouTubeApiErrorDetail,
} from '@common/youtube.types';

export {
  isGoogleProviderMetadata,
  isYouTubeApiErrorResponse,
} from '@common/youtube.types';

export type {
  AuthenticatedUser,
  OAuthCallbackQuery,
  CreateJobRequest,
  CreateJobResponse,
  ReportTypesResponse,
  ApiErrorResponse,
  HealthCheckResponse,
} from '@common/api.types';

// Backend-specific types
export type { Database } from '@common/supabase.types';

// Authenticated request with user info
export type { AuthenticatedRequest } from '@src/middleware/interfaces/authenticated-request.interface';
