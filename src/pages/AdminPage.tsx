/**
 * ===============================================================
 * ADMIN PAGE
 * ===============================================================
 * Trang chính cho Admin role (role = 2)
 * 
 * Chức năng:
 * - Render EnhancedAdminDashboard component
 * - Protected route: Chỉ Admin mới truy cập được
 * 
 * URL: /admin
 * 
 * Dependencies:
 * - EnhancedAdminDashboard: Dashboard component cho admin
 * - ProtectedRoute: Xác thực role trước khi render
 */

import { EnhancedAdminDashboard } from "../components/EnhancedAdminDashboard";

export default function AdminPage() {
  return <EnhancedAdminDashboard />;
}
