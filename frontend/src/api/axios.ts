import axios from "axios";
import { supabase } from "../supabase/supabase";
import type { AxiosResponse } from "axios";
import { handleApiError } from "@src/utils/handleApiError";

// Cache token to avoid unnecessary async calls
let cachedToken: string | null = null;

/**
 * Get auth token with caching and auto-refresh
 */
export async function getAuthToken(): Promise<string | null> {
  if (cachedToken) {
    // Decode JWT to check expiration
    const [, payloadBase64] = cachedToken.split(".");
    const payload = JSON.parse(atob(payloadBase64));
    const now = Math.floor(Date.now() / 1000);

    // Refresh if token expires in 60 seconds
    if (payload.exp && payload.exp <= now + 60) {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error("Failed to refresh session:", error);
        return null;
      }
      cachedToken = data.session?.access_token || null;
    }
  }

  if (!cachedToken) {
    const { data } = await supabase.auth.getSession();
    cachedToken = data.session?.access_token || null;
  }

  return cachedToken;
}

export function clearCachedAuthToken(): void {
  cachedToken = null;
}

// Create axios instance
const apiUrl = import.meta.env.VITE_API_URL as string;
const baseURL = apiUrl || "http://localhost:3000/api";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor - add auth token
api.interceptors.request.use(
  async (config) => {
    // Add auth token to all requests
    const token = await getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add user ID from localStorage if available
    const userId = localStorage.getItem("userId");
    if (userId) {
      config.headers["x-user-id"] = userId;
    }

    return config;
  },
  (error) => {
    console.error("Request error:", error);
    // Return normalized error
    return Promise.reject(handleApiError(error));
  },
);

// Response interceptor - handle errors and return data
api.interceptors.response.use(
  // Success handler - return the full response for type safety
  (response: AxiosResponse) => {
    return response;
  },
  // Error handler - normalize all errors to ApiError
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized - refresh token and retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { error: refreshError } = await supabase.auth.refreshSession();
        if (!refreshError) {
          // Clear cached token and retry
          clearCachedAuthToken();
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error("Session refresh failed:", refreshError);
        // Redirect to login
        window.location.href = "/";
        // Return normalized error instead of throwing
        return Promise.reject(handleApiError(error));
      }
    }

    // Retry logic for 5xx server errors (max 2 retries)
    if (error.response?.status >= 500 && error.response?.status < 600) {
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;

      if (originalRequest._retryCount <= 2) {
        console.warn(
          `Retrying request (attempt ${originalRequest._retryCount})...`,
        );
        // Exponential backoff: 1s, 2s
        await new Promise((resolve) =>
          setTimeout(resolve, originalRequest._retryCount * 1000),
        );
        return api(originalRequest);
      }
    }

    // Log error details
    console.error("API Error:", {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      url: error.config?.url,
    });

    // Always return normalized ApiError (handleApiError converts axios errors)
    return Promise.reject(handleApiError(error));
  },
);
