import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourierVendorRequestEntity } from './infrastructure/persistence/entities/courier-vendor-request.entity';
import { TypeOrmCourierVendorRequestRepository } from './infrastructure/persistence/repositories/typeorm-courier-vendor-request.repository';
import { CourierVendorRequestController } from './infrastructure/controllers/courier-vendor-request.controller';
import { SendCourierVendorRequestUseCase } from './application/use-cases/send-courier-vendor-request.use-case';
import { GetMyCourierVendorRequestsUseCase } from './application/use-cases/get-my-courier-vendor-requests.use-case';
import { GetVendorCourierRequestsUseCase } from './application/use-cases/get-vendor-courier-requests.use-case';
import { UpdateCourierVendorRequestStatusUseCase } from './application/use-cases/update-courier-vendor-request-status.use-case';
import { GetCourierDetailsUseCase } from './application/use-cases/get-courier-details.use-case';
import { VendorModule } from '../vendor/vendor.module';
import { PeopleEntity } from '../people/infrastructure/persistence/entities/people.entity';
import { CourierEntity } from '../courier/infrastructure/persistence/entities/courier.entity';
import { UserEntity } from '../user/infrastructure/persistence/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CourierVendorRequestEntity, PeopleEntity, CourierEntity, UserEntity]),
    VendorModule,
  ],
  controllers: [CourierVendorRequestController],
  providers: [
    {
      provide: 'ICourierVendorRequestRepository',
      useClass: TypeOrmCourierVendorRequestRepository,
    },
    SendCourierVendorRequestUseCase,
    GetMyCourierVendorRequestsUseCase,
    GetVendorCourierRequestsUseCase,
    UpdateCourierVendorRequestStatusUseCase,
    GetCourierDetailsUseCase,
  ],
  exports: ['ICourierVendorRequestRepository'],
})
export class CourierVendorRequestModule {}
