import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../context/useAuth";

interface Props {
  children: ReactNode;
}

const PrivateRoute = ({ children }: Props) => {
  const { token } = useAuth();

  return token ? children : <Navigate to="/" />;
};

export default PrivateRoute;
