import type { IStorageRepository, UploadResult } from "../../domain/interfaces/IStorageRepository";
import { storageApi } from "../api/storageApi";

export class StorageRepositoryImpl implements IStorageRepository {
  async uploadImage(file: File, folder: string): Promise<UploadResult> {
    return storageApi.uploadImage(file, folder);
  }

  async uploadProductImage(productId: string, file: File): Promise<{ image_url: string; public_id: string }> {
    return storageApi.uploadProductImage(productId, file);
  }

  async deleteImage(publicId: string): Promise<void> {
    return storageApi.deleteImage(publicId);
  }
}
