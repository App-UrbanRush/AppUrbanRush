import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from './infrastructure/schemas/payment.schema';
import { MongoPaymentRepository } from './infrastructure/repositories/mongo-payment.repository';
import { WompiService } from './infrastructure/services/wompi.service';
import { CreatePaymentUseCase } from './application/use-cases/create-payment.use-case';
import { ConfirmPaymentUseCase } from './application/use-cases/confirm-payment.use-case';
import { GetPaymentByOrderUseCase } from './application/use-cases/get-payment-by-order.use-case';
import { GetPaymentsByUserUseCase } from './application/use-cases/get-payments-by-user.use-case';
import { GetPaymentsByVendorUseCase } from './application/use-cases/get-payments-by-vendor.use-case';
import { PaymentController } from './infrastructure/controllers/payment.controller';
import { OrderModule } from 'src/order/order.module';
import { LiquidationModule } from 'src/liquidation/liquidation.module';
import { ProductModule } from 'src/product/product.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }]),
    OrderModule,
    LiquidationModule,
    ProductModule,
  ],
  controllers: [PaymentController],
  providers: [
    MongoPaymentRepository,
    { provide: 'IPaymentRepository', useClass: MongoPaymentRepository },
    WompiService,
    CreatePaymentUseCase,
    ConfirmPaymentUseCase,
    GetPaymentByOrderUseCase,
    GetPaymentsByUserUseCase,    
    GetPaymentsByVendorUseCase, 
  ],
  exports: ['IPaymentRepository'],
})
export class PaymentModule {}