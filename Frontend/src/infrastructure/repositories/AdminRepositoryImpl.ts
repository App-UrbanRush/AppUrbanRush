import type { IAdminRepository } from "../../domain/interfaces/IAdminRepository";
import type {
  AdminUserView, SystemStats, AuditLog, LiquidationSummary,
  CreateUserPayload, UserFilters,
} from "../../domain/types/admin.types";
import { adminApi } from "../api/adminApi";

export class AdminRepositoryImpl implements IAdminRepository {
  getStats(): Promise<SystemStats> { return adminApi.getStats(); }
  getUsers(filters?: UserFilters): Promise<AdminUserView[]> { return adminApi.getUsers(filters); }
  getCommonUsers(): Promise<AdminUserView[]> { return adminApi.getCommonUsers(); }
  getUserDetail(id: number): Promise<AdminUserView> { return adminApi.getUserDetail(id); }
  createUser(payload: CreateUserPayload) { return adminApi.createUser(payload); }
  changeRole(id: number, rolId: number) { return adminApi.changeRole(id, rolId); }
  editCommonUser(id: number, data: { user_email?: string; status?: boolean }) {
    return adminApi.editCommonUser(id, data);
  }
  deleteUser(id: number) { return adminApi.deleteUser(id); }
  deleteCommonUser(id: number) { return adminApi.deleteCommonUser(id); }
  getAdmins(): Promise<AdminUserView[]> { return adminApi.getAdmins(); }
  deleteAdmin(id: number) { return adminApi.deleteAdmin(id); }
  getAuditLogs(limit?: number): Promise<AuditLog[]> { return adminApi.getAuditLogs(limit); }
  getLiquidationSummary(): Promise<LiquidationSummary> { return adminApi.getLiquidationSummary(); }
}
