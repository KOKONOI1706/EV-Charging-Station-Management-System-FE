/**
 * ===============================================================
 * STAFF PAGE
 * ===============================================================
 * Trang chính cho Staff role (role = 1)
 * 
 * Chức năng:
 * - Render EnhancedStaffDashboard component
 * - Protected route: Chỉ Staff hoặc Admin truy cập được
 * 
 * URL: /staff
 * 
 * Dependencies:
 * - EnhancedStaffDashboard: Dashboard component cho staff
 * - ProtectedRoute: Xác thực role trước khi render
 */

import { EnhancedStaffDashboard } from "../components/EnhancedStaffDashboard";

export default function StaffPage() {
  return <EnhancedStaffDashboard />;
}
