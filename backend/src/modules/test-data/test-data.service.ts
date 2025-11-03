import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { Database } from '@common/supabase.types';

type TestTableRow = Database['public']['Tables']['test_table']['Row'];

@Injectable()
export class TestDataService {
  private readonly logger = new Logger(TestDataService.name);
  constructor(private readonly supabaseService: SupabaseService) {}

  async getTestData(): Promise<TestTableRow[]> {
    this.logger.log('Fetching test data from Supabase...');

    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase.from('test_table').select('*');

    if (error) {
      this.logger.error(`Error fetching test data: ${error.message}`);
      throw new Error(`Failed to fetch test data: ${error.message}`);
    }

    return (data ?? []) as TestTableRow[];
  }
}
