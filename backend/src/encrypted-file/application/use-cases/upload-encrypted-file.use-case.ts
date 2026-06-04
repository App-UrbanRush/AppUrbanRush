import { Injectable, Inject } from '@nestjs/common';
import { IEncryptedFileRepository } from '../../domain/repositories/encrypted-file.repository.interface';
import { EncryptionService } from '../../infrastructure/services/encryption.service';
import { CloudinaryService } from '../../infrastructure/services/cloudinary.service';
import { EncryptedFileModel, FileType } from '../../domain/entities/encrypted-file.model';
import { randomUUID } from 'crypto';

@Injectable()
export class UploadEncryptedFileUseCase {
  constructor(
    @Inject('IEncryptedFileRepository')
    private readonly fileRepository: IEncryptedFileRepository,
    private readonly encryptionService: EncryptionService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async execute(
    file: Express.Multer.File,
    fileType: FileType,
    ownerId: number,
  ): Promise<EncryptedFileModel> {
    // 1. Encriptar archivo
    const { encryptedBuffer, iv, authTag, wrappedKey } =
      this.encryptionService.encrypt(file.buffer);

    // 2. Subir a Cloudinary (encriptado)
    const folder = `encrypted/${fileType.toLowerCase()}`;
    const filename = `${ownerId}-${randomUUID()}`;
    const { public_id, secure_url } = await this.cloudinaryService.upload(
      encryptedBuffer,
      folder,
      filename,
    );

    // 3. Guardar metadata en PostgreSQL
    const model = new EncryptedFileModel(
      null,
      file.originalname,
      file.mimetype,
      public_id,
      secure_url,
      iv,
      authTag,
      wrappedKey,
      fileType,
      ownerId,
      null,
    );

    return this.fileRepository.create(model);
  }
}
