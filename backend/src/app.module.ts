import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true, // Enable variable expansion
      envFilePath: ['../../.env.dev', '../../.env.prod', '../../.env.test'],

      validationSchema: Joi.object({
        // Application
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        PORT: Joi.number().port().default(3000),
        ALLOWED_ORIGINS: Joi.string().default('http://localhost:8000'),

        // Supabase
        SUPABASE_PROJECT_ID: Joi.string().required(),
        SUPABASE_DB_PASSWORD: Joi.string().required(),
        SUPABASE_URL: Joi.string().uri().required(),
        SUPABASE_STORAGE_URL: Joi.string().uri().required(),

        // Frontend
        VITE_SUPABASE_URL: Joi.string().uri().required(),
        VITE_API_URL: Joi.string().uri().default('http://127.0.0.1:3000'),
      }),
      validationOptions: {
        allowUnknown: true, // Allow extra env vars not in schema
        abortEarly: false, // Show all validation errors at once
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
