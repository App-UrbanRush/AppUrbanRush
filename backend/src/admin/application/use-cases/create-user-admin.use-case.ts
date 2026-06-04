import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { IUserRepository } from 'src/user/domain/repositories/user.repository.interface';
import { IAuditLogRepository } from '../../domain/repositories/audit-log.repository.interface';
import { AuditLogModel } from '../../domain/entities/audit-log.model';
import { User } from 'src/user/domain/entities/user.model';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CreateUserAdminUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IAuditLogRepository')
    private readonly auditRepo: IAuditLogRepository,
  ) {}

  async execute(
    dto: {
      user_email: string;
      user_password: string;
      firstName: string;
      firstLastName: string;
      cellphone: string;
      address: string;
      gender: string;
      rol_id: number;
    },
    performedBy: number,
    performedByEmail: string,
  ) {
    const existing = await this.userRepository.findOneByEmail(dto.user_email);
    if (existing) throw new ConflictException('El email ya está registrado');

    const hashedPassword = await bcrypt.hash(dto.user_password, 10);
    const user = new User(null, dto.user_email, hashedPassword);

    const created = await this.userRepository.create(user, {
      firstName: dto.firstName,
      firstLastName: dto.firstLastName,
      cellphone: dto.cellphone,
      address: dto.address,
      gender: dto.gender,
    });

    // Asignar rol
    await this.userRepository.updateUserRole(created.user_id!, dto.rol_id);

    // Auditoría
    await this.auditRepo.create(new AuditLogModel(
      null, 'CREATE_USER', 'user', created.user_id!, performedBy, performedByEmail,
      { email: dto.user_email, rol_id: dto.rol_id }, null,
    ));

    return { message: 'Usuario creado correctamente', user_id: created.user_id };
  }
}
