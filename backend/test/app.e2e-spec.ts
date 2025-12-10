import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Server } from 'http';
import { AppModule } from '@src/modules/app/app.module';
import { SupabaseService } from '@src/modules/supabase/supabase.service';
import {
  createMockSupabaseClient,
  createMockSupabaseService,
} from './utils/mock-supabase';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const mockClient = createMockSupabaseClient();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      // Override SupabaseService to prevent external connection attempts during tests
      // This ensures the test runs in isolation without needing a real Supabase instance
      .overrideProvider(SupabaseService)
      .useValue(createMockSupabaseService(mockClient))
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api (GET)', () => {
    return request(app.getHttpServer() as Server)
      .get('/api')
      .expect(200)
      .expect('Hello World!');
  });
});
