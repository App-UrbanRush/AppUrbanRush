import type { IAuthRepository } from "../../domain/interfaces/IAuthRepository";
import type { ForgotPasswordRequest, ForgotPasswordResponse } from "../../domain/types/auth.types";

export class ForgotPasswordUseCase {
  private authRepository: IAuthRepository;

  constructor(authRepository: IAuthRepository) {
    this.authRepository = authRepository;
  }

  async execute(data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    const response = await this.authRepository.forgotPassword(data);
    return response;
  }
}