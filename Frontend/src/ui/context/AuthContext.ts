/**
 * UI LAYER - CONTEXT
 * Define la forma del contexto de autenticación
 */

import { createContext } from "react";
import type { AuthState, RegisterDeliveryRequest, RegisterRequest } from "../../domain/types/auth.types";
import type { RegisterVendorRequest, VendorRegisterResponse } from "../../domain/types/vendor.types";
import type { VerifyDocumentRequest, VerificationResult } from "../../domain/types/verification.types";

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  registerDelivery: (data: RegisterDeliveryRequest) => Promise<void>;
  registerVendor: (data: RegisterVendorRequest) => Promise<VendorRegisterResponse>;
  verifyDocument: (images: File[], data: VerifyDocumentRequest) => Promise<VerificationResult>;

  logout: () => Promise<void>;

  isLoading: boolean;
  error: string | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
