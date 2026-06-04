import { EncryptedFileModel, FileType } from '../../../domain/entities/encrypted-file.model';
import { EncryptedFileEntity } from '../entities/encrypted-file.entity';

export class EncryptedFileMapper {
  static toDomain(entity: EncryptedFileEntity): EncryptedFileModel {
    return new EncryptedFileModel(
      entity.id,
      entity.original_filename,
      entity.mime_type,
      entity.cloudinary_public_id,
      entity.cloudinary_url,
      entity.encryption_iv,
      entity.encryption_auth_tag,
      entity.encrypted_file_key,
      entity.file_type as FileType,
      entity.owner_id,
      entity.created_at,
    );
  }

  static toEntity(model: EncryptedFileModel): Partial<EncryptedFileEntity> {
    return {
      original_filename: model.original_filename,
      mime_type: model.mime_type,
      cloudinary_public_id: model.cloudinary_public_id,
      cloudinary_url: model.cloudinary_url,
      encryption_iv: model.encryption_iv,
      encryption_auth_tag: model.encryption_auth_tag,
      encrypted_file_key: model.encrypted_file_key,
      file_type: model.file_type,
      owner_id: model.owner_id,
    };
  }
}
