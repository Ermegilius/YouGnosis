import { Test, TestingModule } from '@nestjs/testing';
import { TestDataController } from './test-data.controller';
import { TestDataService } from './test-data.service';
import { Logger } from '@nestjs/common';
import type { TestTableRow } from './interfaces/test-data.interface';

describe('TestDataController', () => {
  let controller: TestDataController;
  let service: TestDataService;

  const mockTestRows: TestTableRow[] = [
    { id: '1', created_at: '2023-01-01T00:00:00Z', some_text_here: 'test1' },
    { id: '2', created_at: '2023-01-02T00:00:00Z', some_text_here: 'test2' },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TestDataController],
      providers: [
        {
          provide: TestDataService,
          useValue: {
            getTestData: jest.fn().mockResolvedValue(mockTestRows),
          },
        },
      ],
    }).compile();

    controller = module.get<TestDataController>(TestDataController);
    service = module.get<TestDataService>(TestDataService);

    // Suppress Logger output during tests for cleaner console output
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return an array of test data', async () => {
    // Call the controller method
    const result = await controller.getTestData();

    // Assert that the service's getTestData method was called
    expect(service.getTestData).toHaveBeenCalledTimes(1);

    // Assert that the controller returns the data provided by the mocked service
    expect(result).toEqual(mockTestRows);
  });

  it('should handle errors from TestDataService', async () => {
    // Mock the service method to throw an error
    jest
      .spyOn(service, 'getTestData')
      .mockRejectedValueOnce(new Error('Service error'));

    // Expect the controller method to re-throw the error
    await expect(controller.getTestData()).rejects.toThrow('Service error');
  });
});
