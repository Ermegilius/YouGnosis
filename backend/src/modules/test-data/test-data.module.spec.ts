import { Test, TestingModule } from '@nestjs/testing';
import { TestDataModule } from './test-data.module';
import { TestDataController } from './test-data.controller';
import { TestDataService } from './test-data.service';

describe('TestDataModule', () => {
  let moduleRef: TestingModule;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [TestDataModule],
    }).compile();
  });

  it('should compile the module', () => {
    expect(moduleRef).toBeDefined();
  });

  it('should provide TestDataController', () => {
    const controller = moduleRef.get<TestDataController>(TestDataController);
    expect(controller).toBeInstanceOf(TestDataController);
  });

  it('should provide TestDataService', () => {
    const service = moduleRef.get<TestDataService>(TestDataService);
    expect(service).toBeInstanceOf(TestDataService);
  });
});
