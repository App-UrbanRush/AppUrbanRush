import type { IStorageRepository, UploadResult } from "../../domain/interfaces/IStorageRepository";
import { storageApi } from "../api/storageApi";

export class StorageRepositoryImpl implements IStorageRepository {
  async uploadImage(file: File, _folder: string): Promise<UploadResult> {
    const result = await storageApi.uploadVendorLogo(file);
    return {
      image_url: result.logo_url,
      public_id: result.public_id,
    };
  }

  async uploadProductImage(_productId: string, file: File): Promise<{ image_url: string; public_id: string }> {
    const result = await storageApi.uploadVendorLogo(file);
    return {
      image_url: result.logo_url,
      public_id: result.public_id,
    };
  }

  async uploadVendorLogo(file: File): Promise<{ logo_url: string; public_id: string }> {
    return storageApi.uploadVendorLogo(file);
  }

  async uploadVendorStorefront(file: File): Promise<{ storefront_image_url: string; public_id: string }> {
    return storageApi.uploadVendorStorefront(file);
  }

  async deleteImage(_publicId: string): Promise<void> {
    // TODO: Implement delete endpoint if needed
  }
}
