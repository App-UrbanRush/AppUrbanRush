import type { IBankAccountsRepository } from "../../domain/interfaces/IBankAccountsRepository";
import type { BankAccount } from "../../domain/types/earnings.types";

export class ListBankAccountsUseCase {
  constructor(private readonly repo: IBankAccountsRepository) {}

  async execute(): Promise<BankAccount[]> {
    return this.repo.list();
  }
}
