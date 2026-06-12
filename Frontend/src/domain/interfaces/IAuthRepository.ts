
import type { AuthResponse, LoginRequest, RegisterRequest, RegisterDeliveryRequest, ForgotPasswordRequest, ForgotPasswordResponse, ResetPasswordRequest, ResetPasswordResponse } from "../types/auth.types";
import type { RegisterVendorRequest, VendorRegisterResponse } from "../types/vendor.types";

export interface UserProfile {
  id: number;
  firstName: string;
  firstLastName: string;
  address: string;
  email?: string;
  cellphone?: string;
  gender?: string;
  avatarUrl?: string | null;
}

export interface UpdateProfileData {
  firstName?: string;
  firstLastName?: string;
  cellphone?: string;
  address?: string;
  gender?: string;
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

export interface CourierProfile {
  couriers_id: number;
  vehicle_type: string;
  vehicle_plate: string | null;
  soat_number: string | null;
  status: string;
  user_id: number;
}

export interface IAuthRepository {
  login(credentials: LoginRequest): Promise<AuthResponse>;
  register(data: RegisterRequest): Promise<AuthResponse>;
  registerDelivery(data: RegisterDeliveryRequest): Promise<AuthResponse>;
  registerVendor(data: RegisterVendorRequest): Promise<VendorRegisterResponse>;
  loginWithToken(token: string): Promise<AuthResponse>;
  getMyProfile(): Promise<UserProfile>;
  updateMyProfile(userId: number, data: UpdateProfileData): Promise<void>;
  uploadAvatar(file: File): Promise<{ avatar_url: string }>;
  logout(): Promise<void>;
  forgotPassword(data: ForgotPasswordRequest): Promise<ForgotPasswordResponse>;
  resetPassword(data: ResetPasswordRequest): Promise<ResetPasswordResponse>;
}
