import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent } from './ui/card';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
  requireAdmin?: boolean;
  showAccessDenied?: boolean;
}

export const ProtectedRoute = ({ children, allowedRoles = [], requireAdmin = false, showAccessDenied = true }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    // still initializing auth state
    return null;
  }

  if (!user) {
    // Not logged in, redirect to login page
    return <Navigate to="/auth" replace />;
  }

  const role = (user as any).role === 'user' ? 'customer' : (user as any).role;

  // Admin-only requirement
  if (requireAdmin && role !== 'admin') {
    if (showAccessDenied) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <div className="text-6xl mb-4">🚫</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
              <p className="text-gray-600 mb-4">You need admin privileges to access this page.</p>
              <p className="text-sm text-gray-500 mb-6">Your role: <span className="font-medium">{role}</span></p>
              <div className="space-y-2">
                <button 
                  onClick={() => window.history.back()}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Go Back
                </button>
                <button 
                  onClick={() => window.location.href = '/'}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Go to Home
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
    return <Navigate to="/" replace />;
  }

  // If allowedRoles is specified, ensure user's role is in the list
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // Not authorized for this route - redirect based on role
    if (role === 'admin') return <Navigate to="/admin" replace />;
    if (role === 'staff') return <Navigate to="/staff" replace />;
    return <Navigate to="/" replace />;
  }

  // Authorized, render children
  return <>{children}</>;
};