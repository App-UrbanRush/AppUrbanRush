import type { IBankAccountsRepository } from "../../domain/interfaces/IBankAccountsRepository";

export class DeleteBankAccountUseCase {
  constructor(private readonly repo: IBankAccountsRepository) {}

  async execute(id: number): Promise<{ deleted: boolean }> {
    return this.repo.remove(id);
  }
}
