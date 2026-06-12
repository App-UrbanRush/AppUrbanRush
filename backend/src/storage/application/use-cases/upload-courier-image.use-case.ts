import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IStorageRepository } from '../../domain/repositories/storage.repository.interface';
import { ICourierRepository } from 'src/courier/domain/repositories/courier.repository';
import { randomUUID } from 'crypto';

@Injectable()
export class UploadCourierImageUseCase {
  constructor(
    @Inject('IStorageRepository')
    private readonly storageRepo: IStorageRepository,
    @Inject('ICourierRepository')
    private readonly courierRepo: ICourierRepository,
  ) {}

  async executePhoto(userId: number, file: Express.Multer.File) {
    const courier = await this.courierRepo.findByUserId(userId);
    if (!courier || !courier.couriers_id) throw new NotFoundException('Domiciliario no encontrado');

    const filename = `courier-photo-${courier.couriers_id}-${randomUUID()}`;
    const result = await this.storageRepo.uploadImage(file.buffer, 'couriers/photos', filename);

    await this.courierRepo.updateProfile(userId, { photo_url: result.secure_url });

    return { photo_url: result.secure_url, public_id: result.public_id };
  }
}
