export interface LoginCredentials {
  user_email: string;
  user_password: string;
}

export interface RegisterCredentials {
  user_email: string;
  user_password: string;
  firstName: string;
  firstLastName: string;
  cellphone: string;
  address: string;
  gender: string;
  rolIds?: number[];
  document_number?: string;
}

export interface AuthResponse {
  access_token: string;
  token?: string;
}

export interface User {
  id?: number;
  email: string;
  firstName: string;
  lastNames: string;
}
