import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule } from '@src/modules/supabase/supabase.module';
import { TestDataModule } from '@src/modules/test-data/test-data.module';
import * as Joi from 'joi';
import { YouTubeModule } from '@src/modules/youtube/youtube.module';
import { AuthMiddleware } from '@src/middleware/Auth.middleware';
import { OAuth2Module } from '@src/modules/oauth2/oauth2.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true, // Enable variable expansion like ${SUPABASE_PROJECT_ID}
      envFilePath: [
        `../.env.${process.env.NODE_ENV || 'development'}`, // Environment-specific file
      ],
      validationSchema: Joi.object({
        // Application
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        PORT: Joi.number().port().default(3000),
        ALLOWED_ORIGINS: Joi.string().default('http://localhost:8000'),

        // Supabase - New API Keys Only
        SUPABASE_PROJECT_ID: Joi.string().required(),
        SUPABASE_DB_PASSWORD: Joi.string().required(),
        SUPABASE_URL: Joi.string().uri().required(),
        SUPABASE_STORAGE_URL: Joi.string().uri().required(),
        SUPABASE_PUBLISHABLE_KEY: Joi.string()
          .pattern(/^sb_publishable_/)
          .required(),
        SUPABASE_SECRET_KEY_DEFAULT: Joi.string()
          .pattern(/^sb_secret_/)
          .required(),

        // Frontend
        VITE_SUPABASE_URL: Joi.string().uri().required(),
        VITE_SUPABASE_PUBLISHABLE_KEY: Joi.string()
          .pattern(/^sb_publishable_/)
          .required(),
        VITE_API_URL: Joi.string().uri().default('http://127.0.0.1:3000/api'),
        VITE_FRONTEND_URL: Joi.string().uri().default('http://localhost:8000'),

        // Google OAuth
        GOOGLE_OAUTH_CLIENT_ID: Joi.string().required(),
        GOOGLE_OAUTH_CLIENT_SECRET: Joi.string().required(),
      }),
      validationOptions: {
        allowUnknown: true, // Allow extra env vars not in schema
        abortEarly: false, // Show all validation errors at once
      },
    }),
    SupabaseModule,
    TestDataModule,
    YouTubeModule,
    OAuth2Module,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply auth middleware to protected routes
    consumer.apply(AuthMiddleware).forRoutes('youtube', 'test-data'); // Routes that need auth
  }
}
