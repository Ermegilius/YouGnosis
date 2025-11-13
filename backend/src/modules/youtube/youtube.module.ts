import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { YouTubeService } from './youtube.service';
import { YouTubeController } from './youtube.controller';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    SupabaseModule,
  ],
  controllers: [YouTubeController],
  providers: [YouTubeService],
})
export class YouTubeModule {}
