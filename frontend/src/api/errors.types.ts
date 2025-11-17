/**
 * Standardized API Error
 * Used across all frontend components
 */
export interface ApiError {
  message: string;
  statusCode?: number;
  details?: string;
}

/**
 * Type guard to check if an error is an ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as ApiError).message === "string"
  );
}
