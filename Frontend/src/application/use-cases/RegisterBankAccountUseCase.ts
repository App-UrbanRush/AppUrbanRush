import type { IBankAccountsRepository } from "../../domain/interfaces/IBankAccountsRepository";
import type { BankAccount, CreateBankAccountInput } from "../../domain/types/earnings.types";

export class RegisterBankAccountUseCase {
  constructor(private readonly repo: IBankAccountsRepository) {}

  async execute(input: CreateBankAccountInput): Promise<BankAccount> {
    return this.repo.create(input);
  }
}
