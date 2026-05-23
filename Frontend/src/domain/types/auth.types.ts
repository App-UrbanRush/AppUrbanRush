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
