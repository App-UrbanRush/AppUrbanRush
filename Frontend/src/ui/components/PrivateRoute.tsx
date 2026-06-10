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
    // Si el usuario no está cargado aún, mostrar loading o permitir acceso temporalmente
    if (!user) {
      console.log("PrivateRoute - User not loaded yet, allowing access");
      return children;
    }

    const userRole = user.role;
    console.log("PrivateRoute - User:", user);
    console.log("PrivateRoute - User role:", userRole);
    console.log("PrivateRoute - Allowed roles:", allowedRoles);
    
    const isAllowed =
      (allowedRoles.includes(4) && userRole === "Negocio") ||
      (allowedRoles.includes(3) && userRole === "Domiciliario");
    
    if (!isAllowed) {
      console.log("PrivateRoute - Not allowed, redirecting to /dashboard");
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default PrivateRoute;
