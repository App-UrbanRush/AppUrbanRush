import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IStorageRepository } from 'src/storage/domain/repositories/storage.repository.interface';
import { IVendorPhotoRepository } from '../../domain/repositories/vendor-photo.repository';
import { IVendorRepository } from 'src/vendor/domain/repositories/vendor.repository';
import { randomUUID } from 'crypto';

@Injectable()
export class UploadVendorPhotoUseCase {
  constructor(
    @Inject('IStorageRepository')
    private readonly storageRepo: IStorageRepository,
    @Inject('IVendorPhotoRepository')
    private readonly photoRepo: IVendorPhotoRepository,
    @Inject('IVendorRepository')
    private readonly vendorRepo: IVendorRepository,
  ) {}

  async execute(userId: number, file: Express.Multer.File) {
    const vendor = await this.vendorRepo.findByUserId(userId);
    if (!vendor || !vendor.vendor_id) throw new NotFoundException('Vendor no encontrado');

    const filename = `vendor-photo-${vendor.vendor_id}-${randomUUID()}`;
    const result = await this.storageRepo.uploadImage(file.buffer, 'vendors/photos', filename);

    const photo = await this.photoRepo.create(
      vendor.vendor_id,
      result.secure_url,
      result.public_id,
      'storefront',
    );

    return {
      photo_id: photo.id,
      image_url: photo.image_url,
      public_id: photo.public_id,
    };
  }
}
