export interface AdminUserView {
  user_id: number;
  user_email: string;
  status: boolean;
  verification_status: string;
  roles: number[];
  person: {
    firstName: string;
    firstLastName: string;
    cellphone: string;
  } | null;
}

export interface LiquidationStats {
  vendor_pending_count: number;
  vendor_pending_total: number;
  vendor_pending_commission: number;
  courier_pending_count: number;
  courier_pending_total: number;
  platform_total_pending: number;
}

export interface SystemStats {
  total_users: number;
  total_orders: number;
  total_payments: number;
  total_vendors: number;
  total_couriers: number;
  total_revenue: number;
  orders_by_status: Record<string, number>;
  payments_by_status: Record<string, number>;
  liquidations: LiquidationStats;
}

export interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entity_id: string | number;
  performed_by: number;
  performed_by_email: string;
  details: Record<string, unknown>;
  created_at: string | null;
}

export interface LiquidationSummary {
  vendors: { pending_count: number; pending_total: number; pending_commission: number };
  couriers: { pending_count: number; pending_total: number };
  platform_total_pending: number;
}

export interface CreateUserPayload {
  user_email: string;
  user_password: string;
  firstName: string;
  firstLastName: string;
  cellphone: string;
  address: string;
  gender: string;
  rol_id: number;
}

export interface UserFilters {
  role?: number;
  search?: string;
  verification_status?: string;
}
