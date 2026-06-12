import axios from "axios";
import type { RegisterDeliveryRequest, RegisterRequest } from "../../domain/types/auth.types";
import type { RegisterVendorRequest, VendorRegisterResponse } from "../../domain/types/vendor.types";
import { authLocalStorage } from "../persistence/authLocalStorage";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const authApi = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar token en cada request
authApi.interceptors.request.use((config) => {
  const token = authLocalStorage.getToken();

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
      authLocalStorage.clear();
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
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

export const registerVendorApi = async (data: RegisterVendorRequest): Promise<VendorRegisterResponse> => {
  const response = await authApi.post<VendorRegisterResponse>("/auth/register-vendor", data);
  return response.data;
};

export interface MyProfileApiResponse {
  id: number;
  firstName: string;
  firstLastName: string;
  cellphone: string;
  address: string;
  gender: string;
  userId: number;
  avatarUrl?: string | null;
}

export const getMyProfileApi = async (): Promise<MyProfileApiResponse> => {
  const response = await authApi.get("/people/my-profile");
  return response.data;
};

export const updateMyProfileApi = async (
  id: number,
  data: {
    firstName: string;
    firstLastName: string;
    cellphone: string;
    address: string;
    gender: string;
  }
) => {
  const response = await authApi.put(`/people/${id}`, data);
  return response.data;
};

export const forgotPasswordApi = async (email: string) => {
  const response = await authApi.post("/auth/forgot-password", { 
    user_email: email 
  });
  return response.data;
};

export const resetPasswordApi = async (data: {
  user_email: string;
  code: string;
  new_password: string;
}) => {
  const response = await authApi.post("/auth/reset-password", data);
  return response.data;
};