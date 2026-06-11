import type { BankAccount, CreateBankAccountInput } from "../types/earnings.types";

export interface IBankAccountsRepository {
  list(): Promise<BankAccount[]>;
  create(input: CreateBankAccountInput): Promise<BankAccount>;
  remove(id: number): Promise<{ deleted: boolean }>;
}
