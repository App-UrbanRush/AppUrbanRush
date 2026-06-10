import axios from "axios";
import { authLocalStorage } from "../persistence/authLocalStorage";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export interface VendorListItem {
  vendor_id: number;
  business_name: string;
  business_type: string;
  address: string;
  phone: string;
  description: string | null;
  status: string;
  logo_url: string | null;
  storefront_image_url: string | null;
  business_hours: string | null;
  user_id: number;
}

export interface VendorPhotoItem {
  photo_id: string;
  image_url: string;
  order: number;
  type: string;
}

export const vendorsApi = {
  getAll: async (): Promise<VendorListItem[]> => {
    const token = authLocalStorage.getToken();
    const response = await axios.get(`${API_URL}/vendor/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  getPhotos: async (vendorId: number): Promise<VendorPhotoItem[]> => {
    const token = authLocalStorage.getToken();
    const response = await axios.get(`${API_URL}/vendor/${vendorId}/photos`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};
