import { RolEntity } from '../../infrastructure/persistence/entity/rol.entity';

export interface IRolesRepository {
  findAll(): Promise<RolEntity[]>;
  findById(id: number): Promise<RolEntity | null>;
  findByName(name: string): Promise<RolEntity | null>;
  save(role: Partial<RolEntity>): Promise<RolEntity>;
}