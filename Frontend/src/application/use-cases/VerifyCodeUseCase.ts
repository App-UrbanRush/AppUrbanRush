import type { IAuthRepository } from "../../domain/interfaces/IAuthRepository";

export class VerifyCodeUseCase {
  private authRepository: IAuthRepository;

  constructor(authRepository: IAuthRepository) {
    this.authRepository = authRepository;
  }

  async execute(email: string, code: string): Promise<{ valid: boolean }> {
    const response = await this.authRepository.verifyCode(email, code);
    return response;
  }
}
