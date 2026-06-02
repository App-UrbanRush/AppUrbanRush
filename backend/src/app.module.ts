// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
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


@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),

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
  ],
})
export class AppModule {}