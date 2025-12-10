import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { Server } from 'http';
import { TestDataModule } from '@src/modules/test-data/test-data.module';
import { TestDataService } from '@src/modules/test-data/test-data.service';
import { SupabaseService } from '@src/modules/supabase/supabase.service';
import type { TestTableRow } from '@src/modules/test-data/interfaces/test-data.interface';
import { isApiErrorResponse } from '@common/api.types';
import {
  createMockSupabaseService,
  createMockSupabaseClient,
} from '../../utils/mock-supabase';

describe('TestDataController (e2e)', () => {
  let app: INestApplication;
  let testDataService: TestDataService;

  const mockRows: TestTableRow[] = [
    { id: '1', created_at: '2023-01-01T00:00:00Z', some_text_here: 'row1' },
    { id: '2', created_at: '2023-01-02T00:00:00Z', some_text_here: 'row2' },
  ];

  beforeAll(async () => {
    const mockClient = createMockSupabaseClient<TestTableRow[]>();
    const moduleFixture = await Test.createTestingModule({
      imports: [TestDataModule],
    })
      .overrideProvider(SupabaseService)
      .useValue(createMockSupabaseService(mockClient))
      .overrideProvider(TestDataService)
      .useValue({
        getTestData: jest.fn().mockResolvedValue(mockRows),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    testDataService = moduleFixture.get<TestDataService>(TestDataService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/test-data should return array of test data', async () => {
    const response = await request(app.getHttpServer() as Server).get(
      '/api/test-data',
    );
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockRows);
  });

  it('GET /api/test-data should handle generic service errors securely', async () => {
    // 1. Simulate a raw internal Error (e.g., DB connection failed)
    const internalSecretMessage = 'Database connection failed at 127.0.0.1';
    (testDataService.getTestData as jest.Mock).mockRejectedValueOnce(
      new Error(internalSecretMessage),
    );

    const response = await request(app.getHttpServer() as Server).get(
      '/api/test-data',
    );

    // 2. Expect 500 Internal Server Error
    expect(response.status).toBe(500);

    // 3. Verify the response structure and SECURITY
    if (isApiErrorResponse(response.body)) {
      // The client must see the generic message
      expect(response.body.message).toBe('Internal server error');

      // The client must NOT see the internal details
      expect(response.body.message).not.toContain(internalSecretMessage);
    } else {
      throw new Error('Response is not ApiErrorResponse');
    }
  });
});
