export interface CourierEarning {
  earning_id: string | null;
  courier_id: number;
  order_id: string;
  delivery_fee: number;
  status: "PENDING" | "PAID";
  created_at: string | null;
  paid_at: string | null;
}

export interface CourierBalance {
  courier_id: number;
  total_pending: number;
  total_paid: number;
  total_earnings: number;
  earnings: CourierEarning[];
}

export type BankAccountType = "SAVINGS" | "CHECKING";
export type DocumentType = "CC" | "CE" | "NIT" | "PP";

export interface BankAccount {
  bank_account_id: number;
  user_id: number;
  holder_name: string;
  holder_document_type: DocumentType;
  holder_document_number: string;
  bank_code: string;
  bank_name: string;
  account_type: BankAccountType;
  account_number: string; // enmascarado al listar
  is_default: boolean;
  created_at: string | null;
}

export interface CreateBankAccountInput {
  holder_name: string;
  holder_document_type: DocumentType;
  holder_document_number: string;
  bank_code: string;
  bank_name: string;
  account_type: BankAccountType;
  account_number: string;
  is_default?: boolean;
}
