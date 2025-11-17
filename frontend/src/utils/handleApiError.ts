import type { ApiError } from "@src/types/index";
import { AxiosError } from "axios";

/**
 * Convert unknown errors to standardized ApiError format
 * Handles Axios errors, Error instances, and unknown types
 */
export function handleApiError(error: unknown): ApiError {
  // Handle Axios errors (from backend)
  if (error instanceof AxiosError) {
    // Network error (no response received)
    if (!error.response) {
      return {
        message: error.message || "Network error. Please check your connection.",
        statusCode: 0,
      };
    }

    const statusCode = error.response?.status;
    const message = error.response?.data?.message || error.message;
    const details = error.response?.data?.error;

    return {
      message,
      statusCode,
      details,
    };
  }

  // Handle standard Error instances
  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }

  // Handle unknown error types
  return {
    message: "An unexpected error occurred",
  };
}
