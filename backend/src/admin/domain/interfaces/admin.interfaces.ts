export interface SystemStats {
  total_users: number;
  total_orders: number;
  total_payments: number;
  total_vendors: number;
  total_couriers: number;
  total_revenue: number;
  orders_by_status: Record<string, number>;
  payments_by_status: Record<string, number>;
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
