import type { IAuthRepository } from "../../domain/interfaces/IAuthRepository";
import type { AuthResponse, LoginRequest } from "../../domain/types/auth.types";

export class LoginUseCase {
  private authRepository: IAuthRepository;

  constructor(authRepository: IAuthRepository) {
    this.authRepository = authRepository;
  }

  async execute(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await this.authRepository.login(credentials);
    return response;
  }
}