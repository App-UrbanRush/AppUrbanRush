import { Vendor } from '../entities/vendor.model';

export interface IVendorRepository {
  save(vendor: Partial<Vendor>): Promise<Vendor>;
  findByUserId(userId: number): Promise<Vendor | null>;
  findAll(): Promise<Vendor[]>;
  updateStatus(id: number, status: string): Promise<void>;
}