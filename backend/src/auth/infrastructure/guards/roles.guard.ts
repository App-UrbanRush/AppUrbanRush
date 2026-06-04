import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, MIN_ROLE_KEY, ROLE_HIERARCHY, UserRole } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<number[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const minRole = this.reflector.getAllAndOverride<UserRole>(MIN_ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si no hay restricción de roles, permite el acceso
    if (!requiredRoles && minRole === undefined) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) throw new ForbiddenException('Usuario no autenticado');

    const userRoles: number[] = user.rolIds || [];

    // Validación por roles exactos (@Roles)
    if (requiredRoles) {
      const hasRole = requiredRoles.some(role => userRoles.includes(role));
      if (!hasRole) {
        throw new ForbiddenException('No tienes permisos para realizar esta acción');
      }
      return true;
    }

    // Validación por jerarquía (@MinRole)
    if (minRole !== undefined) {
      const minHierarchy = ROLE_HIERARCHY[minRole];
      const hasMinRole = userRoles.some(roleId => {
        const hierarchy = ROLE_HIERARCHY[roleId as UserRole];
        return hierarchy !== undefined && hierarchy <= minHierarchy;
      });

      if (!hasMinRole) {
        throw new ForbiddenException('No tienes el nivel de acceso requerido');
      }
      return true;
    }

    return false;
  }
}