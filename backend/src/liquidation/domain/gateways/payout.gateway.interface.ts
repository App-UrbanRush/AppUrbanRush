import { BankAccountModel } from '../entities/bank-account.model';

export interface PayoutResult {
  success: boolean;
  provider_transaction_id?: string;
  failure_reason?: string;
  raw?: any;
}

export interface IPayoutGateway {
  executePayout(params: {
    amount: number;
    currency: string;
    reference: string;
    bankAccount: BankAccountModel;
  }): Promise<PayoutResult>;

  getTransactionStatus(providerTransactionId: string): Promise<{
    status: 'PENDING' | 'SUCCESS' | 'FAILED';
    raw?: any;
  }>;
}
