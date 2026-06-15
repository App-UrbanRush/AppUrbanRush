import axios from "axios";
import { NEST_API } from "../config/env";
import { tokenStorage } from "../auth/tokenStorage";

export const nestApi = axios.create({ baseURL: NEST_API, timeout: 15000 });

nestApi.interceptors.request.use(async (config) => {
  const token = await tokenStorage.getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─────── Tipos ───────
export interface VendorListItem {
  vendor_id: number;
  business_name: string;
  business_type?: string;
  description?: string;
  logo_url?: string | null;
  storefront_image_url?: string | null;
  rating?: number;
  delivery_time?: string;
  latitude?: number | null;
  longitude?: number | null;
  business_address?: string;
}

export interface ProductListItem {
  product_id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string | null;
  category?: string;
  is_available: boolean;
  vendor_id: number;
  stock?: number;
}

export interface OrderItem {
  _id: string;
  user_id: number;
  vendor_id: number;
  courier_id?: number | null;
  status: string;
  total: number;
  created_at: string;
  delivery_code?: string;
  delivery_address?: string;
  delivery_lat?: number;
  delivery_lng?: number;
  items?: { product_id: string; name: string; quantity: number; price: number; image_url?: string }[];
}

export interface Category {
  category_id: number;
  name: string;
  description?: string;
  icon?: string;
}

// ─────── Endpoints ───────
export const nestEndpoints = {
  // Vendors
  listVendors: async (): Promise<VendorListItem[]> => (await nestApi.get("/vendors")).data,
  vendorById: async (id: number): Promise<VendorListItem> => (await nestApi.get(`/vendors/${id}`)).data,

  // Products
  listProductsByVendor: async (vendorId: number): Promise<ProductListItem[]> =>
    (await nestApi.get(`/products/vendor/${vendorId}`)).data,
  createProduct: async (data: Partial<ProductListItem>): Promise<ProductListItem> =>
    (await nestApi.post("/products", data)).data,
  updateProduct: async (id: string, data: Partial<ProductListItem>): Promise<ProductListItem> =>
    (await nestApi.put(`/products/${id}`, data)).data,
  deleteProduct: async (id: string): Promise<void> => { await nestApi.delete(`/products/${id}`); },

  // Categories
  listCategories: async (): Promise<Category[]> => (await nestApi.get("/categories")).data,

  // Orders
  createOrder: async (data: any): Promise<OrderItem> => (await nestApi.post("/orders", data)).data,
  myOrders: async (userId: number): Promise<OrderItem[]> => (await nestApi.get(`/orders/user/${userId}`)).data,
  orderById: async (id: string): Promise<OrderItem> => (await nestApi.get(`/orders/${id}`)).data,
  vendorOrders: async (vendorId: number): Promise<OrderItem[]> => (await nestApi.get(`/orders/vendor/${vendorId}`)).data,
  availableOrders: async (): Promise<OrderItem[]> => (await nestApi.get("/orders/available")).data,
  courierOrders: async (courierId: number): Promise<OrderItem[]> => (await nestApi.get(`/orders/courier/${courierId}`)).data,
  acceptOrder: async (orderId: string, courierId: number): Promise<OrderItem> =>
    (await nestApi.put(`/orders/${orderId}/accept`, { courier_id: courierId })).data,
  updateOrderStatus: async (orderId: string, status: string): Promise<OrderItem> =>
    (await nestApi.put(`/orders/${orderId}/status`, { status })).data,
  confirmDelivery: async (orderId: string, code: string, courierId: number): Promise<OrderItem> =>
    (await nestApi.put(`/orders/${orderId}/deliver`, { delivery_code: code, courier_id: courierId })).data,

  // People (profile)
  updateMyProfile: async (userId: number, data: any): Promise<void> =>
    { await nestApi.put(`/people/${userId}`, data); },
  uploadAvatar: async (uri: string, mime: string): Promise<{ avatar_url: string }> => {
    const form = new FormData();
    form.append("file", { uri, name: "avatar.jpg", type: mime } as any);
    const res = await nestApi.post("/people/avatar", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  // Courier earnings / liquidations
  myEarnings: async (courierId: number): Promise<any> =>
    (await nestApi.get(`/earnings/courier/${courierId}`)).data,

  // Search (índice AVL)
  search: async (q: string, limit = 20): Promise<any[]> =>
    (await nestApi.get("/search", { params: { q, limit } })).data,
};
