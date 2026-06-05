import { Injectable, Inject } from '@nestjs/common';
import { IStorageRepository } from '../../domain/repositories/storage.repository.interface';
import { randomUUID } from 'crypto';

@Injectable()
export class UploadImageUseCase {
  constructor(
    @Inject('IStorageRepository')
    private readonly storageRepo: IStorageRepository,
  ) {}

  async execute(file: Express.Multer.File, folder: string) {
    const filename = `${Date.now()}-${randomUUID()}`;
    const result = await this.storageRepo.uploadImage(file.buffer, folder, filename);
    return { image_url: result.secure_url, public_id: result.public_id };
  }
}
