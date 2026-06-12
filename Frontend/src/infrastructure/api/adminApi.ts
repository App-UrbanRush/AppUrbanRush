import axios from "axios";
import { authLocalStorage } from "../persistence/authLocalStorage";
import type {
  AdminUserView, SystemStats, AuditLog, LiquidationSummary,
  CreateUserPayload, UserFilters,
} from "../../domain/types/admin.types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const auth = () => ({ headers: { Authorization: `Bearer ${authLocalStorage.getToken()}` } });

export const adminApi = {
  getStats: async (): Promise<SystemStats> => {
    const res = await axios.get(`${API_URL}/admin/stats`, auth());
    return res.data;
  },

  // SUPERADMIN: todos los usuarios con filtros
  getUsers: async (filters: UserFilters = {}): Promise<AdminUserView[]> => {
    const params = new URLSearchParams();
    if (filters.role) params.append("role", String(filters.role));
    if (filters.search) params.append("search", filters.search);
    if (filters.verification_status) params.append("verification_status", filters.verification_status);
    const res = await axios.get(`${API_URL}/admin/users?${params.toString()}`, auth());
    return res.data;
  },

  // ADMIN: solo usuarios comunes
  getCommonUsers: async (): Promise<AdminUserView[]> => {
    const res = await axios.get(`${API_URL}/admin/users/common`, auth());
    return res.data;
  },

  getUserDetail: async (id: number): Promise<AdminUserView> => {
    const res = await axios.get(`${API_URL}/admin/users/${id}`, auth());
    return res.data;
  },

  createUser: async (payload: CreateUserPayload): Promise<{ message: string; user_id: number }> => {
    const res = await axios.post(`${API_URL}/admin/users`, payload, auth());
    return res.data;
  },

  changeRole: async (id: number, rol_id: number): Promise<{ message: string }> => {
    const res = await axios.put(`${API_URL}/admin/users/${id}/role`, { rol_id }, auth());
    return res.data;
  },

  editCommonUser: async (
    id: number,
    data: { user_email?: string; status?: boolean },
  ): Promise<{ message: string }> => {
    const res = await axios.put(`${API_URL}/admin/users/${id}/edit`, data, auth());
    return res.data;
  },

  // SUPERADMIN: elimina cualquier usuario
  deleteUser: async (id: number): Promise<{ message: string }> => {
    const res = await axios.delete(`${API_URL}/admin/users/${id}`, auth());
    return res.data;
  },

  // ADMIN: elimina usuario común
  deleteCommonUser: async (id: number): Promise<{ message: string }> => {
    const res = await axios.delete(`${API_URL}/admin/users/${id}/common`, auth());
    return res.data;
  },

  getAdmins: async (): Promise<AdminUserView[]> => {
    const res = await axios.get(`${API_URL}/admin/admins`, auth());
    return res.data;
  },

  deleteAdmin: async (id: number): Promise<{ message: string }> => {
    const res = await axios.delete(`${API_URL}/admin/admins/${id}`, auth());
    return res.data;
  },

  getAuditLogs: async (limit = 100): Promise<AuditLog[]> => {
    const res = await axios.get(`${API_URL}/admin/audit-logs?limit=${limit}`, auth());
    return res.data;
  },

  getLiquidationSummary: async (): Promise<LiquidationSummary> => {
    const res = await axios.get(`${API_URL}/liquidation/admin/summary`, auth());
    return res.data;
  },
};
