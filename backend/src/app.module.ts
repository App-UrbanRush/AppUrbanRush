// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { RolesModule } from './roles/roles.module';
import { DB_DATABASE, DB_HOST, DB_PASSWORD, DB_PORT, DB_USER } from './config/constants';
import { PeopleModule } from './people/people.module';
import { AuthModule } from './auth/auth.module';
import { CourierModule } from './courier/courier.module';
import { VerificationModule } from './verification/verification.module';
import { VendorModule } from './vendor/vendor.module';
import { EmailModule } from './email/email.module';
import { RedisModule } from './redis/redis.module';
import { ProductModule } from './product/product.module';
import { OrderModule } from './order/order.module';
import { PaymentModule } from './payment/payment.module';
import { SharedModule } from './shared/shared.module';
import { BackupModule } from './backup/backup.module';
import { AdminModule } from './admin/admin.module';
import { ChatModule } from './chat/chat.module';
import { StoreVerificationModule } from './store-verification/store-verification.module';
import { StorageModule } from './storage/storage.module';
import { HealthModule } from './health/health.module';
import { EncryptedFileModule } from './encrypted-file/encrypted-file.module';
import { ReportsModule } from './reports/reports.module';
import { CategoryModule } from './category/category.module';
import { VendorPhotosModule } from './vendor-photos/vendor-photos.module';
import { CourierVendorRequestModule } from './courier-vendor-request/courier-vendor-request.module';
import { LiquidationModule } from './liquidation/liquidation.module';
import { TrackingModule } from './tracking/tracking.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),

    // PostgreSQL — usuarios, roles, auth
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>(DB_HOST),
        port: configService.get<number>(DB_PORT) ?? 5432,
        username: configService.get<string>(DB_USER),
        password: configService.get<string>(DB_PASSWORD),
        database: configService.get<string>(DB_DATABASE),
        autoLoadEntities: true,
        synchronize: true,
        logging: false,
      }),
    }),

    // MongoDB — productos, pedidos
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
    }),

    UserModule,
    RolesModule,
    PeopleModule,
    AuthModule,
    CourierModule,
    VerificationModule,
    VendorModule,
    EmailModule,
    RedisModule,
    ProductModule,
    OrderModule,
    PaymentModule,
    SharedModule,
    BackupModule,
    AdminModule,
    ChatModule,
    StoreVerificationModule,
    StorageModule,
    HealthModule,
    EncryptedFileModule,
    ReportsModule,
    CategoryModule,
    VendorPhotosModule,
    CourierVendorRequestModule,
    LiquidationModule,
    TrackingModule,
  ],
})
export class AppModule {}