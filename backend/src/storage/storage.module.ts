import { Module, Global } from '@nestjs/common';
import { CloudinaryStorageRepository } from './infrastructure/repositories/cloudinary-storage.repository';
import { UploadImageUseCase } from './application/use-cases/upload-image.use-case';
import { DeleteImageUseCase } from './application/use-cases/delete-image.use-case';
import { UploadProductImageUseCase } from './application/use-cases/upload-product-image.use-case';
import { UploadVendorImageUseCase } from './application/use-cases/upload-vendor-image.use-case';
import { UploadAvatarImageUseCase } from './application/use-cases/upload-avatar-image.use-case';
import { UploadCourierImageUseCase } from './application/use-cases/upload-courier-image.use-case';
import { StorageController } from './infrastructure/controllers/storage.controller';
import { ProductModule } from 'src/product/product.module';
import { VendorModule } from 'src/vendor/vendor.module';
import { PeopleModule } from 'src/people/people.module';
import { CourierModule } from 'src/courier/courier.module';

@Global()
@Module({
  imports: [ProductModule, VendorModule, PeopleModule, CourierModule],
  controllers: [StorageController],
  providers: [
    CloudinaryStorageRepository,
    { provide: 'IStorageRepository', useClass: CloudinaryStorageRepository },
    UploadImageUseCase,
    DeleteImageUseCase,
    UploadProductImageUseCase,
    UploadVendorImageUseCase,
    UploadAvatarImageUseCase,
    UploadCourierImageUseCase,
  ],
  exports: ['IStorageRepository', UploadImageUseCase, DeleteImageUseCase],
})
export class StorageModule {}
