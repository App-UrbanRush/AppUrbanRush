import type { IAuthRepository } from "../../domain/interfaces/AuthRepository";
import type { LoginDTO } from "../dtos/auth.dtos";
import type { AuthResponse } from "../../domain/types/auth.types";

export class LoginUseCase {
  authRepository: IAuthRepository;

  constructor(authRepository: IAuthRepository) {
    this.authRepository = authRepository;
  }

  async execute(credentials: LoginDTO): Promise<AuthResponse> {
    const response = await this.authRepository.login({
      user_email: credentials.email,
      user_password: credentials.password,
    });

    this.authRepository.saveToken(response.access_token);

    return response;
  }
}
