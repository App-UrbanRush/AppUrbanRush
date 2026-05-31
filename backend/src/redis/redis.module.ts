// src/redis/redis.module.ts
import { Module, Global } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisSessionRepository } from './infrastructure/repositories/redis-session.repository';
import * as redisStore from 'cache-manager-ioredis';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        store: redisStore,
        host: config.get('REDIS_HOST'),
        port: config.get('REDIS_PORT'),
      }),
    }),
  ],
  providers: [
    RedisSessionRepository,
    {
      provide: 'ISessionRepository',
      useClass: RedisSessionRepository,
    },
  ],
  exports: ['ISessionRepository'],
})
export class RedisModule {}