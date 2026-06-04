import { UserFilters } from '../interfaces/admin.interfaces';

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

export interface IAdminUserRepository {
  findFiltered(filters: UserFilters): Promise<AdminUserView[]>;
  findCommonUsers(): Promise<AdminUserView[]>;
  findAdmins(): Promise<AdminUserView[]>;
}
