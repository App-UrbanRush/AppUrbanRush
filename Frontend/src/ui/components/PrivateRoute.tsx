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

    const userRole = user.role;
    
    const isAllowed =
      (allowedRoles.includes(4) && userRole === "Negocio") ||
      (allowedRoles.includes(3) && userRole === "Domiciliario");
    
    if (!isAllowed) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default PrivateRoute;
