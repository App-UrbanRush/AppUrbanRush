import { UserRolesEntity } from '../../infrastructure/persistence/entity/user_rol.entity';

export interface IUserRolesRepository {
  assignRole(userRoles: Partial<UserRolesEntity>): Promise<UserRolesEntity>;
  findByUser(userId: number): Promise<UserRolesEntity[]>;
  deleteByUserId(userId: number): Promise<void>;
  findOne(userId: number, rolId: number): Promise<UserRolesEntity | null>;
}