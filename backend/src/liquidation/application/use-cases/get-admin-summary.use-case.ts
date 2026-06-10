import { Injectable, Inject } from '@nestjs/common';
import { IVendorLiquidationRepository } from '../../domain/repositories/vendor-liquidation.repository.interface';
import { ICourierEarningRepository } from '../../domain/repositories/courier-earning.repository.interface';

@Injectable()
export class GetAdminSummaryUseCase {
  constructor(
    @Inject('IVendorLiquidationRepository')
    private readonly liqRepo: IVendorLiquidationRepository,
    @Inject('ICourierEarningRepository')
    private readonly earningRepo: ICourierEarningRepository,
  ) {}

  async execute() {
    const pendingVendors = await this.liqRepo.findAllPending();
    const pendingCouriers = await this.earningRepo.findAllPending();

    const vendor_pending_total = pendingVendors.reduce((s, l) => s + l.vendor_net, 0);
    const vendor_pending_commission = pendingVendors.reduce(
      (s, l) => s + l.platform_commission,
      0,
    );
    const courier_pending_total = pendingCouriers.reduce((s, e) => s + e.delivery_fee, 0);

    return {
      vendors: {
        pending_count: pendingVendors.length,
        pending_total: vendor_pending_total,
        pending_commission: vendor_pending_commission,
      },
      couriers: {
        pending_count: pendingCouriers.length,
        pending_total: courier_pending_total,
      },
      platform_total_pending: vendor_pending_total + courier_pending_total,
    };
  }
}
