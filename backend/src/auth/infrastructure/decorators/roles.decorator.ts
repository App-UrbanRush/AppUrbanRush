import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const MIN_ROLE_KEY = 'min_role';

export enum UserRole {
  SUPERADMIN = 5, 
  ADMIN = 1,
  USER = 2,
  DOMICILIARIO = 3,
  BUSINESS = 4,
}

export const ROLE_HIERARCHY: Record<number, number> = {
  [UserRole.SUPERADMIN]: 0,  
  [UserRole.ADMIN]: 1,
  [UserRole.USER]: 2,
  [UserRole.DOMICILIARIO]: 3,
  [UserRole.BUSINESS]: 4,
};

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
export const MinRole = (role: UserRole) => SetMetadata(MIN_ROLE_KEY, role);