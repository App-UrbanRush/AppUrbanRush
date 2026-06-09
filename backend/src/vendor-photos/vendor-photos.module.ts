import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VendorPhoto, VendorPhotoSchema } from './infrastructure/schemas/vendor-photo.schema';
import { MongoVendorPhotoRepository } from './infrastructure/repositories/mongo-vendor-photo.repository';
import { VendorPhotoController } from './infrastructure/controllers/vendor-photo.controller';
import { UploadVendorPhotoUseCase } from './application/use-cases/upload-vendor-photo.use-case';
import { GetVendorPhotosUseCase } from './application/use-cases/get-vendor-photos.use-case';
import { DeleteVendorPhotoUseCase } from './application/use-cases/delete-vendor-photo.use-case';
import { VendorModule } from 'src/vendor/vendor.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: VendorPhoto.name, schema: VendorPhotoSchema }]),
    VendorModule,
    AuthModule,
  ],
  controllers: [VendorPhotoController],
  providers: [
    {
      provide: 'IVendorPhotoRepository',
      useClass: MongoVendorPhotoRepository,
    },
    UploadVendorPhotoUseCase,
    GetVendorPhotosUseCase,
    DeleteVendorPhotoUseCase,
  ],
  exports: ['IVendorPhotoRepository'],
})
export class VendorPhotosModule {}
