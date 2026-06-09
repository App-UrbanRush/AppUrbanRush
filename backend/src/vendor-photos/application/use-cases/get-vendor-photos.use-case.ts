import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IVendorPhotoRepository } from '../../domain/repositories/vendor-photo.repository';
import { IVendorRepository } from 'src/vendor/domain/repositories/vendor.repository';

@Injectable()
export class GetVendorPhotosUseCase {
  constructor(
    @Inject('IVendorPhotoRepository')
    private readonly photoRepo: IVendorPhotoRepository,
    @Inject('IVendorRepository')
    private readonly vendorRepo: IVendorRepository,
  ) {}

  async execute(userId: number) {
    const vendor = await this.vendorRepo.findByUserId(userId);
    if (!vendor || !vendor.vendor_id) throw new NotFoundException('Vendor no encontrado');

    const photos = await this.photoRepo.findByVendor(vendor.vendor_id);
    return photos.map((p) => ({
      photo_id: p.id,
      image_url: p.image_url,
      order: p.order,
      type: p.type,
    }));
  }
}
