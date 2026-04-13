import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IRolesRepository } from '../../../domain/repositories/roles.repository.interface';
import { RolEntity } from '../entity/rol.entity';

@Injectable()
export class TypeOrmRolesRepository implements IRolesRepository {
  constructor(
    @InjectRepository(RolEntity)
    private readonly repository: Repository<RolEntity>,
  ) {}

  async findAll() { return await this.repository.find(); }
  async findById(rol_id: number) { return await this.repository.findOne({ where: { rol_id } }); }
  async findByName(rol_name: string) { return await this.repository.findOne({ where: { rol_name } }); }
  async save(role: Partial<RolEntity>) { return await this.repository.save(role); }
}