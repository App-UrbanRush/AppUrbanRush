import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { VendorEntity } from './infrastructure/persistence/entities/vendor.entity';
import { TypeOrmVendorRepository } from './infrastructure/persistence/repositories/typeorm-vendor.repository';
import { VendorController } from './infrastructure/controllers/vendor.controller';
import { GetVendorProfileUseCase } from './application/use-cases/get-vendor-profile.use-case';
import { UpdateVendorProfileUseCase } from './application/use-cases/update-vendor-profile.use-case';
import { GetVendorCouriersUseCase } from './application/use-cases/get-vendor-couriers.use-case';
import { GetVendorReportDataUseCase } from './application/use-cases/get-vendor-report-data.use-case';
import { GenerateVendorOrdersPdfUseCase } from './application/use-cases/generate-vendor-orders-pdf.use-case';
import { GenerateVendorOrdersExcelUseCase } from './application/use-cases/generate-vendor-orders-excel.use-case';
import { GetVendorPendingOrdersUseCase } from './application/use-cases/get-vendor-pending-orders.use-case';
import { Order, OrderSchema } from '../order/infrastructure/schemas/order.schema';
import { CourierEntity } from '../courier/infrastructure/persistence/entities/courier.entity';
import { PeopleEntity } from '../people/infrastructure/persistence/entities/people.entity';
import { ReportsModule } from '../reports/reports.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([VendorEntity, CourierEntity, PeopleEntity]),
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    ReportsModule,
  ],
  controllers: [VendorController],
  providers: [
    GetVendorProfileUseCase,
    UpdateVendorProfileUseCase,
    GetVendorCouriersUseCase,
    GetVendorReportDataUseCase,
    GenerateVendorOrdersPdfUseCase,
    GenerateVendorOrdersExcelUseCase,
    GetVendorPendingOrdersUseCase,
    {
      provide: 'IVendorRepository',
      useClass: TypeOrmVendorRepository,
    },
  ],
  exports: ['IVendorRepository'],
})
export class VendorModule {}