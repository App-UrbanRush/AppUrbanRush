import { Module, forwardRef } from '@nestjs/common';
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
import { GetAllVendorsUseCase } from './application/use-cases/get-all-vendors.use-case';
import { GetVendorPhotosByIdUseCase } from '../vendor-photos/application/use-cases/get-vendor-photos-by-id.use-case';
import { VendorPhoto, VendorPhotoSchema } from '../vendor-photos/infrastructure/schemas/vendor-photo.schema';
import { MongoVendorPhotoRepository } from '../vendor-photos/infrastructure/repositories/mongo-vendor-photo.repository';
import { GetVendorDashboardStatsUseCase } from './application/use-cases/get-vendor-dashboard-stats.use-case';
import { UpdateVendorProfileDto } from './application/dts/update-vendor-profile.dto';
import { Order, OrderSchema } from '../order/infrastructure/schemas/order.schema';
import { CourierEntity } from '../courier/infrastructure/persistence/entities/courier.entity';
import { PeopleEntity } from '../people/infrastructure/persistence/entities/people.entity';
import { CourierVendorRequestEntity } from '../courier-vendor-request/infrastructure/persistence/entities/courier-vendor-request.entity';
import { ReportsModule } from '../reports/reports.module';
import { TrackingModule } from '../tracking/tracking.module';
import { ProductModule } from '../product/product.module';
import { ReviewModule } from '../review/review.module';
import { VendorStatsListener } from './infrastructure/listeners/vendor-stats.listener';

@Module({
  imports: [
    TypeOrmModule.forFeature([VendorEntity, CourierEntity, PeopleEntity, CourierVendorRequestEntity]),
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: VendorPhoto.name, schema: VendorPhotoSchema },
    ]),
    ProductModule,
    ReportsModule,
    forwardRef(() => TrackingModule),
    ReviewModule,
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
    GetAllVendorsUseCase,
    GetVendorPhotosByIdUseCase,
    GetVendorDashboardStatsUseCase,
    VendorStatsListener,
    {
      provide: 'IVendorRepository',
      useClass: TypeOrmVendorRepository,
    },
    {
      provide: 'IVendorPhotoRepository',
      useClass: MongoVendorPhotoRepository,
    },
  ],
  exports: ['IVendorRepository'],
})
export class VendorModule {}