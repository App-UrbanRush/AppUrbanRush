import axios from "axios";
import type { RegisterDeliveryRequest, RegisterRequest } from "../../domain/types/auth.types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const authApi = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar token en cada request
authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Interceptor para manejar errores globales
authApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);

export const loginApi = async (email: string, password: string) => {
  const response = await authApi.post("/auth/login", { 
    user_email: email, 
    user_password: password 
  });
  return response.data;
};

export const registerApi = async (data: RegisterRequest) => {
  const response = await authApi.post("/auth/register", data);
  return response.data;
};

export const logoutApi = async () => {
  await authApi.post("/auth/logout");
};

export const registerDeliveryApi = async (data: RegisterDeliveryRequest) => {
  const response = await authApi.post("/auth/register-courier", data);
  return response.data;
};