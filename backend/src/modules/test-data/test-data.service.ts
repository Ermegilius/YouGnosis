import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import type { TestTableRow } from './interfaces/test-data.interface';

/**
 * TestDataService
 * ==============
 * Service for fetching test data from Supabase.
 * Used for development and testing purposes.
 */
@Injectable()
export class TestDataService {
  private readonly logger = new Logger(TestDataService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Fetch all test data from the test_table
   *
   * @returns Promise resolving to array of test data rows
   * @throws Error if Supabase query fails
   */
  async getTestData(): Promise<TestTableRow[]> {
    this.logger.log('Fetching test data from Supabase...');

    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase.from('test_table').select('*');

    if (error) {
      this.logger.error(`Error fetching test data: ${error.message}`);
      throw new Error(`Failed to fetch test data: ${error.message}`);
    }

    // TypeScript now knows data is non-null after the error check
    return (data as TestTableRow[]) ?? [];
  }
}
