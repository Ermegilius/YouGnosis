import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { YouTubeService } from './youtube.service';
import { YouTubeController } from './youtube.controller';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    ConfigModule,
  ],
  controllers: [YouTubeController],
  providers: [YouTubeService],
})
export class YouTubeModule {}
