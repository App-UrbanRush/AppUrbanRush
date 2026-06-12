import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourierEntity } from './infrastructure/persistence/entities/courier.entity';
import { TypeOrmCourierRepository } from './infrastructure/persistence/repositories/typeorm-courier.repository';
import { CourierController } from './infrastructure/controllers/courier.controller';
import { GetCourierProfileUseCase } from './application/use-cases/get-courier-profile.use-case';
import { UpdateCourierProfileUseCase } from './application/use-cases/update-courier-profile.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([CourierEntity])],
  controllers: [CourierController], 
  providers: [
    GetCourierProfileUseCase,
    UpdateCourierProfileUseCase,
    {
      provide: 'ICourierRepository',
      useClass: TypeOrmCourierRepository,
    },
  ],
  exports: ['ICourierRepository']
})
export class CourierModule {}