import type { IAuthRepository } from "../../domain/interfaces/AuthRepository";
import type { RegisterDTO } from "../dtos/auth.dtos";
import type { AuthResponse } from "../../domain/types/auth.types";

export class RegisterUseCase {
  authRepository: IAuthRepository;

  constructor(authRepository: IAuthRepository) {
    this.authRepository = authRepository;
  }

  async execute(credentials: RegisterDTO): Promise<AuthResponse> {
    const response = await this.authRepository.register({
      ...credentials,
      rolIds: [2],
    });
    this.authRepository.saveToken(response.access_token || response.token || "");

    return response;
  }
}
