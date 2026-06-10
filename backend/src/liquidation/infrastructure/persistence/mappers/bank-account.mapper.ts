import { BankAccountModel, BankAccountType, DocumentType } from '../../../domain/entities/bank-account.model';
import { BankAccountEntity } from '../entities/bank-account.entity';

export class BankAccountMapper {
  static toDomain(entity: BankAccountEntity): BankAccountModel {
    return new BankAccountModel(
      entity.bank_account_id,
      entity.user_id,
      entity.holder_name,
      entity.holder_document_type as DocumentType,
      entity.holder_document_number,
      entity.bank_code,
      entity.bank_name,
      entity.account_type as BankAccountType,
      entity.account_number,
      entity.is_default,
      entity.created_at ?? null,
    );
  }

  static toEntity(domain: Partial<BankAccountModel>): Partial<BankAccountEntity> {
    return {
      bank_account_id: domain.bank_account_id ?? undefined,
      user_id: domain.user_id,
      holder_name: domain.holder_name,
      holder_document_type: domain.holder_document_type,
      holder_document_number: domain.holder_document_number,
      bank_code: domain.bank_code,
      bank_name: domain.bank_name,
      account_type: domain.account_type,
      account_number: domain.account_number,
      is_default: domain.is_default,
    };
  }
}
