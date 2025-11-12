import { Module } from '@nestjs/common';
import { SupabaseModule } from '@src/modules/supabase/supabase.module';
import { OAuth2Module } from '@src/modules/oauth2/oauth2.module';
import { AuthMiddleware } from '@src/middleware/Auth.middleware';

@Module({
  imports: [SupabaseModule, OAuth2Module],
  providers: [AuthMiddleware],
  exports: [AuthMiddleware],
})
export class AuthModule {}
