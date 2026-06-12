import type {
  AdminUserView, SystemStats, AuditLog, LiquidationSummary,
  CreateUserPayload, UserFilters,
} from "../types/admin.types";

export interface IAdminRepository {
  getStats(): Promise<SystemStats>;
  getUsers(filters?: UserFilters): Promise<AdminUserView[]>;
  getCommonUsers(): Promise<AdminUserView[]>;
  getUserDetail(id: number): Promise<AdminUserView>;
  createUser(payload: CreateUserPayload): Promise<{ message: string; user_id: number }>;
  changeRole(id: number, rolId: number): Promise<{ message: string }>;
  editCommonUser(id: number, data: { user_email?: string; status?: boolean }): Promise<{ message: string }>;
  deleteUser(id: number): Promise<{ message: string }>;
  deleteCommonUser(id: number): Promise<{ message: string }>;
  getAdmins(): Promise<AdminUserView[]>;
  deleteAdmin(id: number): Promise<{ message: string }>;
  getAuditLogs(limit?: number): Promise<AuditLog[]>;
  getLiquidationSummary(): Promise<LiquidationSummary>;
}
