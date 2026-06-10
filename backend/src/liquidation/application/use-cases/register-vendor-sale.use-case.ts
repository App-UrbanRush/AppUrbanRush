import { Injectable, Inject } from '@nestjs/common';
import { IVendorLiquidationRepository } from '../../domain/repositories/vendor-liquidation.repository.interface';
import { IOrderRepository } from 'src/order/domain/repositories/order.repository.interface';
import { VendorLiquidationModel } from '../../domain/entities/vendor-liquidation.model';

@Injectable()
export class RegisterVendorSaleUseCase {
  constructor(
    @Inject('IVendorLiquidationRepository')
    private readonly liqRepo: IVendorLiquidationRepository,
    @Inject('IOrderRepository')
    private readonly orderRepo: IOrderRepository,
  ) {}

  async execute(orderId: string): Promise<VendorLiquidationModel | null> {
    const order = await this.orderRepo.findById(orderId);
    if (!order) return null;

    const existing = await this.liqRepo.findByOrderId(orderId);
    if (existing) return existing;

    const vendorNet = order.subtotal - order.platform_commission;

    const liquidation = new VendorLiquidationModel(
      null,
      order.vendor_id,
      orderId,
      order.subtotal,
      order.platform_commission,
      vendorNet,
      'PENDING',
      null,
      null,
    );
    return this.liqRepo.create(liquidation);
  }
}
