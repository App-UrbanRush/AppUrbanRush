import type { IAuthRepository } from "../../domain/interfaces/IAuthRepository";
import type { AuthResponse } from "../../domain/types/auth.types";

/**
 * Procesa el token recibido tras el login con Google: lo decodifica,
 * lo persiste y devuelve la sesión lista para usar.
 */
export class LoginWithTokenUseCase {
  constructor(private readonly repo: IAuthRepository) {}

  async execute(token: string): Promise<AuthResponse> {
    return this.repo.loginWithToken(token);
  }
}
