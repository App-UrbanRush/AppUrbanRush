// src/admin/application/use-cases/change-user-role.use-case.ts
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IUserRepository } from 'src/user/domain/repositories/user.repository.interface';

@Injectable()
export class ChangeUserRoleUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(userId: number, newRoleId: number) {
    const user = await this.userRepository.findOneById(userId);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    // updateUserRole ya existe en IUserRepository y maneja el update directamente
    await this.userRepository.updateUserRole(userId, newRoleId);

    return { message: `Rol actualizado correctamente para el usuario ${userId}` };
  }
}