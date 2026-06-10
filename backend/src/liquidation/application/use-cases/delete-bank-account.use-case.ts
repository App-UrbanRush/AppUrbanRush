import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { IBankAccountRepository } from '../../domain/repositories/bank-account.repository.interface';

@Injectable()
export class DeleteBankAccountUseCase {
  constructor(
    @Inject('IBankAccountRepository')
    private readonly repo: IBankAccountRepository,
  ) {}

  async execute(userId: number, accountId: number) {
    const account = await this.repo.findById(accountId);
    if (!account) throw new NotFoundException('Cuenta bancaria no encontrada');
    if (account.user_id !== userId) throw new ForbiddenException('No autorizado');

    await this.repo.delete(accountId);
    return { deleted: true };
  }
}
