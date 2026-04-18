import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

export enum UserRole {
  ADMIN = 1,
  USER = 2, 
  DOMICILIARIO = 3,
  BUSINESS = 4
}

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);