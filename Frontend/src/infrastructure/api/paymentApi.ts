import axios from "axios";
import { authLocalStorage } from "../persistence/authLocalStorage";
import type { PaymentResponse, CreatePaymentRequest } from "../../domain/types/payment.types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const authHeader = () => ({
  headers: { Authorization: `Bearer ${authLocalStorage.getToken()}` },
});

export const paymentApi = {
  create: async (data: CreatePaymentRequest): Promise<PaymentResponse> => {
    const response = await axios.post(`${API_URL}/payments/create`, data, authHeader());
    return response.data;
  },

  getByOrder: async (orderId: string): Promise<PaymentResponse> => {
    const response = await axios.get(`${API_URL}/payments/order/${orderId}`, authHeader());
    return response.data;
  },

  getByUser: async (userId: number): Promise<PaymentResponse[]> => {
    const response = await axios.get(`${API_URL}/payments/user/${userId}`, authHeader());
    return response.data;
  },

  confirm: async (reference: string): Promise<{ status: string }> => {
    const response = await axios.post(`${API_URL}/payments/confirm/${reference}`, {}, authHeader());
    return response.data;
  },

  getCheckoutConfig: async (reference: string, amount: number): Promise<{ publicKey: string; signature: string }> => {
    const response = await axios.get(`${API_URL}/payments/checkout-config/${reference}/${amount}`, authHeader());
    return response.data;
  },
};
