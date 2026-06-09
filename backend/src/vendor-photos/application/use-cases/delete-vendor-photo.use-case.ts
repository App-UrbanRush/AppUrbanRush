import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { IVendorPhotoRepository } from '../../domain/repositories/vendor-photo.repository';
import { IVendorRepository } from 'src/vendor/domain/repositories/vendor.repository';
import { IStorageRepository } from 'src/storage/domain/repositories/storage.repository.interface';

@Injectable()
export class DeleteVendorPhotoUseCase {
  constructor(
    @Inject('IVendorPhotoRepository')
    private readonly photoRepo: IVendorPhotoRepository,
    @Inject('IVendorRepository')
    private readonly vendorRepo: IVendorRepository,
    @Inject('IStorageRepository')
    private readonly storageRepo: IStorageRepository,
  ) {}

  async execute(userId: number, photoId: string) {
    const vendor = await this.vendorRepo.findByUserId(userId);
    if (!vendor || !vendor.vendor_id) throw new NotFoundException('Vendor no encontrado');

    const photo = await this.photoRepo.findById(photoId);
    if (!photo) throw new NotFoundException('Foto no encontrada');
    if (photo.vendor_id !== vendor.vendor_id) throw new ForbiddenException('No tienes permiso para eliminar esta foto');

    await this.storageRepo.deleteImage(photo.public_id);
    await this.photoRepo.delete(photoId);

    return { message: 'Foto eliminada correctamente' };
  }
}
