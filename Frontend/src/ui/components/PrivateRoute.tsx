/**
 * UI LAYER - COMPONENTE
 * Protege las rutas privadas
 */

import { Navigate } from "react-router-dom";
import { type ReactNode } from "react";
import { useAuth } from "../context/useAuth";

interface PrivateRouteProps {
  children: ReactNode;
}

export const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;
