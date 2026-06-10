/**
 * UI LAYER - CONTEXT
 * Define la forma del contexto de autenticación
 */

import { createContext } from "react";
import type { AuthState, AuthResponse, RegisterDeliveryRequest, RegisterRequest, ForgotPasswordResponse, ResetPasswordResponse } from "../../domain/types/auth.types";
import type { RegisterVendorRequest, VendorRegisterResponse } from "../../domain/types/vendor.types";
import type { VerifyDocumentRequest, VerificationResult } from "../../domain/types/verification.types";
import type { UserProfile, VendorProfile, CourierProfile } from "../../domain/interfaces/IAuthRepository";

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (data: RegisterRequest) => Promise<void>;
  registerDelivery: (data: RegisterDeliveryRequest) => Promise<void>;
  registerVendor: (data: RegisterVendorRequest) => Promise<VendorRegisterResponse>;
  forgotPassword: (email: string) => Promise<ForgotPasswordResponse>;
  resetPassword: (data: { user_email: string; code: string; new_password: string }) => Promise<ResetPasswordResponse>;
  verifyDocument: (images: File[], data: VerifyDocumentRequest) => Promise<VerificationResult>;

  logout: () => Promise<void>;

  isLoading: boolean;
  error: string | null;
  myProfile: UserProfile | null;
  fetchMyProfile: () => Promise<void>;
  vendorProfile: VendorProfile | null;
  fetchVendorProfile: () => Promise<void>;
  courierProfile: CourierProfile | null;
  fetchCourierProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
