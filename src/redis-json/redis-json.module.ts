import { Module } from '@nestjs/common';
import { RedisJsonService } from './redis-json.service';

@Module({
  providers: [RedisJsonService],
  exports: [RedisJsonService]
})
export class RedisJsonModule {}
