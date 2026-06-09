import type { VendorProfile } from "../../domain/interfaces/IAuthRepository";
import { vendorProfileApi, type UpdateVendorProfileData } from "../../infrastructure/api/vendorProfileApi";

export const getVendorProfile = async (): Promise<VendorProfile> => {
  return vendorProfileApi.getProfile();
};

export const updateVendorProfile = async (data: UpdateVendorProfileData): Promise<VendorProfile> => {
  return vendorProfileApi.updateProfile(data);
};