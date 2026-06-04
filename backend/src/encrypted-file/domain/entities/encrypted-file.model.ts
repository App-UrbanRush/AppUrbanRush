export enum FileType {
  IDENTITY_DOC = 'IDENTITY_DOC',
  CONTRACT = 'CONTRACT',
  VERIFICATION_IMAGE = 'VERIFICATION_IMAGE',
}

export class EncryptedFileModel {
  constructor(
    public id: number | null,
    public original_filename: string,
    public mime_type: string,
    public cloudinary_public_id: string,
    public cloudinary_url: string,
    public encryption_iv: string,
    public encryption_auth_tag: string,
    public encrypted_file_key: string,
    public file_type: FileType,
    public owner_id: number,
    public created_at: Date | null,
  ) {}
}
