import type { IStorageRepository, UploadResult } from "../../domain/interfaces/IStorageRepository";

export class UploadImageUseCase {
  constructor(private readonly storageRepository: IStorageRepository) {}

  async execute(file: File, folder: string): Promise<UploadResult> {
    return this.storageRepository.uploadImage(file, folder);
  }
}
