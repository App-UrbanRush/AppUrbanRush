import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { IEncryptedFileRepository } from '../../domain/repositories/encrypted-file.repository.interface';
import { CloudinaryService } from '../../infrastructure/services/cloudinary.service';
import { UserRole } from 'src/auth/infrastructure/decorators/roles.decorator';

@Injectable()
export class DeleteFileUseCase {
  constructor(
    @Inject('IEncryptedFileRepository')
    private readonly fileRepository: IEncryptedFileRepository,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async execute(fileId: number, userId: number, userRoles: number[]): Promise<{ message: string }> {
    const file = await this.fileRepository.findById(fileId);
    if (!file) throw new NotFoundException('Archivo no encontrado');

    // Solo el dueño, ADMIN o SUPERADMIN pueden eliminar
    const isOwner = file.owner_id === userId;
    const isAdmin = userRoles.includes(UserRole.ADMIN) || userRoles.includes(UserRole.SUPERADMIN);

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('No tienes permisos para eliminar este archivo');
    }

    // Eliminar de Cloudinary
    await this.cloudinaryService.delete(file.cloudinary_public_id);

    // Eliminar de PostgreSQL
    await this.fileRepository.delete(fileId);

    return { message: 'Archivo eliminado correctamente' };
  }
}
