import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IAdminUserRepository } from '../../domain/repositories/admin-user.repository.interface';

@Injectable()
export class GetUserDetailUseCase {
  constructor(
    @Inject('IAdminUserRepository')
    private readonly adminUserRepo: IAdminUserRepository,
  ) {}

  async execute(userId: number) {
    const user = await this.adminUserRepo.findById(userId);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }
}
