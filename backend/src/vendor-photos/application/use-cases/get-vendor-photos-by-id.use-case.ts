import { Injectable, Inject } from '@nestjs/common';
import { IVendorPhotoRepository } from '../../domain/repositories/vendor-photo.repository';

@Injectable()
export class GetVendorPhotosByIdUseCase {
  constructor(
    @Inject('IVendorPhotoRepository')
    private readonly photoRepo: IVendorPhotoRepository,
  ) {}

  async execute(vendorId: number) {
    const photos = await this.photoRepo.findByVendor(vendorId);
    return photos.map((p) => ({
      photo_id: p.id,
      image_url: p.image_url,
      order: p.order,
      type: p.type,
    }));
  }
}
