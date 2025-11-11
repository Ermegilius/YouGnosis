import { Module } from '@nestjs/common';
import { OAuth2Service } from './oauth2.service';
import { OAuth2Controller } from './oauth2.controller';
import { HttpModule } from '@nestjs/axios';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [HttpModule, SupabaseModule],
  providers: [OAuth2Service],
  controllers: [OAuth2Controller],
  exports: [OAuth2Service], // Export for use in other modules
})
export class OAuth2Module {}
