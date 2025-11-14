import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@common/supabase.types';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private readonly logger = new Logger(SupabaseService.name);
  private supabaseClient: SupabaseClient<Database>;
  private supabaseAdmin: SupabaseClient<Database>;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    const supabaseUrl = this.configService.getOrThrow<string>('SUPABASE_URL');
    const publishableKey = this.configService.getOrThrow<string>(
      'SUPABASE_PUBLISHABLE_KEY',
    );
    const secretKey = this.configService.getOrThrow<string>(
      'SUPABASE_SECRET_KEY_DEFAULT',
    );

    // Client for user-scoped operations (respects RLS policies)
    this.supabaseClient = createClient<Database>(supabaseUrl, publishableKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    // Admin client for privileged operations (bypasses RLS)
    this.supabaseAdmin = createClient<Database>(supabaseUrl, secretKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    this.logger.log('✅ Supabase clients initialized successfully');
    this.logger.debug(`📍 Supabase URL: ${supabaseUrl}`);
  }

  /**
   * Get the standard Supabase client (respects RLS policies)
   * Use this for user-scoped operations
   */
  getClient(): SupabaseClient<Database> {
    return this.supabaseClient;
  }

  /**
   * Get the admin Supabase client (bypasses RLS policies)
   * Use this for administrative operations only
   *
   * ⚠️ SECURITY WARNING: This client bypasses Row Level Security.
   * Only use in secure backend contexts. Never expose to frontend.
   */
  getAdminClient(): SupabaseClient<Database> {
    return this.supabaseAdmin;
  }

  /**
   * Health check to verify Supabase connection
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    details?: string;
  }> {
    try {
      const { error } = await this.supabaseClient
        .from('test_table')
        .select('id')
        .limit(1);

      if (error) {
        this.logger.error('❌ Supabase health check failed:', error.message);
        return {
          status: 'unhealthy',
          details: error.message,
        };
      }

      this.logger.debug('✅ Supabase health check passed');
      return {
        status: 'healthy',
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error('❌ Supabase health check error:', message);
      return {
        status: 'unhealthy',
        details: message,
      };
    }
  }
}
