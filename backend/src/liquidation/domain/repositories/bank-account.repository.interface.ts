import { BankAccountModel } from '../entities/bank-account.model';

export interface IBankAccountRepository {
  create(account: BankAccountModel): Promise<BankAccountModel>;
  update(id: number, partial: Partial<BankAccountModel>): Promise<BankAccountModel | null>;
  findById(id: number): Promise<BankAccountModel | null>;
  findByUserId(userId: number): Promise<BankAccountModel[]>;
  findDefaultByUserId(userId: number): Promise<BankAccountModel | null>;
  unsetDefaultsForUser(userId: number): Promise<void>;
  delete(id: number): Promise<boolean>;
}
