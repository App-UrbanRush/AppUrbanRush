import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IStorageRepository } from '../../domain/repositories/storage.repository.interface';
import { IVendorRepository } from 'src/vendor/domain/repositories/vendor.repository';
import { randomUUID } from 'crypto';

@Injectable()
export class UploadVendorImageUseCase {
  constructor(
    @Inject('IStorageRepository')
    private readonly storageRepo: IStorageRepository,
    @Inject('IVendorRepository')
    private readonly vendorRepo: IVendorRepository,
  ) {}

  async executeLogo(userId: number, file: Express.Multer.File) {
    const vendor = await this.vendorRepo.findByUserId(userId);
    if (!vendor || !vendor.vendor_id) throw new NotFoundException('Vendor no encontrado');

    const filename = `vendor-logo-${vendor.vendor_id}-${randomUUID()}`;
    const result = await this.storageRepo.uploadImage(file.buffer, 'vendors/logos', filename);

    // Guardar URL directamente en la entidad vendor
    await this.vendorRepo.save({ ...vendor, logo_url: result.secure_url } as any);

    return { logo_url: result.secure_url, public_id: result.public_id };
  }

  async executeStorefront(userId: number, file: Express.Multer.File) {
    const vendor = await this.vendorRepo.findByUserId(userId);
    if (!vendor || !vendor.vendor_id) throw new NotFoundException('Vendor no encontrado');

    const filename = `vendor-storefront-${vendor.vendor_id}-${randomUUID()}`;
    const result = await this.storageRepo.uploadImage(file.buffer, 'vendors/storefronts', filename);

    await this.vendorRepo.save({ ...vendor, storefront_image_url: result.secure_url } as any);

    return { storefront_image_url: result.secure_url, public_id: result.public_id };
  }
}
