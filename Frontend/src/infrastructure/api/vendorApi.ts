import axios from "axios";
import type { RegisterVendorRequest, VendorRegisterResponse } from "../../domain/types/vendor.types";

const API_URL = "http://localhost:3000/auth/register-vendor";

export const vendorApi = {
  register: async (data: RegisterVendorRequest): Promise<VendorRegisterResponse> => {
    const response = await axios.post<VendorRegisterResponse>(API_URL, data);
    return response.data;
  },
};
