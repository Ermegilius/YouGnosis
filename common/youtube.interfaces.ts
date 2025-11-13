/**
 * YouTube Reporting API report type
 * Shared between frontend and backend
 */
export interface YouTubeReportType {
  id: string;
  name: string;
  systemManaged?: boolean;
}

/**
 * YouTube Reporting API job
 * Shared between frontend and backend
 */
export interface YouTubeJob {
  id: string;
  name: string;
  reportTypeId: string;
  createTime: string;
}

/**
 * YouTube Reporting API report
 * Shared between frontend and backend
 */
export interface YouTubeReport {
  id: string;
  jobId: string;
  startTime: string;
  endTime: string;
  createTime: string;
  downloadUrl: string;
}

/**
 * Google OAuth provider metadata stored in Supabase user_metadata
 * Used to store Google tokens and user information
 * Shared between frontend and backend for type safety
 */
export interface GoogleProviderMetadata {
  provider: "google";
  provider_id: string; // Google's user ID (sub)
  provider_token: string; // Google access token
  provider_refresh_token?: string; // Google refresh token
  provider_token_expires_at: number; // Token expiration timestamp
  provider_scopes: string; // Granted OAuth scopes
  name: string;
  given_name?: string;
  picture?: string;
}

/**
 * Google OAuth2 tokens response
 */
export interface GoogleTokensResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number; // seconds until expiration
  scope?: string;
  token_type: string;
}

/**
 * Google user info response from OAuth2
 */
export interface GoogleUserInfoResponse {
  sub: string; // Google user ID
  email: string;
  email_verified: boolean;
  name: string;
  given_name?: string;
  picture?: string;
}

/**
 * Authenticated user info attached to requests
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
}
