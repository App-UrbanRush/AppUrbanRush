import type { IAuthRepository } from "../../domain/interfaces/AuthRepository";
import type { LoginCredentials, RegisterCredentials, AuthResponse } from "../../domain/types/auth.types";
import { authApi } from "../api/authApi";
import { authLocalStorage } from "../persistence/authLocalStorage";

export class AuthRepositoryImpl implements IAuthRepository {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return authApi.login(credentials);
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    return authApi.register(credentials);
  }

  getToken(): string | null {
    return authLocalStorage.getToken();
  }

  saveToken(token: string): void {
    authLocalStorage.saveToken(token);
  }

  removeToken(): void {
    authLocalStorage.removeToken();
  }
}
