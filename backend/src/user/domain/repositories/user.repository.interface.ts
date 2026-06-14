import { User } from '../entities/user.model';

export interface IUserRepository {
  save(user: User): Promise<User>;
  findOneByEmail(email: string): Promise<User | null>;
  findOneByDocumentNumber(documentNumber: string): Promise<User | null>;
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

  createFromGoogle(data: { user_email: string; google_id: string }): Promise<User>;


  updateAdminFields(userId: number, data: { user_email?: string; status?: boolean }): Promise<void>;

  saveResetCode(user_id: number, code: string, expiresAt: Date): Promise<void>;
  validateResetCode(user_email: string, code: string): Promise<boolean>;
  updatePassword(user_id: number, passwordHashed: string): Promise<void>;
  clearResetCode(user_id: number): Promise<void>;

  // Agrega esto dentro de la interfaz IUserRepository:
  getPersonFirstNameByUserId(userId: number): Promise<string | null>;
}