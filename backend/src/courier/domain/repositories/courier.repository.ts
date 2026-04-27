import { Courier } from '../entities/courier.model';

export interface ICourierRepository {
  save(courier: Partial<Courier>): Promise<Courier>;
  findByUserId(userId: number): Promise<Courier | null>;
  updateStatus(id: number, status: string): Promise<void>;
}