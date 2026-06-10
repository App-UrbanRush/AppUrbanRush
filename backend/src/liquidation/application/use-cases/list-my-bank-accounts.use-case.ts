import { Injectable, Inject } from '@nestjs/common';
import { IBankAccountRepository } from '../../domain/repositories/bank-account.repository.interface';

@Injectable()
export class ListMyBankAccountsUseCase {
  constructor(
    @Inject('IBankAccountRepository')
    private readonly repo: IBankAccountRepository,
  ) {}

  async execute(userId: number) {
    const accounts = await this.repo.findByUserId(userId);
    return accounts.map((a) => ({
      ...a,
      account_number: this.maskAccount(a.account_number),
    }));
  }

  private maskAccount(accountNumber: string): string {
    if (accountNumber.length <= 4) return '****';
    return `****${accountNumber.slice(-4)}`;
  }
}
