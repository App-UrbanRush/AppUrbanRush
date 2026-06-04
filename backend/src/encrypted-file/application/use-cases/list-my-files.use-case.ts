import { Injectable, Inject } from '@nestjs/common';
import { IEncryptedFileRepository } from '../../domain/repositories/encrypted-file.repository.interface';

@Injectable()
export class ListMyFilesUseCase {
  constructor(
    @Inject('IEncryptedFileRepository')
    private readonly fileRepository: IEncryptedFileRepository,
  ) {}

  async execute(ownerId: number) {
    const files = await this.fileRepository.findByOwnerId(ownerId);

    // Retornar sin datos sensibles de encriptación
    return files.map((f) => ({
      id: f.id,
      original_filename: f.original_filename,
      mime_type: f.mime_type,
      file_type: f.file_type,
      created_at: f.created_at,
    }));
  }
}
