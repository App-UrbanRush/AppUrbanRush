import type { IAuthRepository } from "../../domain/interfaces/IAuthRepository";

export class UploadAvatarUseCase {
  constructor(private readonly repo: IAuthRepository) {}

  async execute(file: File): Promise<{ avatar_url: string }> {
    return this.repo.uploadAvatar(file);
  }
}
