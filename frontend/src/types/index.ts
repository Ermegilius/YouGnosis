/**
 * Frontend Types
 * ==============
 * Frontend-specific types for components, state, etc.
 */

// Re-export common types for convenience
export type {
  YouTubeReportType,
  YouTubeJob,
  GoogleProviderMetadata,
  YouTubeApiErrorResponse,
  YouTubeApiError,
  YouTubeApiErrorDetail,
} from "@common/youtube.types";

export {
  isYouTubeApiErrorResponse,
  isGoogleProviderMetadata,
} from "@common/youtube.types";

export type {
  AuthenticatedUser,
  CreateJobRequest,
  ApiErrorResponse,
} from "@common/api.types";

// Component prop types
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// Navigation types
export interface MenuItem {
  title: string;
  path: string;
  subMenu?: MenuItem[];
}
