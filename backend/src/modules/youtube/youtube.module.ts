import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { YouTubeService } from './youtube.service';
import { YouTubeController } from './youtube.controller';
import { OAuth2Module } from '../oauth2/oauth2.module';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    OAuth2Module,
  ],
  controllers: [YouTubeController],
  providers: [YouTubeService],
})
export class YouTubeModule {}
