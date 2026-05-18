export interface RegisterVendorRequest {
  user_email: string;
  user_password: string;
  firstName: string;
  firstLastName: string;
  document_number: string;
  cellphone: string;
  gender: string;
  business_name: string;
  business_type: string;
  business_address: string;
  business_phone: string;
  description?: string;
  nit?: string;
  document_url?: string;
}

export interface VendorRegisterResponse {
  message: string;
  user_id: number;
}