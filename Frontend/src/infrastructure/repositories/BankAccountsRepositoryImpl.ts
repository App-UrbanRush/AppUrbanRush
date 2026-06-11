import type { IBankAccountsRepository } from "../../domain/interfaces/IBankAccountsRepository";
import type { BankAccount, CreateBankAccountInput } from "../../domain/types/earnings.types";
import { bankAccountsApi } from "../api/bankAccountsApi";

export class BankAccountsRepositoryImpl implements IBankAccountsRepository {
  async list(): Promise<BankAccount[]> {
    return bankAccountsApi.list();
  }

  async create(input: CreateBankAccountInput): Promise<BankAccount> {
    return bankAccountsApi.create(input);
  }

  async remove(id: number): Promise<{ deleted: boolean }> {
    return bankAccountsApi.remove(id);
  }
}
