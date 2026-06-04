import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { IUserRepository } from 'src/user/domain/repositories/user.repository.interface';
import { IAuditLogRepository } from '../../domain/repositories/audit-log.repository.interface';
import { AuditLogModel } from '../../domain/entities/audit-log.model';
import { UserRole } from 'src/auth/infrastructure/decorators/roles.decorator';

@Injectable()
export class DeleteUserAdminUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IAuditLogRepository')
    private readonly auditRepo: IAuditLogRepository,
  ) {}

  async execute(
    userId: number,
    performedBy: number,
    performedByEmail: string,
    performerRoles: number[],
  ) {
    const user = await this.userRepository.findOneById(userId);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const userRoles = user.roles ?? [];
    const isSuperAdmin = performerRoles.includes(UserRole.SUPERADMIN);
    const isAdmin = performerRoles.includes(UserRole.ADMIN);

    // SUPERADMIN puede eliminar a cualquiera excepto a sí mismo
    if (isSuperAdmin) {
      if (userId === performedBy) throw new ForbiddenException('No puedes eliminarte a ti mismo');
    }
    // ADMIN solo puede eliminar usuarios comunes (no ADMIN ni SUPERADMIN)
    else if (isAdmin) {
      if (userRoles.includes(UserRole.ADMIN) || userRoles.includes(UserRole.SUPERADMIN)) {
        throw new ForbiddenException('No puedes eliminar a otro administrador');
      }
    }

    await this.userRepository.remove(userId);

    // Auditoría
    await this.auditRepo.create(new AuditLogModel(
      null, 'DELETE_USER', 'user', userId, performedBy, performedByEmail,
      { deleted_email: user.user_email, deleted_roles: userRoles }, null,
    ));

    return { message: `Usuario ${userId} eliminado correctamente` };
  }
}
