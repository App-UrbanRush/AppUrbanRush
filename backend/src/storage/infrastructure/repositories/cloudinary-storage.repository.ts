import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { IStorageRepository } from '../../domain/repositories/storage.repository.interface';
import { UploadResult } from '../../domain/interfaces/upload-result.interface';
import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} from 'src/config/constants';

@Injectable()
export class CloudinaryStorageRepository implements IStorageRepository {
  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>(CLOUDINARY_CLOUD_NAME),
      api_key: this.configService.get<string>(CLOUDINARY_API_KEY),
      api_secret: this.configService.get<string>(CLOUDINARY_API_SECRET),
    });
  }

  async uploadImage(buffer: Buffer, folder: string, filename: string): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: `urbanrush/${folder}`,
          public_id: filename,
          transformation: [
            { width: 800, height: 800, crop: 'limit' },
            { quality: 'auto:good' },
            { fetch_format: 'webp' },
          ],
          overwrite: true,
        },
        (error, result: UploadApiResponse | undefined) => {
          if (error || !result) {
            reject(new InternalServerErrorException('Error al subir imagen a Cloudinary'));
            return;
          }
          resolve({
            public_id: result.public_id,
            secure_url: result.secure_url,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
          });
        },
      );
      stream.end(buffer);
    });
  }

  async deleteImage(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
  }
}
