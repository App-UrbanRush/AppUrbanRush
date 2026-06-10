import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BankAccountEntity } from '../entities/bank-account.entity';
import { IBankAccountRepository } from '../../../domain/repositories/bank-account.repository.interface';
import { BankAccountModel } from '../../../domain/entities/bank-account.model';
import { BankAccountMapper } from '../mappers/bank-account.mapper';

@Injectable()
export class TypeormBankAccountRepository implements IBankAccountRepository {
  constructor(
    @InjectRepository(BankAccountEntity)
    private readonly repo: Repository<BankAccountEntity>,
  ) {}

  async create(account: BankAccountModel): Promise<BankAccountModel> {
    const entity = this.repo.create(BankAccountMapper.toEntity(account));
    const saved = await this.repo.save(entity);
    return BankAccountMapper.toDomain(saved);
  }

  async update(id: number, partial: Partial<BankAccountModel>): Promise<BankAccountModel | null> {
    await this.repo.update(id, BankAccountMapper.toEntity(partial) as any);
    return this.findById(id);
  }

  async findById(id: number): Promise<BankAccountModel | null> {
    const entity = await this.repo.findOne({ where: { bank_account_id: id } });
    return entity ? BankAccountMapper.toDomain(entity) : null;
  }

  async findByUserId(userId: number): Promise<BankAccountModel[]> {
    const entities = await this.repo.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
    return entities.map(BankAccountMapper.toDomain);
  }

  async findDefaultByUserId(userId: number): Promise<BankAccountModel | null> {
    const entity = await this.repo.findOne({ where: { user_id: userId, is_default: true } });
    return entity ? BankAccountMapper.toDomain(entity) : null;
  }

  async unsetDefaultsForUser(userId: number): Promise<void> {
    await this.repo.update({ user_id: userId, is_default: true }, { is_default: false });
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repo.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
