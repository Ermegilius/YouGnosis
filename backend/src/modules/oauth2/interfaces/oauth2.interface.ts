import { Database } from '@common/supabase.types';

export interface OAuth2TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export type GoogleTokensRow =
  Database['public']['Tables']['google_tokens']['Row'];
export type GoogleTokensInsert =
  Database['public']['Tables']['google_tokens']['Insert'];
export type GoogleTokensUpdate =
  Database['public']['Tables']['google_tokens']['Update'];

export interface StoredGoogleTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  scope: string;
}
