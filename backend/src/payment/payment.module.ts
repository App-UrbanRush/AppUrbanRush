import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from './infrastructure/schemas/payment.schema';
import { MongoPaymentRepository } from './infrastructure/repositories/mongo-payment.repository';
import { WompiService } from './infrastructure/services/wompi.service';
import { CreatePaymentUseCase } from './application/use-cases/create-payment.use-case';
import { ConfirmPaymentUseCase } from './application/use-cases/confirm-payment.use-case';
import { GetPaymentByOrderUseCase } from './application/use-cases/get-payment-by-order.use-case';
import { PaymentController } from './infrastructure/controllers/payment.controller';
import { OrderModule } from 'src/order/order.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }]),
    OrderModule,
  ],
  controllers: [PaymentController],
  providers: [
    MongoPaymentRepository,
    { provide: 'IPaymentRepository', useClass: MongoPaymentRepository },
    WompiService,
    CreatePaymentUseCase,
    ConfirmPaymentUseCase,
    GetPaymentByOrderUseCase,
  ],
  exports: ['IPaymentRepository'],
})
export class PaymentModule {}
