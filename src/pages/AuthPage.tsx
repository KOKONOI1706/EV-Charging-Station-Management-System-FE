/**
 * ===============================================================
 * AUTH PAGE ROUTE (TRANG ĐĂNG NHẬP/ĐĂNG KÝ)
 * ===============================================================
 * Route wrapper cho AuthPage component với redirect logic
 * 
 * Chức năng:
 * - 🔐 Đăng nhập / Đăng ký
 * - 🔄 Redirect sau khi login thành công
 * - 🎯 Multi-role redirect (admin/staff/customer)
 * - ⬅️ Back button về trang chủ
 * 
 * Login success flow:
 * 1. User login thành công → AuthPage gọi onSuccess(user)
 * 2. Gọi AuthContext.login(user) để lưu session
 * 3. Redirect dựa vào user.role:
 *    - admin → /admin (Admin Dashboard)
 *    - staff → /staff (Staff Dashboard)
 *    - customer → / (Home page để tìm trạm)
 * 
 * URL: /auth
 * 
 * Dependencies:
 * - AuthPage component: Component login/register
 * - useAuth: AuthContext hook
 * - useNavigate: React Router navigation
 */

import { useNavigate } from "react-router-dom";
import { AuthPage } from "../components/AuthPage";
import { useAuth } from "../contexts/AuthContext";
import { User } from "../data/mockDatabase";

export default function AuthRoute() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSuccess = (user: User) => {
    login(user);
    
    // Redirect based on user role from database
    switch (user.role) {
      case "admin":
        navigate("/admin");
        break;
      case "staff":
        navigate("/staff");
        break;
      case "customer":
      default:
        // Customer goes to home page
        // Note: selectedPlanId is still in sessionStorage for later use
        navigate("/");
        break;
    }
  };

  return <AuthPage onSuccess={handleSuccess} onBack={() => navigate("/")} />;
}
