import { Injectable, Inject } from '@nestjs/common';
import { IVendorLiquidationRepository } from '../../domain/repositories/vendor-liquidation.repository.interface';

@Injectable()
export class GetVendorBalanceUseCase {
  constructor(
    @Inject('IVendorLiquidationRepository')
    private readonly liqRepo: IVendorLiquidationRepository,
  ) {}

  async execute(vendorId: number) {
    const liquidations = await this.liqRepo.findByVendorId(vendorId);
    const total_pending = liquidations
      .filter((l) => l.status === 'PENDING')
      .reduce((sum, l) => sum + l.vendor_net, 0);
    const total_paid = liquidations
      .filter((l) => l.status === 'PAID')
      .reduce((sum, l) => sum + l.vendor_net, 0);
    const total_commission_paid = liquidations.reduce(
      (sum, l) => sum + l.platform_commission,
      0,
    );

    return {
      vendor_id: vendorId,
      total_pending,
      total_paid,
      total_commission_paid,
      total_sales: liquidations.length,
      liquidations,
    };
  }
}
