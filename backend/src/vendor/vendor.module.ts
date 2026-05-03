import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VendorEntity } from './infrastructure/persistence/entities/vendor.entity';
import { TypeOrmVendorRepository } from './infrastructure/persistence/repositories/typeorm-vendor.repository';
import { VendorController } from './infrastructure/controllers/vendor.controller';
import { GetVendorProfileUseCase } from './application/use-cases/get-vendor-profile.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([VendorEntity])],
  controllers: [VendorController],
  providers: [
    GetVendorProfileUseCase,
    {
      provide: 'IVendorRepository',
      useClass: TypeOrmVendorRepository,
    },
  ],
  exports: ['IVendorRepository'],
})
export class VendorModule {}