import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-ioredis';
import { JWT_SECRET } from 'src/config/constants';
import { CourierEntity } from 'src/courier/infrastructure/persistence/entities/courier.entity';
import { OrderModule } from 'src/order/order.module';
import { RedisGPSRepository } from './infrastructure/repositories/redis-gps.repository';
import { UpdateLocationUseCase } from './application/use-cases/update-location.use-case';
import { GetCourierLocationUseCase } from './application/use-cases/get-courier-location.use-case';
import { GPSGateway } from './infrastructure/gateways/gps.gateway';
import { TrackingController } from './infrastructure/controllers/tracking.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([CourierEntity]),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        store: redisStore,
        host: config.get('REDIS_HOST'),
        port: config.get('REDIS_PORT'),
      }),
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>(JWT_SECRET),
      }),
    }),
    forwardRef(() => OrderModule),
  ],
  controllers: [TrackingController],
  providers: [
    { provide: 'IGPSRepository', useClass: RedisGPSRepository },
    UpdateLocationUseCase,
    GetCourierLocationUseCase,
    GPSGateway,
  ],
  exports: [GPSGateway, GetCourierLocationUseCase, 'IGPSRepository'],
})
export class TrackingModule {}
