
import type { AuthResponse, LoginRequest, RegisterRequest, RegisterDeliveryRequest } from "../types/auth.types";
import type { RegisterVendorRequest, VendorRegisterResponse } from "../types/vendor.types";

export interface IAuthRepository {
  login(credentials: LoginRequest): Promise<AuthResponse>;
  register(data: RegisterRequest): Promise<AuthResponse>;
  registerDelivery(data: RegisterDeliveryRequest): Promise<AuthResponse>;
  registerVendor(data: RegisterVendorRequest): Promise<VendorRegisterResponse>;
  logout(): Promise<void>;
}
