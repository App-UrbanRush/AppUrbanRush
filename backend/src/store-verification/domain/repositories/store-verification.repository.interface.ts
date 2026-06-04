import { StoreVerificationModel } from '../entities/store-verification.model';

export interface IStoreVerificationRepository {
  save(verification: StoreVerificationModel): Promise<StoreVerificationModel>;
  findByVendorId(vendorId: number): Promise<StoreVerificationModel[]>;
  findLatestByVendorId(vendorId: number): Promise<StoreVerificationModel | null>;
}
