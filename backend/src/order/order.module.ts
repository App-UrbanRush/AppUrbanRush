import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './infrastructure/schemas/order.schema';
import { MongoOrderRepository } from './infrastructure/repositories/mongo-order.repository';
import { CreateOrderUseCase } from './application/use-cases/create-order.use-case';
import { GetOrdersByUserUseCase } from './application/use-cases/get-orders-by-user.use-case';
import { GetOrdersByVendorUseCase } from './application/use-cases/get-orders-by-vendor.use-case';
import { GetAvailableOrdersUseCase } from './application/use-cases/get-available-orders.use-case';
import { GetOrdersByCourierUseCase } from './application/use-cases/get-orders-by-courier.use-case';
import { UpdateOrderStatusUseCase } from './application/use-cases/update-order-status.use-case';
import { OrderController } from './infrastructure/controllers/order.controller';
import { ProductModule } from 'src/product/product.module';
import { LiquidationModule } from 'src/liquidation/liquidation.module';
import { TrackingModule } from 'src/tracking/tracking.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    ProductModule,
    forwardRef(() => LiquidationModule),
    forwardRef(() => TrackingModule),
  ],
  controllers: [OrderController],
  providers: [
    MongoOrderRepository,
    { provide: 'IOrderRepository', useClass: MongoOrderRepository },
    CreateOrderUseCase,
    GetOrdersByUserUseCase,
    GetOrdersByVendorUseCase,
    GetAvailableOrdersUseCase,
    GetOrdersByCourierUseCase,
    UpdateOrderStatusUseCase,
  ],
  exports: ['IOrderRepository'],
})
export class OrderModule {}