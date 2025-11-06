import { Module } from '@nestjs/common';
import { SupabaseModule } from '../supabase/supabase.module';
import { TestDataController } from './test-data.controller';
import { TestDataService } from './test-data.service';

@Module({
  imports: [SupabaseModule],
  controllers: [TestDataController],
  providers: [TestDataService],
})
export class TestDataModule {}
