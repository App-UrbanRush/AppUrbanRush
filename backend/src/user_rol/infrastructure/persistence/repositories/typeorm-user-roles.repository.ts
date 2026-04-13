import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUserRolesRepository } from '../../../domain/repositories/user-roles.repository.interface';
import { UserRolesEntity } from '../entity/user_rol.entity';

@Injectable()
export class TypeOrmUserRolesRepository implements IUserRolesRepository {
  constructor(
    @InjectRepository(UserRolesEntity)
    private readonly repository: Repository<UserRolesEntity>,
  ) {}

  async assignRole(userRoles: Partial<UserRolesEntity>) {
    return await this.repository.save(userRoles);
  }

  async findByUser(user_id: number) {
    return await this.repository.find({ 
      where: { user: { user_id } }, 
      relations: ['rol'] 
    });
  }

  async findOne(user_id: number, rol_id: number) {
    return await this.repository.findOne({
      where: { user: { user_id }, rol: { rol_id } }
    });
  }

  async deleteByUserId(user_id: number) {
    await this.repository.delete({ user: { user_id } });
  }
}