export type BankAccountType = 'SAVINGS' | 'CHECKING';
export type DocumentType = 'CC' | 'CE' | 'NIT' | 'PP';

export class BankAccountModel {
  constructor(
    public readonly bank_account_id: number | null,
    public readonly user_id: number,
    public readonly holder_name: string,
    public readonly holder_document_type: DocumentType,
    public readonly holder_document_number: string,
    public readonly bank_code: string,
    public readonly bank_name: string,
    public readonly account_type: BankAccountType,
    public readonly account_number: string,
    public readonly is_default: boolean,
    public readonly created_at: Date | null,
  ) {}
}
