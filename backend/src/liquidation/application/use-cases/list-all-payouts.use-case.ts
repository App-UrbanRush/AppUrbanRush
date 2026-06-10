import { Injectable, Inject } from '@nestjs/common';
import { IPayoutTransactionRepository } from '../../domain/repositories/payout-transaction.repository.interface';
import { PayoutStatus } from '../../domain/entities/payout-transaction.model';

@Injectable()
export class ListAllPayoutsUseCase {
  constructor(
    @Inject('IPayoutTransactionRepository')
    private readonly payoutRepo: IPayoutTransactionRepository,
  ) {}

  execute(status?: PayoutStatus) {
    return this.payoutRepo.findAll(status ? { status } : undefined);
  }
}
