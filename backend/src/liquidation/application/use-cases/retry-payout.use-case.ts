import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { IPayoutTransactionRepository } from '../../domain/repositories/payout-transaction.repository.interface';
import { IBankAccountRepository } from '../../domain/repositories/bank-account.repository.interface';
import { ICourierEarningRepository } from '../../domain/repositories/courier-earning.repository.interface';
import { IVendorLiquidationRepository } from '../../domain/repositories/vendor-liquidation.repository.interface';
import { IPayoutGateway } from '../../domain/gateways/payout.gateway.interface';
import { LiquidationNotificationService } from '../../infrastructure/services/liquidation-notification.service';

@Injectable()
export class RetryPayoutUseCase {
  constructor(
    @Inject('IPayoutTransactionRepository')
    private readonly payoutRepo: IPayoutTransactionRepository,
    @Inject('IBankAccountRepository')
    private readonly bankRepo: IBankAccountRepository,
    @Inject('ICourierEarningRepository')
    private readonly earningRepo: ICourierEarningRepository,
    @Inject('IVendorLiquidationRepository')
    private readonly liqRepo: IVendorLiquidationRepository,
    @Inject('IPayoutGateway')
    private readonly payoutGateway: IPayoutGateway,
    private readonly notifier: LiquidationNotificationService,
  ) {}

  async execute(payoutId: string) {
    const payout = await this.payoutRepo.findById(payoutId);
    if (!payout) throw new NotFoundException('Payout no encontrado');
    if (payout.status !== 'FAILED') {
      throw new BadRequestException(`Solo se pueden reintentar payouts FAILED (estado actual: ${payout.status})`);
    }

    const account = await this.bankRepo.findDefaultByUserId(payout.user_id);
    if (!account) {
      throw new BadRequestException('El usuario no tiene cuenta bancaria por defecto');
    }

    const reference = `urbanrush-retry-${payout.beneficiary_type.toLowerCase()}-${payout.user_id}-${randomUUID()}`;

    const result = await this.payoutGateway.executePayout({
      amount: payout.amount,
      currency: payout.currency,
      reference,
      bankAccount: account,
    });

    if (result.success) {
      if (payout.beneficiary_type === 'COURIER') {
        await this.earningRepo.markAsPaid(payout.earning_ids);
      } else {
        await this.liqRepo.markAsPaid(payout.earning_ids);
      }
      const updated = await this.payoutRepo.updateStatus(payoutId, 'SUCCESS', {
        wompi_transaction_id: result.provider_transaction_id,
        completed_at: new Date(),
        failure_reason: undefined,
      });
      await this.notifier.notifyPayoutSuccess({
        user_id: payout.user_id,
        amount: payout.amount,
        reference,
        bank_name: payout.bank_account_snapshot.bank_name,
        account_masked: payout.bank_account_snapshot.account_number_masked,
        concept: 'Reintento de transferencia',
      });
      return updated;
    }

    const updated = await this.payoutRepo.updateStatus(payoutId, 'FAILED', {
      wompi_transaction_id: result.provider_transaction_id,
      failure_reason: result.failure_reason ?? 'Error desconocido',
    });
    await this.notifier.notifyPayoutFailed({
      user_id: payout.user_id,
      amount: payout.amount,
      reference,
      bank_name: payout.bank_account_snapshot.bank_name,
      account_masked: payout.bank_account_snapshot.account_number_masked,
      reason: result.failure_reason ?? 'Error desconocido',
    });
    return updated;
  }
}
