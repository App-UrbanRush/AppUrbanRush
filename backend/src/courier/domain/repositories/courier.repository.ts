import { Courier } from '../entities/courier.model';

export interface ICourierRepository {
  save(courier: Partial<Courier>): Promise<Courier>;
  findByUserId(userId: number): Promise<Courier | null>;
  updateStatus(id: number, status: string): Promise<void>;
  updateProfile(userId: number, data: Partial<Pick<Courier, 'vehicle_type' | 'vehicle_plate' | 'soat_number' | 'photo_url' | 'status'>>): Promise<Courier>;
}