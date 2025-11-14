import { Controller, Get, Logger } from '@nestjs/common';
import { TestDataService } from './test-data.service';
import type { TestTableRow } from './interfaces/test-data.interface';

/**
 * TestDataController
 * =================
 * Handles test data endpoints for development/testing purposes.
 */
@Controller('test-data')
export class TestDataController {
  private readonly logger = new Logger(TestDataController.name);

  constructor(private readonly testDataService: TestDataService) {}

  /**
   * GET /api/test-data
   * Fetch all test data from the database
   *
   * @returns Promise resolving to array of test data rows
   */
  @Get()
  async getTestData(): Promise<TestTableRow[]> {
    this.logger.log('GET /api/test-data endpoint called');
    return this.testDataService.getTestData();
  }
}
