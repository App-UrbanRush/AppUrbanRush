import type { VendorProfile } from "../../domain/interfaces/IAuthRepository";
import { vendorProfileApi } from "../../infrastructure/api/vendorProfileApi";

export const getVendorProfile = async (): Promise<VendorProfile> => {
  return vendorProfileApi.getProfile();
};