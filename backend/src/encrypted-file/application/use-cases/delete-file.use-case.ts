import { Injectable, Inject, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { IEncryptedFileRepository } from '../../domain/repositories/encrypted-file.repository.interface';
import { CloudinaryService } from '../../infrastructure/services/cloudinary.service';
import { UserRole } from 'src/auth/infrastructure/decorators/roles.decorator';
import { NotificationBridge } from 'src/notifications/infrastructure/services/notification-bridge';

@Injectable()
export class DeleteFileUseCase {
  private readonly logger = new Logger(DeleteFileUseCase.name);

  constructor(
    @Inject('IEncryptedFileRepository')
    private readonly fileRepository: IEncryptedFileRepository,
    private readonly cloudinaryService: CloudinaryService,
    private readonly notificationBridge: NotificationBridge,
  ) {}

  async execute(fileId: number, userId: number, userRoles: number[]): Promise<{ message: string }> {
    const file = await this.fileRepository.findById(fileId);
    if (!file) throw new NotFoundException('Archivo no encontrado');

    const isOwner = file.owner_id === userId;
    const isAdmin = userRoles.includes(UserRole.ADMIN) || userRoles.includes(UserRole.SUPERADMIN);

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('No tienes permisos para eliminar este archivo');
    }

    // Borramos de BD primero — es la fuente de verdad.
    await this.fileRepository.delete(fileId);

    // Cloudinary + notificación en paralelo. Si uno falla no rompe la operación.
    await Promise.allSettled([
      this.cloudinaryService.delete(file.cloudinary_public_id).catch((err) => {
        this.logger.warn(
          `Cloudinary delete falló para ${file.cloudinary_public_id}: ${(err as Error).message}`,
        );
      }),
      this.notificationBridge.notify('fileDeleted', [file.owner_id], 'SOCKET', {
        body: `Se eliminó el archivo "${file.original_filename}".`,
      }).catch((err) => {
        this.logger.warn(`Notificación fileDeleted falló: ${(err as Error).message}`);
      }),
    ]);

    return { message: 'Archivo eliminado correctamente' };
  }
}
