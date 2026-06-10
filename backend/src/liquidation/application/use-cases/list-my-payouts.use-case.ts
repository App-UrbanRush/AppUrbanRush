import { Injectable, Inject } from '@nestjs/common';
import { IPayoutTransactionRepository } from '../../domain/repositories/payout-transaction.repository.interface';

@Injectable()
export class ListMyPayoutsUseCase {
  constructor(
    @Inject('IPayoutTransactionRepository')
    private readonly payoutRepo: IPayoutTransactionRepository,
  ) {}

  execute(userId: number) {
    return this.payoutRepo.findByUserId(userId);
  }
}
