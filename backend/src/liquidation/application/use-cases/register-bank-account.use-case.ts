import { Injectable, Inject } from '@nestjs/common';
import { IBankAccountRepository } from '../../domain/repositories/bank-account.repository.interface';
import { BankAccountModel } from '../../domain/entities/bank-account.model';
import { CreateBankAccountDto } from '../dtos/create-bank-account.dto';

@Injectable()
export class RegisterBankAccountUseCase {
  constructor(
    @Inject('IBankAccountRepository')
    private readonly repo: IBankAccountRepository,
  ) {}

  async execute(userId: number, dto: CreateBankAccountDto): Promise<BankAccountModel> {
    const existing = await this.repo.findByUserId(userId);
    const isDefault = dto.is_default ?? existing.length === 0;

    if (isDefault) {
      await this.repo.unsetDefaultsForUser(userId);
    }

    const account = new BankAccountModel(
      null,
      userId,
      dto.holder_name,
      dto.holder_document_type,
      dto.holder_document_number,
      dto.bank_code,
      dto.bank_name,
      dto.account_type,
      dto.account_number,
      isDefault,
      null,
    );

    return this.repo.create(account);
  }
}
