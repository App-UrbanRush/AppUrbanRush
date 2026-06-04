// src/admin/application/use-cases/delete-user.use-case.ts
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IUserRepository } from 'src/user/domain/repositories/user.repository.interface';

@Injectable()
export class DeleteUserUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(userId: number) {
    const user = await this.userRepository.findOneById(userId);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    await this.userRepository.remove(userId); 
    return { message: `Usuario ${userId} eliminado correctamente` };
  }
}