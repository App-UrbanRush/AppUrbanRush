import { CourierVendorRequest } from '../entities/courier-vendor-request.model';

export interface ICourierVendorRequestRepository {
  create(courierUserId: number, vendorId: number): Promise<CourierVendorRequest>;
  findById(id: number): Promise<CourierVendorRequest | null>;
  findByCourierAndVendor(courierUserId: number, vendorId: number): Promise<CourierVendorRequest | null>;
  findByCourierUserId(courierUserId: number): Promise<CourierVendorRequest[]>;
  findByVendorId(vendorId: number): Promise<CourierVendorRequest[]>;
  updateStatus(id: number, status: string): Promise<void>;
}
