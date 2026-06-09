
import type { AuthResponse, LoginRequest, RegisterRequest, RegisterDeliveryRequest, ForgotPasswordRequest, ForgotPasswordResponse, ResetPasswordRequest, ResetPasswordResponse } from "../types/auth.types";
import type { RegisterVendorRequest, VendorRegisterResponse } from "../types/vendor.types";

export interface UserProfile {
  id: number;
  firstName: string;
  firstLastName: string;
  address: string;
  email?: string;
}

export interface VendorProfile {
  vendor_id: number;
  business_name: string;
  business_type: string;
  address: string;
  phone: string;
  description: string | null;
  status: string;
  user_id: number;
  logo_url: string | null;
  storefront_image_url: string | null;
  business_hours: string | null;
}

export interface IAuthRepository {
  login(credentials: LoginRequest): Promise<AuthResponse>;
  register(data: RegisterRequest): Promise<AuthResponse>;
  registerDelivery(data: RegisterDeliveryRequest): Promise<AuthResponse>;
  registerVendor(data: RegisterVendorRequest): Promise<VendorRegisterResponse>;
  getMyProfile(): Promise<UserProfile>;
  logout(): Promise<void>;
  forgotPassword(data: ForgotPasswordRequest): Promise<ForgotPasswordResponse>;
  resetPassword(data: ResetPasswordRequest): Promise<ResetPasswordResponse>;
}
