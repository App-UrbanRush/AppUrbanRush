import type { IAuthRepository, UserProfile } from "../../domain/interfaces/IAuthRepository";

export class GetMyProfileUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(): Promise<UserProfile> {
    return this.authRepository.getMyProfile();
  }
}
