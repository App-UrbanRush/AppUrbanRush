import axios from "axios";
import type { LoginCredentials, RegisterCredentials, AuthResponse } from "../../domain/types/auth.types";

const API = "http://localhost:3000";

export const api = axios.create({
  baseURL: API,
});

// Interceptor para agregar token a las solicitudes
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const authApi = {
  login: async (data: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post("/auth/login", data);
    return response.data;
  },

  register: async (data: RegisterCredentials): Promise<AuthResponse> => {
    const response = await api.post("/auth/register", data);
    return response.data;
  },
};
