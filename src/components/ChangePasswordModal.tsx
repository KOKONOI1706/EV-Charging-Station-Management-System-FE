// Import các thư viện cần thiết
import { useState } from "react"; // Hook để quản lý state trong component
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"; // Component Dialog để hiển thị popup
import { Button } from "./ui/button"; // Component Button
import { Input } from "./ui/input"; // Component Input để nhập liệu
import { Label } from "./ui/label"; // Component Label cho các trường input
import { toast } from "sonner"; // Thư viện hiển thị thông báo (toast notification)
import { useLanguage } from "../hooks/useLanguage"; // Hook để hỗ trợ đa ngôn ngữ
import { AuthService } from "../services/authService"; // Service xử lý xác thực và đổi mật khẩu
import { Eye, EyeOff } from "lucide-react"; // Icon để toggle hiện/ẩn mật khẩu

/**
 * Interface định nghĩa các props (thuộc tính) mà component nhận vào
 */
interface ChangePasswordModalProps {
  isOpen: boolean; // Trạng thái mở/đóng của modal
  onClose: () => void; // Hàm callback khi đóng modal
  userId: string; // ID của user đang đổi mật khẩu
}

/**
 * Component ChangePasswordModal - Modal để người dùng đổi mật khẩu
 * @param isOpen - Trạng thái hiển thị modal
 * @param onClose - Hàm đóng modal
 * @param userId - ID của người dùng
 */
export function ChangePasswordModal({
  isOpen,
  onClose,
  userId
}: ChangePasswordModalProps) {
  // Hook lấy hàm dịch ngôn ngữ
  const { t } = useLanguage();
  
  /**
   * State lưu trữ dữ liệu form gồm 3 trường:
   * - currentPassword: Mật khẩu hiện tại
   * - newPassword: Mật khẩu mới
   * - confirmPassword: Xác nhận mật khẩu mới
   */
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  /**
   * State quản lý trạng thái hiện/ẩn mật khẩu cho từng trường
   * - current: Hiển thị mật khẩu hiện tại
   * - new: Hiển thị mật khẩu mới
   * - confirm: Hiển thị xác nhận mật khẩu
   */
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  // State theo dõi trạng thái đang loading khi submit form
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Hàm xử lý khi submit form đổi mật khẩu
   * @param e - Event từ form submit
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Ngăn chặn hành vi mặc định của form (reload trang)
    
    // ===== BƯỚC 1: VALIDATE DỮ LIỆU =====
    
    // Kiểm tra mật khẩu hiện tại có được nhập không
    if (!formData.currentPassword.trim()) {
      toast.error(t.currentPasswordRequired || "Current password is required");
      return;
    }

    // Kiểm tra mật khẩu mới có được nhập không
    if (!formData.newPassword.trim()) {
      toast.error(t.newPasswordRequired || "New password is required");
      return;
    }

    // Kiểm tra xác nhận mật khẩu có được nhập không
    if (!formData.confirmPassword.trim()) {
      toast.error(t.confirmPasswordRequired || "Please confirm your new password");
      return;
    }

    // Kiểm tra mật khẩu mới và xác nhận mật khẩu có khớp nhau không
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error(t.passwordsDoNotMatch || "Passwords do not match");
      return;
    }

    // Kiểm tra độ mạnh của mật khẩu (ít nhất 6 ký tự, có chữ hoa và số)
    const validation = AuthService.validatePassword(formData.newPassword);
    if (!validation.isValid) {
      toast.error(validation.errors[0]); // Hiển thị lỗi đầu tiên
      return;
    }

    // ===== BƯỚC 2: GỌI API ĐỔI MẬT KHẨU =====
    
    setIsLoading(true); // Bật trạng thái loading
    
    try {
      // Gọi service để đổi mật khẩu
      await AuthService.changePassword(
        userId,
        formData.currentPassword,
        formData.newPassword
      );
      
      // Hiển thị thông báo thành công
      toast.success(t.passwordChanged || "Password changed successfully");
      
      // Reset form về trạng thái ban đầu
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      
      // Đóng modal
      onClose();
    } catch (error) {
      // Xử lý lỗi nếu đổi mật khẩu thất bại
      console.error('Password change error:', error);
      toast.error(error instanceof Error ? error.message : (t.passwordChangeFailed || "Failed to change password"));
    } finally {
      setIsLoading(false); // Tắt trạng thái loading dù thành công hay thất bại
    }
  };

  /**
   * ===== PHẦN RENDER UI (GIAO DIỆN) =====
   */
  return (
    // Dialog component - Modal popup
    // open: Điều khiển hiển thị modal
    // onOpenChange: Callback khi trạng thái modal thay đổi
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        {/* Header của modal */}
        <DialogHeader>
          <DialogTitle>{t.changePassword || "Change Password"}</DialogTitle>
        </DialogHeader>
        
        {/* Form đổi mật khẩu */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* ===== TRƯỜNG NHẬP MẬT KHẨU HIỆN TẠI ===== */}
          <div className="space-y-2">
            <Label htmlFor="currentPassword">{t.currentPassword || "Current Password"}</Label>
            <div className="relative">
              {/* Input cho mật khẩu hiện tại */}
              <Input
                id="currentPassword"
                type={showPasswords.current ? "text" : "password"} // Toggle giữa text và password
                value={formData.currentPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                placeholder="Enter current password"
                required
              />
              {/* Nút toggle hiện/ẩn mật khẩu */}
              <button
                type="button"
                onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {/* Hiển thị icon Eye hoặc EyeOff tùy trạng thái */}
                {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          {/* ===== TRƯỜNG NHẬP MẬT KHẨU MỚI ===== */}
          <div className="space-y-2">
            <Label htmlFor="newPassword">{t.newPassword || "New Password"}</Label>
            <div className="relative">
              {/* Input cho mật khẩu mới */}
              <Input
                id="newPassword"
                type={showPasswords.new ? "text" : "password"}
                value={formData.newPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                placeholder="Enter new password"
                required
              />
              {/* Nút toggle hiện/ẩn mật khẩu */}
              <button
                type="button"
                onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {/* Hiển thị yêu cầu về độ mạnh mật khẩu */}
            <p className="text-xs text-gray-500">
              {t.passwordRequirements || "Password must be at least 6 characters with 1 uppercase and 1 number"}
            </p>
          </div>
          
          {/* ===== TRƯỜNG XÁC NHẬN MẬT KHẨU MỚI ===== */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t.confirmPassword || "Confirm New Password"}</Label>
            <div className="relative">
              {/* Input để xác nhận lại mật khẩu mới */}
              <Input
                id="confirmPassword"
                type={showPasswords.confirm ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirm new password"
                required
              />
              {/* Nút toggle hiện/ẩn mật khẩu */}
              <button
                type="button"
                onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          {/* ===== PHẦN NÚT HÀNH ĐỘNG ===== */}
          <div className="flex justify-end gap-3 pt-4">
            {/* Nút Cancel - Hủy bỏ và đóng modal */}
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              {t.cancel}
            </Button>
            {/* Nút Submit - Xác nhận đổi mật khẩu */}
            <Button 
              type="submit" 
              className="bg-green-600 hover:bg-green-700"
              disabled={isLoading} // Disable khi đang loading
            >
              {/* Hiển thị text khác nhau khi đang loading */}
              {isLoading ? (t.changing || "Changing...") : (t.changePassword || "Change Password")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
