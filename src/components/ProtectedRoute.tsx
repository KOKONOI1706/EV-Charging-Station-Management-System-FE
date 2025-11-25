/**
 * ========================================
 * PROTECTED ROUTE COMPONENT
 * ========================================
 * Component bảo vệ routes - chỉ cho phép truy cập nếu đã xác thực và có quyền
 * 
 * Chức năng:
 * - Kiểm tra user đã đăng nhập chưa
 * - Kiểm tra role của user có nằm trong allowedRoles không
 * - Redirect về trang phù hợp nếu không được phép:
 *   + Chưa login -> /auth
 *   + Login nhưng sai role -> Về trang mặc định của role đó
 * 
 * Phân quyền:
 * - customer: Truy cập trang chủ, dashboard, profile
 * - staff: Truy cập staff dashboard, quản lý trạm của mình
 * - admin: Truy cập admin panel, quản lý toàn hệ thống
 * 
 * Cách dùng:
 * ```tsx
 * <ProtectedRoute allowedRoles={['admin']}>
 *   <AdminPage />
 * </ProtectedRoute>
 * ```
 * 
 * Redirect rules:
 * - Not authenticated -> /auth
 * - Wrong role:
 *   + Admin -> /admin
 *   + Staff -> /staff
 *   + Customer -> /
 */

// Import React và Router
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

// Import AuthService
import { AuthService } from '../services/authService';

/**
 * Interface định nghĩa props của ProtectedRoute
 */
interface ProtectedRouteProps {
  children: ReactNode;        // Component con cần bảo vệ
  allowedRoles: string[];     // Danh sách roles được phép truy cập
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const currentUser = AuthService.getCurrentUser();

  if (!currentUser) {
    // Not logged in, redirect to login page
    return <Navigate to="/auth" replace />;
  }

  if (!currentUser.role || !allowedRoles.includes(currentUser.role)) {
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