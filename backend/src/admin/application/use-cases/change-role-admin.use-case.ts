import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { IUserRepository } from 'src/user/domain/repositories/user.repository.interface';
import { IAuditLogRepository } from '../../domain/repositories/audit-log.repository.interface';
import { AuditLogModel } from '../../domain/entities/audit-log.model';

@Injectable()
export class ChangeRoleAdminUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IAuditLogRepository')
    private readonly auditRepo: IAuditLogRepository,
  ) {}

  async execute(
    userId: number,
    newRoleId: number,
    performedBy: number,
    performedByEmail: string,
  ) {
    const user = await this.userRepository.findOneById(userId);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    if (userId === performedBy) {
      throw new ForbiddenException('No puedes cambiar tu propio rol');
    }

    const oldRoles = user.roles ?? [];
    await this.userRepository.updateUserRole(userId, newRoleId);

    // Auditoría
    await this.auditRepo.create(new AuditLogModel(
      null, 'CHANGE_ROLE', 'user', userId, performedBy, performedByEmail,
      { old_roles: oldRoles, new_role_id: newRoleId, email: user.user_email }, null,
    ));

    return { message: `Rol actualizado correctamente para el usuario ${userId}` };
  }
}
