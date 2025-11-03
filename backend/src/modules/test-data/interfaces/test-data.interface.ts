import { Database } from '@common/supabase.types';

export type TestTableRow = Database['public']['Tables']['test_table']['Row'];
export type TestTableRowInsert =
  Database['public']['Tables']['test_table']['Insert'];
export type TestTableRowUpdate =
  Database['public']['Tables']['test_table']['Update'];
