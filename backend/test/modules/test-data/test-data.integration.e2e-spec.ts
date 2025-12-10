import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '@src/modules/app/app.module';
import { TestDataService } from '@src/modules/test-data/test-data.service';
import { ConfigService } from '@nestjs/config';

/**
 * Integration Test for TestDataModule
 * =================================
 * This test connects to the REAL Supabase instance defined in .env.test.
 * It verifies that the backend can successfully authenticate and retrieve data.
 */
describe('TestDataModule (Integration)', () => {
  let app: INestApplication;
  let testDataService: TestDataService;
  let configService: ConfigService;

  beforeAll(async () => {
    // 1. Load the full AppModule.
    // Unlike unit tests, we do NOT override SupabaseService here.
    // We want the real connection to happen.
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    testDataService = moduleFixture.get<TestDataService>(TestDataService);
    configService = moduleFixture.get<ConfigService>(ConfigService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should have valid Supabase configuration', () => {
    const supabaseUrl = configService.get<string>('SUPABASE_URL');
    const supabaseKey = configService.get<string>('SUPABASE_PUBLISHABLE_KEY');

    expect(supabaseUrl).toBeDefined();
    expect(supabaseUrl).toContain('supabase.co');
    expect(supabaseKey).toBeDefined();
  });

  it('should fetch real data from Supabase', async () => {
    jest.setTimeout(10000);
    console.log('Connecting to Supabase to fetch test data...');

    // 2. Call the service method which hits the real DB
    const data = await testDataService.getTestData();

    // 3. Verify the response structure
    expect(Array.isArray(data)).toBe(true);
    console.log(`Fetched ${data.length} rows from Supabase.`);

    // 4. If data exists, verify it matches the expected shape
    if (data.length > 0) {
      const firstRow = data[0];
      expect(firstRow).toHaveProperty('id');
      expect(firstRow).toHaveProperty('created_at');
      expect(firstRow).toHaveProperty('some_text_here');
    }
  });
});
