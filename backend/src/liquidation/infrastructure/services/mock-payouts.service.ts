import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { IPayoutGateway, PayoutResult } from '../../domain/gateways/payout.gateway.interface';
import { BankAccountModel } from '../../domain/entities/bank-account.model';

@Injectable()
export class MockPayoutsService implements IPayoutGateway {
  private readonly logger = new Logger(MockPayoutsService.name);

  async executePayout(params: {
    amount: number;
    currency: string;
    reference: string;
    bankAccount: BankAccountModel;
  }): Promise<PayoutResult> {
    // Pequeña latencia para que parezca una llamada real
    await new Promise((r) => setTimeout(r, 400));

    const fakeTxId = `mock-${randomUUID()}`;
    this.logger.log(
      `[MOCK] Payout exitoso: $${params.amount} ${params.currency} → ${params.bankAccount.bank_name} (${params.reference})`,
    );

    return {
      success: true,
      provider_transaction_id: fakeTxId,
      raw: {
        id: fakeTxId,
        status: 'APPROVED',
        amount_in_cents: Math.round(params.amount * 100),
        reference: params.reference,
        mock: true,
      },
    };
  }

  async getTransactionStatus(providerTransactionId: string) {
    return {
      status: 'SUCCESS' as const,
      raw: { id: providerTransactionId, status: 'APPROVED', mock: true },
    };
  }
}
