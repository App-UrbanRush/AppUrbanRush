import type { IStorageRepository } from "../../domain/interfaces/IStorageRepository";

export class DeleteImageUseCase {
  constructor(private readonly storageRepository: IStorageRepository) {}

  async execute(publicId: string): Promise<void> {
    return this.storageRepository.deleteImage(publicId);
  }
}
