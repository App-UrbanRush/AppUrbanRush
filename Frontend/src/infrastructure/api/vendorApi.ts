import axios from "axios";
import type { RegisterVendorRequest, VendorRegisterResponse } from "../../domain/types/vendor.types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const vendorApi = {
  register: async (data: RegisterVendorRequest): Promise<VendorRegisterResponse> => {
    const response = await axios.post<VendorRegisterResponse>(`${API_URL}/auth/register-vendor`, data);
    return response.data;
  },
};
