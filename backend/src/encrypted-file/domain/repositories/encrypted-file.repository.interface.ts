import { EncryptedFileModel } from '../entities/encrypted-file.model';

export interface IEncryptedFileRepository {
  create(file: EncryptedFileModel): Promise<EncryptedFileModel>;
  findById(id: number): Promise<EncryptedFileModel | null>;
  findByOwnerId(ownerId: number): Promise<EncryptedFileModel[]>;
  delete(id: number): Promise<void>;
}
