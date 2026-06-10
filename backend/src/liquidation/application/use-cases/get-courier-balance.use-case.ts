import { Injectable, Inject } from '@nestjs/common';
import { ICourierEarningRepository } from '../../domain/repositories/courier-earning.repository.interface';

@Injectable()
export class GetCourierBalanceUseCase {
  constructor(
    @Inject('ICourierEarningRepository')
    private readonly earningRepo: ICourierEarningRepository,
  ) {}

  async execute(courierId: number) {
    const earnings = await this.earningRepo.findByCourierId(courierId);
    const total_pending = earnings
      .filter((e) => e.status === 'PENDING')
      .reduce((sum, e) => sum + e.delivery_fee, 0);
    const total_paid = earnings
      .filter((e) => e.status === 'PAID')
      .reduce((sum, e) => sum + e.delivery_fee, 0);

    return {
      courier_id: courierId,
      total_pending,
      total_paid,
      total_earnings: earnings.length,
      earnings,
    };
  }
}
