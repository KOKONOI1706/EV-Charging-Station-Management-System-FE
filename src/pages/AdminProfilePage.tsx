import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { useAuth } from "../contexts/AuthContext";
import { User, Mail, Phone, Calendar, Shield, Edit2, Save, X, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { AuthService } from "../services/authService";

export default function AdminProfilePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  if (!isAuthenticated || !user) {
    navigate('/admin');
    return null;
  }

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await updateUser({
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
      });
      
      toast.success("Cập nhật hồ sơ thành công!");
      setIsEditing(false);
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error("Cập nhật thất bại: " + (error instanceof Error ? error.message : "Lỗi không xác định"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (securityData.newPassword !== securityData.confirmPassword) {
      toast.error("Mật khẩu mới không khớp");
      return;
    }

    if (securityData.newPassword.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    setIsSaving(true);
    try {
      await AuthService.changePassword(
        user.id,
        securityData.currentPassword,
        securityData.newPassword
      );
      
      toast.success("Đổi mật khẩu thành công!");
      setSecurityData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error('Change password error:', error);
      toast.error("Đổi mật khẩu thất bại: " + (error instanceof Error ? error.message : "Lỗi không xác định"));
    } finally {
      setIsSaving(false);
    }
  };

  const memberSince = new Date().toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header - Simplified */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white text-3xl font-semibold shadow-lg">
                  {user.name?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">{user.name}</h1>
                <p className="text-gray-500 text-sm mt-1">
                  <Mail className="w-4 h-4 inline mr-1" />
                  {user.email}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    <User className="w-3 h-3 mr-1" />
                    {user.role === 'admin' ? 'Quản trị viên' : user.role}
                  </span>
                  <span className="text-xs text-gray-500">
                    <Calendar className="w-3 h-3 inline mr-1" />
                    Thành viên từ {memberSince}
                  </span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin')}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Tabs - Simplified */}
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="inline-flex h-10 items-center justify-center rounded-lg bg-gray-100 p-1">
            <TabsTrigger value="profile" className="rounded-md px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Hồ sơ
            </TabsTrigger>
            <TabsTrigger value="security" className="rounded-md px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              Bảo mật
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="shadow-sm border border-gray-200">
              <CardHeader className="border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold">Thông tin cá nhân</CardTitle>
                    <CardDescription className="text-sm">Cập nhật thông tin cá nhân của bạn</CardDescription>
                  </div>
                  {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                      <Edit2 className="w-4 h-4 mr-2" />
                      Chỉnh sửa
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button onClick={() => setIsEditing(false)} variant="outline" size="sm">
                        Hủy
                      </Button>
                      <Button onClick={handleSaveProfile} disabled={isSaving} size="sm" className="bg-green-600 hover:bg-green-700">
                        <Save className="w-4 h-4 mr-2" />
                        {isSaving ? 'Đang lưu...' : 'Lưu'}
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">Họ và tên</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        disabled={!isEditing}
                        className="pl-10"
                        placeholder="Nhập họ và tên"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">Số điện thoại</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        disabled={!isEditing}
                        className="pl-10"
                        placeholder="Nhập số điện thoại"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">Địa chỉ email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        disabled={!isEditing}
                        className="pl-10"
                        placeholder="Nhập địa chỉ email"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card className="shadow-sm border border-gray-200">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  <Shield className="w-5 h-5" />
                  Cài đặt bảo mật
                </CardTitle>
                <CardDescription className="text-sm">Cập nhật mật khẩu và tùy chọn bảo mật</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password" className="text-sm font-medium">Mật khẩu hiện tại</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={securityData.currentPassword}
                      onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                      placeholder="Nhập mật khẩu hiện tại"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-password" className="text-sm font-medium">Mật khẩu mới</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={securityData.newPassword}
                      onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                      placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-sm font-medium">Xác nhận mật khẩu mới</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={securityData.confirmPassword}
                      onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                      placeholder="Nhập lại mật khẩu mới"
                    />
                  </div>

                  <Button 
                    onClick={handleChangePassword} 
                    disabled={isSaving || !securityData.currentPassword || !securityData.newPassword}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {isSaving ? "Đang đổi mật khẩu..." : "Đổi mật khẩu"}
                  </Button>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                  <p className="text-sm text-amber-900 font-medium mb-2">
                    ⚠️ Yêu cầu mật khẩu:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-amber-800">
                    <li>Tối thiểu 6 ký tự</li>
                    <li>Sử dụng kết hợp chữ cái và số</li>
                    <li>Không sử dụng lại mật khẩu cũ</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}