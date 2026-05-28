
import type { AuthResponse, LoginRequest, RegisterRequest, RegisterDeliveryRequest } from "../types/auth.types";
import type { RegisterVendorRequest, VendorRegisterResponse } from "../types/vendor.types";

export interface UserProfile {
  id: number;
  firstName: string;
  firstLastName: string;
  address: string;
  email?: string;
}

export interface IAuthRepository {
  login(credentials: LoginRequest): Promise<AuthResponse>;
  register(data: RegisterRequest): Promise<AuthResponse>;
  registerDelivery(data: RegisterDeliveryRequest): Promise<AuthResponse>;
  registerVendor(data: RegisterVendorRequest): Promise<VendorRegisterResponse>;
  getMyProfile(): Promise<UserProfile>;
  logout(): Promise<void>;
}
