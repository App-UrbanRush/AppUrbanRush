import { UserEntity } from '../../infrastructure/persistence/entities/user.entity';

export interface IUserRepository {
  save(user: Partial<UserEntity>): Promise<UserEntity>;
  findOneByEmail(email: string): Promise<UserEntity | null>;
  findOneById(id: number): Promise<UserEntity | null>;
  findAll(): Promise<UserEntity[]>;
  remove(user: UserEntity): Promise<void>;
  // Auxiliares para Roles
  findRolById(id: number): Promise<any>;
  findUserRole(user: UserEntity): Promise<any>;
  saveUserRole(userRole: any): Promise<void>;
}