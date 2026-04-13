import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { RolEntity } from 'src/roles/infrastructure/persistence/entity/rol.entity';
import { UserRolesEntity } from 'src/user_rol/infrastructure/persistence/entity/user_rol.entity';
import { UserEntity } from '../entities/user.entity';


@Injectable()
export class TypeOrmUserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserEntity) private readonly repo: Repository<UserEntity>,
    @InjectRepository(UserRolesEntity) private readonly urRepo: Repository<UserRolesEntity>,
    @InjectRepository(RolEntity) private readonly rolRepo: Repository<RolEntity>,
  ) {}

  async save(user: Partial<UserEntity>) { return this.repo.save(user); }
  async findOneByEmail(user_email: string) { return this.repo.findOne({ where: { user_email } }); }
  async findAll() { return this.repo.find({ relations: ['userroles', 'userroles.rol'] }); }
  async findOneById(user_id: number) { 
    return this.repo.findOne({ where: { user_id }, relations: ['userroles', 'userroles.rol'] }); 
  }
  async remove(user: UserEntity) { await this.repo.remove(user); }
  async findRolById(rol_id: number) { return this.rolRepo.findOne({ where: { rol_id } }); }
  async findUserRole(user: UserEntity) { return this.urRepo.findOne({ where: { user }, relations: ['rol'] }); }
  async saveUserRole(ur: any) { await this.urRepo.save(ur); }
}