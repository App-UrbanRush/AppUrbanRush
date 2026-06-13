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

export interface UserFilters {
  role?: number;
  status?: string;
  search?: string;
  verification_status?: string;
}

export interface CreateUserDto {
  user_email: string;
  user_password: string;
  firstName: string;
  firstLastName: string;
  cellphone: string;
  address: string;
  gender: string;
  rol_id: number;
}
