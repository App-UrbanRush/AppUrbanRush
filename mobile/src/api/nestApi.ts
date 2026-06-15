import axios from "axios";
import { NEST_API } from "../config/env";
import { tokenStorage } from "../auth/tokenStorage";

export const nestApi = axios.create({ baseURL: NEST_API, timeout: 30000 });

nestApi.interceptors.request.use(async (config) => {
  const token = await tokenStorage.getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Si el backend responde 401, limpiamos el token para que la app vuelva al login.
nestApi.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error?.response?.status === 401) {
      try { await tokenStorage.clear(); } catch {}
    }
    return Promise.reject(error);
  },
);

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

// ─────── Endpoints (mapeo exacto a los controllers de NestJS) ───────
export const nestEndpoints = {
  // ── People ──
  myProfile: async (): Promise<any> => (await nestApi.get("/people/my-profile")).data,
  updateProfile: async (userId: number, data: any): Promise<void> => {
    await nestApi.put(`/people/${userId}`, data);
  },

  // ── Vendors ──
  listVendors: async (): Promise<VendorListItem[]> => (await nestApi.get("/vendor/all")).data,
  vendorProfile: async (): Promise<VendorListItem> => (await nestApi.get("/vendor/profile")).data,
  updateVendorProfile: async (data: any): Promise<void> => { await nestApi.put("/vendor/profile", data); },
  vendorPendingOrders: async (): Promise<OrderItem[]> => (await nestApi.get("/vendor/orders/pending")).data,
  vendorStats: async (): Promise<any> => (await nestApi.get("/vendor/dashboard/stats")).data,

  // ── Products ──
  listProductsByVendor: async (vendorId: number): Promise<ProductListItem[]> =>
    (await nestApi.get(`/products/vendor/${vendorId}`)).data,
  createProduct: async (data: Partial<ProductListItem>): Promise<ProductListItem> =>
    (await nestApi.post("/products", data)).data,
  updateProduct: async (id: string, data: Partial<ProductListItem>): Promise<ProductListItem> =>
    (await nestApi.put(`/products/${id}`, data)).data,
  deleteProduct: async (id: string): Promise<void> => { await nestApi.delete(`/products/${id}`); },

  // ── Categories ──
  listCategories: async (): Promise<Category[]> => (await nestApi.get("/categories")).data,

  // ── Orders ──
  createOrder: async (data: any): Promise<OrderItem> => (await nestApi.post("/orders", data)).data,
  myOrders: async (userId: number): Promise<OrderItem[]> => (await nestApi.get(`/orders/user/${userId}`)).data,
  orderById: async (id: string): Promise<OrderItem> => (await nestApi.get(`/orders/${id}`)).data,
  vendorOrders: async (vendorId: number): Promise<OrderItem[]> => (await nestApi.get(`/orders/vendor/${vendorId}`)).data,
  availableOrders: async (): Promise<OrderItem[]> => (await nestApi.get("/orders/available")).data,
  courierOrders: async (courierId: number): Promise<OrderItem[]> => (await nestApi.get(`/orders/courier/${courierId}`)).data,
  acceptOrder: async (orderId: string, courierId: number): Promise<OrderItem> =>
    (await nestApi.put(`/orders/${orderId}/accept`, { courier_id: courierId })).data,
  updateOrderStatusVendor: async (orderId: string, status: string): Promise<OrderItem> =>
    (await nestApi.put(`/orders/${orderId}/status/vendor`, { status })).data,
  updateOrderStatusCourier: async (orderId: string, status: string, courierId: number): Promise<OrderItem> =>
    (await nestApi.put(`/orders/${orderId}/status/courier`, { status, courier_id: courierId })).data,
  confirmDelivery: async (orderId: string, code: string, courierId: number): Promise<OrderItem> =>
    (await nestApi.put(`/orders/${orderId}/deliver`, { delivery_code: code, courier_id: courierId })).data,
  cancelOrder: async (orderId: string): Promise<OrderItem> =>
    (await nestApi.put(`/orders/${orderId}/cancel`, {})).data,

  // ── Courier ──
  courierProfile: async (userId: number): Promise<any> => (await nestApi.get(`/courier/${userId}/profile`)).data,

  // ── Liquidations (ganancias) ──
  courierBalance: async (courierId: number): Promise<any> =>
    (await nestApi.get(`/liquidation/courier/${courierId}/balance`)).data,
  courierEarnings: async (courierId: number): Promise<any> =>
    (await nestApi.get(`/liquidation/courier/${courierId}/earnings`)).data,
  vendorBalance: async (vendorId: number): Promise<any> =>
    (await nestApi.get(`/liquidation/vendor/${vendorId}/balance`)).data,

  // ── Search (índice AVL) ──
  search: async (q: string, limit = 20): Promise<any[]> =>
    (await nestApi.get("/search", { params: { q, limit } })).data,

  // ── Avatar ──
  uploadAvatar: async (uri: string, mime: string): Promise<{ avatar_url: string }> => {
    const form = new FormData();
    form.append("file", { uri, name: "avatar.jpg", type: mime } as any);
    const res = await nestApi.post("/people/avatar", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  // Aliases backward-compat (para no romper screens que ya importaban estos nombres)
  myEarnings: async (courierId: number): Promise<any> =>
    (await nestApi.get(`/liquidation/courier/${courierId}/earnings`)).data,
  updateMyProfile: async (userId: number, data: any): Promise<void> => {
    await nestApi.put(`/people/${userId}`, data);
  },
  updateOrderStatus: async (orderId: string, status: string): Promise<OrderItem> =>
    (await nestApi.put(`/orders/${orderId}/status/vendor`, { status })).data,
  vendorById: async (id: number): Promise<VendorListItem> => {
    // El backend no expone /vendor/:id, solo /vendor/profile (del logueado).
    // Como fallback: traer toda la lista y filtrar.
    const all = await nestApi.get<VendorListItem[]>("/vendor/all");
    const found = all.data.find((v) => v.vendor_id === id);
    if (!found) throw new Error("Vendor no encontrado");
    return found;
  },
};
