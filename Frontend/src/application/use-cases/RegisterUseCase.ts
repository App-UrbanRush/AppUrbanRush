import type { IAuthRepository } from "../../domain/interfaces/IAuthRepository";
import type { AuthResponse, RegisterRequest } from "../../domain/types/auth.types";

export class RegisterUseCase {
  private authRepository: IAuthRepository;

  constructor(authRepository: IAuthRepository) {
    this.authRepository = authRepository;
  }

  async execute(data: RegisterRequest): Promise<AuthResponse> {
    const response = await this.authRepository.register(data);
    return response;
  }
}