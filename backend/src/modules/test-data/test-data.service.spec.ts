import { Test, TestingModule } from '@nestjs/testing';
import { TestDataService } from './test-data.service';
import { SupabaseService } from '../supabase/supabase.service';
import type { TestTableRow } from './interfaces/test-data.interface';
import { Logger } from '@nestjs/common';

// Mock data for test_table
const mockRows: TestTableRow[] = [
  { id: '1', created_at: '2023-01-01T00:00:00Z', some_text_here: 'row1' },
  { id: '2', created_at: '2023-01-02T00:00:00Z', some_text_here: 'row2' },
];

// Mock Supabase client
const mockSupabaseClient = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn(),
};

describe('TestDataService', () => {
  let service: TestDataService;
  let supabaseService: SupabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestDataService,
        {
          provide: SupabaseService,
          useValue: {
            getClient: jest.fn(() => mockSupabaseClient),
          },
        },
      ],
    }).compile();

    service = module.get<TestDataService>(TestDataService);
    supabaseService = module.get<SupabaseService>(SupabaseService);

    // Reset mocks before each test
    jest.clearAllMocks();
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  describe('getTestData', () => {
    it('should return an array of test data rows', async () => {
      // Arrange: mock Supabase response
      mockSupabaseClient.select.mockResolvedValueOnce({
        data: mockRows,
        error: null,
      });

      const result = await service.getTestData();

      expect(supabaseService.getClient).toHaveBeenCalled();
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('test_table');
      expect(mockSupabaseClient.select).toHaveBeenCalledWith('*');
      expect(result).toEqual(mockRows);
    });

    it('should return an empty array if Supabase returns null data and no error', async () => {
      mockSupabaseClient.select.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      const result = await service.getTestData();

      expect(result).toEqual([]);
    });

    it('should throw an error if Supabase returns error', async () => {
      mockSupabaseClient.select.mockResolvedValueOnce({
        data: null,
        error: { message: 'Supabase error' },
      });

      await expect(service.getTestData()).rejects.toThrow(
        'Failed to fetch test data: Supabase error',
      );
    });

    it('should log error if Supabase returns error', async () => {
      const errorSpy = jest.spyOn(Logger.prototype, 'error');
      mockSupabaseClient.select.mockResolvedValueOnce({
        data: null,
        error: { message: 'Supabase error' },
      });

      await expect(service.getTestData()).rejects.toThrow();
      expect(errorSpy).toHaveBeenCalledWith(
        'Error fetching test data: Supabase error',
      );
    });

    it('should log fetching message', async () => {
      const logSpy = jest.spyOn(Logger.prototype, 'log');
      mockSupabaseClient.select.mockResolvedValueOnce({
        data: mockRows,
        error: null,
      });

      await service.getTestData();
      expect(logSpy).toHaveBeenCalledWith(
        'Fetching test data from Supabase...',
      );
    });

    it('should throw if supabaseService.getClient throws', async () => {
      (supabaseService.getClient as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Unexpected client error');
      });

      await expect(service.getTestData()).rejects.toThrow(
        'Unexpected client error',
      );
    });
  });
});
