import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { TestTableRow } from './interfaces/test-data.interface';

@Injectable()
export class TestDataService {
  private readonly logger = new Logger(TestDataService.name);
  constructor(private readonly supabaseService: SupabaseService) {}

  async getTestData(): Promise<TestTableRow[]> {
    this.logger.log('Fetching test data from Supabase...');

    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('test_table')
      .select('*')
      .returns<TestTableRow[]>();

    if (error) {
      this.logger.error(`Error fetching test data: ${error.message}`);
      throw new Error(`Failed to fetch test data: ${error.message}`);
    }

    // TypeScript now knows data is non-null after the error check
    return data ?? [];
  }
}
