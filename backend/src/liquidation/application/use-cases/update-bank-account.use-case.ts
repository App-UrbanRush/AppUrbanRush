import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { IBankAccountRepository } from '../../domain/repositories/bank-account.repository.interface';
import { UpdateBankAccountDto } from '../dtos/update-bank-account.dto';

@Injectable()
export class UpdateBankAccountUseCase {
  constructor(
    @Inject('IBankAccountRepository')
    private readonly repo: IBankAccountRepository,
  ) {}

  async execute(userId: number, accountId: number, dto: UpdateBankAccountDto) {
    const account = await this.repo.findById(accountId);
    if (!account) throw new NotFoundException('Cuenta bancaria no encontrada');
    if (account.user_id !== userId) throw new ForbiddenException('No autorizado');

    if (dto.is_default === true) {
      await this.repo.unsetDefaultsForUser(userId);
    }

    return this.repo.update(accountId, dto as any);
  }
}
