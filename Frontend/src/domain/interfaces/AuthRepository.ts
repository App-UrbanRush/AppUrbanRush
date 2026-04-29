import type { LoginCredentials, RegisterCredentials, AuthResponse } from "../types/auth.types";

export interface IAuthRepository {
  login(credentials: LoginCredentials): Promise<AuthResponse>;
  register(credentials: RegisterCredentials): Promise<AuthResponse>;
  getToken(): string | null;
  saveToken(token: string): void;
  removeToken(): void;
}
