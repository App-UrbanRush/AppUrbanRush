import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IUserRepository } from 'src/user/domain/repositories/user.repository.interface';
import { IAuditLogRepository } from '../../domain/repositories/audit-log.repository.interface';
import { AuditLogModel } from '../../domain/entities/audit-log.model';

@Injectable()
export class UpdateCommonUserUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IAuditLogRepository')
    private readonly auditRepo: IAuditLogRepository,
  ) {}

  async execute(
    userId: number,
    data: { user_email?: string; status?: boolean },
    performedBy: number,
    performedByEmail: string,
  ) {
    const user = await this.userRepository.findOneById(userId);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    await this.userRepository.updateAdminFields(userId, {
      user_email: data.user_email,
      status: data.status,
    });

    await this.auditRepo.create(new AuditLogModel(
      null, 'UPDATE_USER', 'user', userId, performedBy, performedByEmail,
      { previous_email: user.user_email, changes: data }, null,
    ));

    return { message: `Usuario ${userId} actualizado correctamente` };
  }
}
