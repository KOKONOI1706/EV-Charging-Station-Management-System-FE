/**
 * ===============================================================
 * QUICK CHARGE BUTTON COMPONENT
 * ===============================================================
 * Nút floating "ở góc dưới phải màn hình
 * 
 * Chức năng:
 * - 🔵 Floating button góc dưới bên phải
 * - ⚡ Icon Zap (chớp điện)
 * - 👁️ Hover → Mở rộng hiển text "Quick Charge"
 * - 🔒 Chỉ hiển thị nếu user đã đăng nhập
 * - 🔗 Navigate đến /charging-test (trang test charging)
 * 
 * Styles:
 * - Position: fixed bottom-6 right-6
 * - Shape: Circular (w-16 h-16 rounded-full)
 * - Color: Green gradient (bg-green-600 hover:bg-green-700)
 * - Shadow: shadow-2xl
 * - Z-index: z-40 (trên cùng)
 * - Animation: width auto expansion on hover
 * 
 * Responsive:
 * - Mobile: Hiển icon thôi
 * - Desktop hover: Mở rộng thành button với text
 * 
 * Dependencies:
 * - useAuth: Kiểm tra isAuthenticated
 * - useNavigate: Navigate to /charging-test
 */

import { Button } from "./ui/button";
import { Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function QuickChargeButton() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <Button
      onClick={() => navigate('/charging-test')}
      className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-green-600 hover:bg-green-700 shadow-2xl z-40 flex items-center justify-center group hover:w-auto transition-all duration-300"
      size="lg"
    >
      <Zap className="w-6 h-6 text-white" />
      <span className="hidden group-hover:inline-block ml-2 mr-2 text-white font-semibold whitespace-nowrap">
        Quick Charge
      </span>
    </Button>
  );
}
