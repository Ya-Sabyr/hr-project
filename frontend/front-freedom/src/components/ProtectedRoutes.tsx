import { Navigate } from "react-router-dom";
import { AuthService } from "../services/auth.service";

interface ProtectedRouteProps {
  element: React.ReactElement;
  allowedRoles: string[];
}

export const ProtectedRoute = ({ element, allowedRoles }: ProtectedRouteProps) => {
  const userRole = AuthService.getUserType();

  if (!userRole) {
    return <Navigate to="/login" />;
  }

  return allowedRoles.includes(userRole) ? element : <Navigate to="/" />;
};
