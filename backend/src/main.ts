import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    const app = await NestFactory.create(AppModule);

    // Get ConfigService from the app instance
    const configService = app.get(ConfigService);

    // Get config values with proper defaults
    const port = configService.get<number>('PORT') || 3000;
    const nodeEnv = configService.get<string>('NODE_ENV') || 'development';
    const allowedOriginsStr =
      configService.get<string>('ALLOWED_ORIGINS') || 'http://localhost:5173';

    // Parse origins - handle both comma-separated and single origin
    const origins = allowedOriginsStr
      .split(',')
      .map((origin) => origin.trim())
      .filter((origin) => origin.length > 0);

    // Enable CORS for frontend
    app.enableCors({
      origin: origins.length > 0 ? origins : true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });

    // Enable global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    // Set global API prefix
    app.setGlobalPrefix('api');

    // Start server
    await app.listen(port);

    logger.log(`🚀 Application is running on: http://localhost:${port}/api`);
    logger.log(`📦 Environment: ${nodeEnv}`);
    logger.log(`🌐 CORS enabled for: ${origins.join(', ')}`);
  } catch (error) {
    logger.error(`❌ Failed to start application:`, error);
    process.exit(1);
  }
}

bootstrap().catch((err) => {
  const logger = new Logger('Bootstrap');
  logger.error('💥 Unhandled bootstrap error:', err);
  process.exit(1);
});
