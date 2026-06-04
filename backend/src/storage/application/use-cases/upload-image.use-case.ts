import { Injectable, Inject } from '@nestjs/common';
import { IStorageRepository } from '../../domain/repositories/storage.repository.interface';
import { UploadResult } from '../../domain/interfaces/upload-result.interface';
import { randomUUID } from 'crypto';

@Injectable()
export class UploadImageUseCase {
  constructor(
    @Inject('IStorageRepository')
    private readonly storageRepo: IStorageRepository,
  ) {}

  async execute(file: Express.Multer.File, folder: string): Promise<UploadResult> {
    const filename = `${Date.now()}-${randomUUID()}`;
    return this.storageRepo.uploadImage(file.buffer, folder, filename);
  }
}
