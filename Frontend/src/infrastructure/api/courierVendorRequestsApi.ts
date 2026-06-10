import axios from "axios";
import { authLocalStorage } from "../persistence/authLocalStorage";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export interface CourierVendorRequest {
  id?: number;
  courier_user_id: number;
  vendor_id: number;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
  updated_at: string;
  courier_name?: string;
}

export interface CourierDetails {
  firstName: string;
  firstLastName: string;
  cellphone: string;
  address: string;
  gender: string;
  document_number: string;
  vehicle_type: string;
  vehicle_plate: string;
  soat_number: string;
  courier_status: string;
  email: string;
}

export const courierVendorRequestsApi = {
  sendRequest: async (vendorId: number): Promise<CourierVendorRequest> => {
    const token = authLocalStorage.getToken();
    const response = await axios.post(
      `${API_URL}/courier-vendor-requests`,
      { vendor_id: vendorId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  },

  getMyRequests: async (): Promise<CourierVendorRequest[]> => {
    const token = authLocalStorage.getToken();
    const response = await axios.get(`${API_URL}/courier-vendor-requests/my`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  getVendorRequests: async (): Promise<CourierVendorRequest[]> => {
    const token = authLocalStorage.getToken();
    const response = await axios.get(`${API_URL}/courier-vendor-requests/vendor`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  acceptRequest: async (requestId: number): Promise<{ message: string }> => {
    const token = authLocalStorage.getToken();
    const response = await axios.put(
      `${API_URL}/courier-vendor-requests/${requestId}/status`,
      { status: "accepted" },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  rejectRequest: async (requestId: number): Promise<{ message: string }> => {
    const token = authLocalStorage.getToken();
    const response = await axios.put(
      `${API_URL}/courier-vendor-requests/${requestId}/status`,
      { status: "rejected" },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  getCourierDetails: async (userId: number): Promise<CourierDetails> => {
    const token = authLocalStorage.getToken();
    const response = await axios.get(`${API_URL}/courier-vendor-requests/details/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};
