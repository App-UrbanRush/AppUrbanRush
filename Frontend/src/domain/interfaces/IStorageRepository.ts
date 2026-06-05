export interface UploadResult {
  image_url: string;
  public_id: string;
}

export interface IStorageRepository {
  uploadImage(file: File, folder: string): Promise<UploadResult>;
  uploadProductImage(productId: string, file: File): Promise<{ image_url: string; public_id: string }>;
  deleteImage(publicId: string): Promise<void>;
}
