import { Injectable, Inject } from '@nestjs/common';
import { IStorageRepository } from '../../domain/repositories/storage.repository.interface';

@Injectable()
export class DeleteImageUseCase {
  constructor(
    @Inject('IStorageRepository')
    private readonly storageRepo: IStorageRepository,
  ) {}

  async execute(publicId: string): Promise<void> {
    await this.storageRepo.deleteImage(publicId);
  }
}
