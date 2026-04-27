import { User } from '../entities/user.model';

export interface IUserRepository {
  save(user: User): Promise<User>;
  findOneByEmail(email: string): Promise<User | null>;
  findOneById(id: number): Promise<User | null>;
  findAll(): Promise<User[]>;
  remove(id: number): Promise<void>;
  
  // Auxiliares para Roles (Hablando en lenguaje de Dominio)
  updateUserRole(userId: number, rolId: number): Promise<void>;
  findRolById(id: number): Promise<any>;
  findUserRole(user: User): Promise<any>;
  saveUserRole(userRole: any): Promise<void>;

  savePeople(peopleData: any): Promise<any>;

  create(user: User, personData: any): Promise<User>;
}