/**
 * DOMAIN LAYER - Tipos puros de negocio
 * No dependen de ninguna tecnología específica
 */

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export const ROLE_MAP: Record<number, string> = {
  1: "Administrador",
  2: "Usuario",
  3: "Domiciliario",
  4: "Negocio",
  5: "SuperAdmin",
};

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  user_email: string;
  user_password: string;
  firstName: string;
  firstLastName: string;
  cellphone: string;
  address: string;
  gender: string;
  rolIds?: number[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface RegisterDeliveryRequest {
  user_email: string;
  user_password: string;
  firstName: string;
  firstLastName: string;
  cellphone: string;
  address: string;
  gender: string;
  document_number: string;
  vehicle_type: string;
  vehicle_plate: string;
  soat_number: string;
  expedition_date?: string;
  expedition_place?: string;
}

export interface ForgotPasswordRequest {
  user_email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordRequest {
  user_email: string;
  code: string;
  new_password: string;
}

export interface ResetPasswordResponse {
  message: string;
}
