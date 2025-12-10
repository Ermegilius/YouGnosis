import { TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';

export async function createTestApp(
  moduleBuilder: TestingModuleBuilder,
): Promise<INestApplication> {
  const moduleFixture: TestingModule = await moduleBuilder.compile();

  const app = moduleFixture.createNestApplication();

  // Mirror your main.ts configuration here
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  await app.init();
  return app;
}
