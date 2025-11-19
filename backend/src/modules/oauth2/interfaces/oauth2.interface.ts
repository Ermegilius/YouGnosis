import { Database } from '@common/supabase.types';

export type googleUsersRow =
  Database['public']['Tables']['google_users']['Row'];
export type googleUsersRowInsert =
  Database['public']['Tables']['google_users']['Insert'];
export type googleUsersRowUpdate =
  Database['public']['Tables']['google_users']['Update'];
