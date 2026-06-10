import { VendorLiquidationModel } from '../entities/vendor-liquidation.model';

export interface IVendorLiquidationRepository {
  create(liquidation: VendorLiquidationModel): Promise<VendorLiquidationModel>;
  findByVendorId(vendorId: number): Promise<VendorLiquidationModel[]>;
  findByOrderId(orderId: string): Promise<VendorLiquidationModel | null>;
  findAllPending(): Promise<VendorLiquidationModel[]>;
  markAsPaid(ids: string[]): Promise<number>;
}
