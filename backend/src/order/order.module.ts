import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order, OrderSchema } from './infrastructure/schemas/order.schema';
import { MongoOrderRepository } from './infrastructure/repositories/mongo-order.repository';
import { CreateOrderUseCase } from './application/use-cases/create-order.use-case';
import { GetOrdersByUserUseCase } from './application/use-cases/get-orders-by-user.use-case';
import { GetOrdersByVendorUseCase } from './application/use-cases/get-orders-by-vendor.use-case';
import { GetAvailableOrdersUseCase } from './application/use-cases/get-available-orders.use-case';
import { GetOrdersByCourierUseCase } from './application/use-cases/get-orders-by-courier.use-case';
import { GetOrderByIdUseCase } from './application/use-cases/get-order-by-id.use-case';
import { UpdateOrderStatusUseCase } from './application/use-cases/update-order-status.use-case';
import { ConfirmDeliveryUseCase } from './application/use-cases/confirm-delivery.use-case';
import { GetAllVendorOrdersUseCase } from './application/use-cases/get-all-vendor-orders.use-case';
import { GetCourierActiveOrdersUseCase } from './application/use-cases/get-courier-active-orders.use-case';
import { GetVendorRecentOrdersUseCase } from './application/use-cases/get-vendor-recent-orders.use-case';
import { OrderAutoCancelService } from './infrastructure/services/order-auto-cancel.service';
import { OrderStateMachine } from './domain/state/order-state-machine';
import { OrderController } from './infrastructure/controllers/order.controller';
import { ProductModule } from 'src/product/product.module';
import { LiquidationModule } from 'src/liquidation/liquidation.module';
import { TrackingModule } from 'src/tracking/tracking.module';
import { EmailModule } from 'src/email/email.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { VendorEntity } from 'src/vendor/infrastructure/persistence/entities/vendor.entity';
import { PeopleEntity } from 'src/people/infrastructure/persistence/entities/people.entity';
import { CourierEntity } from 'src/courier/infrastructure/persistence/entities/courier.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    TypeOrmModule.forFeature([VendorEntity, PeopleEntity, CourierEntity]),
    ProductModule,
    forwardRef(() => LiquidationModule),
    forwardRef(() => TrackingModule),
    EmailModule,
    NotificationsModule,
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
    GetOrderByIdUseCase,
    UpdateOrderStatusUseCase,
    ConfirmDeliveryUseCase,
    GetAllVendorOrdersUseCase,
    GetCourierActiveOrdersUseCase,
    GetVendorRecentOrdersUseCase,
    OrderAutoCancelService,
    OrderStateMachine,
  ],
  exports: ['IOrderRepository'],
})
export class OrderModule {}