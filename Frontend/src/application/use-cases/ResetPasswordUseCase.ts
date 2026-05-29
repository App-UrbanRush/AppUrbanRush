import type { IAuthRepository } from "../../domain/interfaces/IAuthRepository";
import type { ResetPasswordRequest, ResetPasswordResponse } from "../../domain/types/auth.types";

export class ResetPasswordUseCase {
  private authRepository: IAuthRepository;

  constructor(authRepository: IAuthRepository) {
    this.authRepository = authRepository;
  }

  async execute(data: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    const response = await this.authRepository.resetPassword(data);
    return response;
  }
}