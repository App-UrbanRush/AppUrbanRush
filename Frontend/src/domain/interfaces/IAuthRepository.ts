
import type { AuthResponse, LoginRequest, RegisterRequest, RegisterDeliveryRequest } from "../types/auth.types";


export interface IAuthRepository {
  login(credentials: LoginRequest): Promise<AuthResponse>;
  register(data: RegisterRequest): Promise<AuthResponse>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<void>;
  registerDelivery(data: RegisterDeliveryRequest): Promise<AuthResponse>;

}
