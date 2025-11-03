import { Controller, Get, Logger } from '@nestjs/common';
import { TestDataService } from './test-data.service';

@Controller('test-data')
export class TestDataController {
  private readonly logger = new Logger(TestDataController.name);

  constructor(private readonly testDataService: TestDataService) {}

  @Get()
  async getTestData() {
    this.logger.log('GET /api/test-data endpoint called');
    return this.testDataService.getTestData();
  }
}
