import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { IUserRolesRepository } from '../../domain/repositories/user-roles.repository.interface';

@Injectable()
export class UserRolService {
  constructor(
    @Inject('IUserRolesRepository')
    private readonly _userRolesRepository: IUserRolesRepository,
  ) {}

  async assign(userId: number, rolId: number) {
    const exists = await this._userRolesRepository.findOne(userId, rolId);
    if (exists) throw new BadRequestException('El usuario ya tiene este rol');

    return await this._userRolesRepository.assignRole({
      user: { user_id: userId } as any,
      rol: { rol_id: rolId } as any
    });
  }

  async getRolesByUser(userId: number) {
    return await this._userRolesRepository.findByUser(userId);
  }
}