import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthService } from '../services/authService';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: string[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const currentUser = AuthService.getCurrentUser();

  if (!currentUser) {
    // Not logged in, redirect to login page
    return <Navigate to="/auth" replace />;
  }

  if (!allowedRoles.includes(currentUser.role)) {
    // Not authorized, redirect based on role
    if (currentUser.role === "admin") {
      return <Navigate to="/admin" replace />;
    } else if (currentUser.role === "staff") {
      return <Navigate to="/staff" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Authorized, render component
  return <>{children}</>;
};