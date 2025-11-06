import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthService } from '../services/authService';
import { Card, CardContent } from './ui/card';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
  requireAdmin?: boolean;
  showAccessDenied?: boolean;
}

export const ProtectedRoute = ({ 
  children, 
  allowedRoles = [], 
  requireAdmin = false,
  showAccessDenied = true 
}: ProtectedRouteProps) => {
  const currentUser = AuthService.getCurrentUser();

  if (!currentUser) {
    // Not logged in, redirect to login page
    return <Navigate to="/auth" replace />;
  }

  // Check admin requirement
  if (requireAdmin && currentUser.role !== 'admin') {
    if (showAccessDenied) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <div className="text-6xl mb-4">🚫</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
              <p className="text-gray-600 mb-4">
                You need admin privileges to access this page.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Your role: <span className="font-medium">{currentUser.role}</span>
              </p>
              <div className="space-y-2">
                <button 
                  onClick={() => window.history.back()}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Go Back
                </button>
                <button 
                  onClick={() => window.location.href = '/dashboard'}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Go to Dashboard
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
    return <Navigate to="/dashboard" replace />;
  }

  // Check allowed roles
  if (allowedRoles.length > 0 && (!currentUser.role || !allowedRoles.includes(currentUser.role))) {
    // Not authorized, redirect based on role
    if (currentUser.role === "admin") {
      return <Navigate to="/admin" replace />;
    } else if (currentUser.role === "staff") {
      return <Navigate to="/staff" replace />;
    } else if (currentUser.role === "customer") {
      return <Navigate to="/" replace />; // Customer về trang chủ
    }
  }

  // Authorized, render component
  return <>{children}</>;
};