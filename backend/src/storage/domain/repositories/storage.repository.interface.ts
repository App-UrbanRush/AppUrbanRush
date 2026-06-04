import { UploadResult } from '../interfaces/upload-result.interface';

export interface IStorageRepository {
  uploadImage(buffer: Buffer, folder: string, filename: string): Promise<UploadResult>;
  deleteImage(publicId: string): Promise<void>;
}
