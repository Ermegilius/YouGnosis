import { Module } from '@nestjs/common';
import { OAuth2Service } from './oauth2.service';
import { OAuth2Controller } from './oauth2.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [OAuth2Service],
  controllers: [OAuth2Controller],
})
export class OAuth2Module {}
