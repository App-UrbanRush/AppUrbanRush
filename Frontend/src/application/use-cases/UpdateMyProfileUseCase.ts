import type { IAuthRepository, UpdateProfileData } from "../../domain/interfaces/IAuthRepository";

export class UpdateMyProfileUseCase {
  constructor(private readonly repo: IAuthRepository) {}

  async execute(userId: number, data: UpdateProfileData): Promise<void> {
    return this.repo.updateMyProfile(userId, data);
  }
}
