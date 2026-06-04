import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { IEncryptedFileRepository } from '../../domain/repositories/encrypted-file.repository.interface';
import { EncryptionService } from '../../infrastructure/services/encryption.service';
import { CloudinaryService } from '../../infrastructure/services/cloudinary.service';
import { UserRole, ROLE_HIERARCHY } from 'src/auth/infrastructure/decorators/roles.decorator';

export interface DecryptedFileResult {
  buffer: Buffer;
  filename: string;
  mimeType: string;
}

@Injectable()
export class DecryptFileUseCase {
  constructor(
    @Inject('IEncryptedFileRepository')
    private readonly fileRepository: IEncryptedFileRepository,
    private readonly encryptionService: EncryptionService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async execute(
    fileId: number,
    userId: number,
    userRoles: number[],
  ): Promise<DecryptedFileResult> {
    const file = await this.fileRepository.findById(fileId);
    if (!file) throw new NotFoundException('Archivo no encontrado');

    // Validar privilegios
    if (!this.canAccess(file.owner_id, userId, userRoles)) {
      throw new ForbiddenException('No tienes permisos para acceder a este archivo');
    }

    // Descargar de Cloudinary (buffer encriptado)
    const encryptedBuffer = await this.cloudinaryService.download(file.cloudinary_url);

    // Descifrar
    const decryptedBuffer = this.encryptionService.decrypt(
      encryptedBuffer,
      file.encryption_iv,
      file.encryption_auth_tag,
      file.encrypted_file_key,
    );

    return {
      buffer: decryptedBuffer,
      filename: file.original_filename,
      mimeType: file.mime_type,
    };
  }

  private canAccess(ownerId: number, userId: number, userRoles: number[]): boolean {
    // Dueño siempre tiene acceso
    if (ownerId === userId) return true;

    // SUPERADMIN ve todo
    if (userRoles.includes(UserRole.SUPERADMIN)) return true;

    // ADMIN ve archivos de USER, DOMICILIARIO, BUSINESS
    if (userRoles.includes(UserRole.ADMIN)) return true;

    // Cualquier otro caso: denegado
    return false;
  }
}
