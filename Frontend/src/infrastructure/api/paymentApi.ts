import { authApi } from "./authApi";
import type { PaymentResponse, CreatePaymentRequest } from "../../domain/types/payment.types";

export const paymentApi = {
  create: async (data: CreatePaymentRequest): Promise<PaymentResponse> => {
    const response = await authApi.post(`/payments/create`, data);
    return response.data;
  },

  getByOrder: async (orderId: string): Promise<PaymentResponse> => {
    const response = await authApi.get(`/payments/order/${orderId}`);
    return response.data;
  },

  getByUser: async (userId: number): Promise<PaymentResponse[]> => {
    const response = await authApi.get(`/payments/user/${userId}`);
    return response.data;
  },

  confirm: async (reference: string): Promise<{ status: string }> => {
    const response = await authApi.post(`/payments/confirm/${reference}`);
    return response.data;
  },

  getCheckoutConfig: async (reference: string, amount: number): Promise<{ publicKey: string; signature: string }> => {
    const response = await authApi.get(`/payments/checkout-config/${reference}/${amount}`);
    return response.data;
  },

  retry: async (orderId: string): Promise<{ success: boolean; status: string }> => {
    const response = await authApi.post(`/payments/retry/${orderId}`);
    return response.data;
  },
};
