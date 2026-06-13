import { Injectable } from '@nestjs/common';
import { StatsService } from '../../infrastructure/services/stats.service';
import { GetAdminSummaryUseCase } from 'src/liquidation/application/use-cases/get-admin-summary.use-case';
import { SystemStats } from '../../domain/interfaces/admin.interfaces';

@Injectable()
export class GetSystemStatsUseCase {
  constructor(
    private readonly statsService: StatsService,
    private readonly adminSummary: GetAdminSummaryUseCase,
  ) {}

  async execute(): Promise<SystemStats> {
    const [stats, liquidation] = await Promise.all([
      this.statsService.getSystemStats(),
      this.adminSummary.execute(),
    ]);

    return {
      ...stats,
      liquidations: {
        vendor_pending_count: liquidation.vendors.pending_count,
        vendor_pending_total: liquidation.vendors.pending_total,
        vendor_pending_commission: liquidation.vendors.pending_commission,
        courier_pending_count: liquidation.couriers.pending_count,
        courier_pending_total: liquidation.couriers.pending_total,
        platform_total_pending: liquidation.platform_total_pending,
      },
    };
  }
}
