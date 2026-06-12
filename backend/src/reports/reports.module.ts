import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order, OrderSchema } from 'src/order/infrastructure/schemas/order.schema';
import { Payment, PaymentSchema } from 'src/payment/infrastructure/schemas/payment.schema';
import { UserEntity } from 'src/user/infrastructure/persistence/entities/user.entity';
import { PeopleEntity } from 'src/people/infrastructure/persistence/entities/people.entity';
import { VendorEntity } from 'src/vendor/infrastructure/persistence/entities/vendor.entity';
import { UserRolesEntity } from 'src/user_rol/infrastructure/persistence/entity/user_rol.entity';
import { CourierEntity } from 'src/courier/infrastructure/persistence/entities/courier.entity';
import { MongoPgReportsRepository } from './infrastructure/repositories/mongo-pg-reports.repository';
import { PdfGeneratorService } from './infrastructure/services/pdf-generator.service';
import { ExcelGeneratorService } from './infrastructure/services/excel-generator.service';
import { GenerateOrdersReportUseCase } from './application/use-cases/generate-orders-report.use-case';
import { GeneratePaymentsReportUseCase } from './application/use-cases/generate-payments-report.use-case';
import { GenerateUsersReportUseCase } from './application/use-cases/generate-users-report.use-case';
import { GenerateVendorReportUseCase } from './application/use-cases/generate-vendor-report.use-case';
import { GenerateCouriersReportUseCase } from './application/use-cases/generate-couriers-report.use-case';
import { ReportsController } from './infrastructure/controllers/reports.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Payment.name, schema: PaymentSchema },
    ]),
    TypeOrmModule.forFeature([UserEntity, PeopleEntity, VendorEntity, UserRolesEntity, CourierEntity]),
  ],
  controllers: [ReportsController],
  providers: [
    MongoPgReportsRepository,
    { provide: 'IReportsRepository', useClass: MongoPgReportsRepository },
    PdfGeneratorService,
    ExcelGeneratorService,
    GenerateOrdersReportUseCase,
    GeneratePaymentsReportUseCase,
    GenerateUsersReportUseCase,
    GenerateVendorReportUseCase,
    GenerateCouriersReportUseCase,
  ],
  exports: [PdfGeneratorService, ExcelGeneratorService, GenerateVendorReportUseCase],
})
export class ReportsModule {}
