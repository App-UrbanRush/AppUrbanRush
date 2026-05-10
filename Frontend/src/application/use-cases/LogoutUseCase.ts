import type { IAuthRepository } from "../../domain/interfaces/IAuthRepository";

export class LogoutUseCase {
  private authRepository: IAuthRepository;

  constructor(authRepository: IAuthRepository) {
    this.authRepository = authRepository;
  }

  async execute(): Promise<void> {
    await this.authRepository.logout();
  }
}