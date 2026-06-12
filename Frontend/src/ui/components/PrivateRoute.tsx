/**
 * UI LAYER - COMPONENTE
 * Protege las rutas privadas
 */

import { Navigate } from "react-router-dom";
import { type ReactNode } from "react";
import { useAuth } from "../context/useAuth";

interface PrivateRouteProps {
  children: ReactNode;
  allowedRoles?: number[];
}

export const PrivateRoute = ({ children, allowedRoles }: PrivateRouteProps) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Si se especifican roles permitidos, verificar el rol del usuario
  if (allowedRoles && allowedRoles.length > 0) {
    if (!user) {
      return <Navigate to="/" replace />;
    }

    const ROLE_NAME_TO_ID: Record<string, number> = {
      Administrador: 1,
      Usuario: 2,
      Domiciliario: 3,
      Negocio: 4,
      SuperAdmin: 5,
    };
    const userRoleId = ROLE_NAME_TO_ID[user.role];
    const isAllowed = userRoleId != null && allowedRoles.includes(userRoleId);

    if (!isAllowed) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default PrivateRoute;
