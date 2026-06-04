import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import axios from 'axios';
import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} from 'src/config/constants';

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
}

@Injectable()
export class CloudinaryService {
  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>(CLOUDINARY_CLOUD_NAME),
      api_key: this.configService.get<string>(CLOUDINARY_API_KEY),
      api_secret: this.configService.get<string>(CLOUDINARY_API_SECRET),
    });
  }

  async upload(
    buffer: Buffer,
    folder: string,
    filename: string,
  ): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          folder: `urbanrush/${folder}`,
          public_id: filename,
        },
        (error, result: UploadApiResponse | undefined) => {
          if (error || !result) {
            reject(new InternalServerErrorException('Error al subir archivo a Cloudinary'));
            return;
          }
          resolve({
            public_id: result.public_id,
            secure_url: result.secure_url,
          });
        },
      );
      stream.end(buffer);
    });
  }

  async download(secureUrl: string): Promise<Buffer> {
    const response = await axios.get(secureUrl, { responseType: 'arraybuffer' });
    return Buffer.from(response.data);
  }

  async delete(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
  }
}
