export type PayoutBeneficiaryType = 'COURIER' | 'VENDOR';
export type PayoutStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

export class PayoutTransactionModel {
  constructor(
    public readonly payout_id: string | null,
    public readonly user_id: number,
    public readonly beneficiary_type: PayoutBeneficiaryType,
    public readonly bank_account_id: number,
    public readonly bank_account_snapshot: {
      bank_name: string;
      account_type: string;
      account_number_masked: string;
      holder_name: string;
    },
    public readonly amount: number,
    public readonly currency: string,
    public readonly status: PayoutStatus,
    public readonly wompi_transaction_id: string | null,
    public readonly reference: string,
    public readonly failure_reason: string | null,
    public readonly earning_ids: string[],
    public readonly created_at: Date | null,
    public readonly completed_at: Date | null,
  ) {}
}
