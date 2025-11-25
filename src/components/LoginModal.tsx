/**
 * ========================================
 * LOGIN MODAL COMPONENT
 * ========================================
 * Modal đăng nhập/đăng ký cho người dùng
 * 
 * Chức năng:
 * - 2 tabs: Login và Register
 * - Login: Đăng nhập bằng email + password
 * - Register: Đăng ký tài khoản mới với validation
 * - Toggle hiện/ẩn password
 * - Error handling và toast notifications
 * - Auto reset form khi đóng modal
 * 
 * Validation:
 * - Email: Phải đúng format email
 * - Password: Tối thiểu 6 ký tự
 * - Confirm Password: Phải khớp với Password
 * - Phone: Format số điện thoại Việt Nam
 * - Name: Không được để trống
 * 
 * Flow:
 * 1. User mở modal
 * 2. Chọn tab Login hoặc Register
 * 3. Nhập thông tin
 * 4. Submit -> Gọi AuthService
 * 5. Thành công -> onSuccess callback + đóng modal
 * 6. Thất bại -> Hiển thị error message
 */

// Import React hooks
import { useState, useEffect } from "react";

// Import UI components
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Alert, AlertDescription } from "./ui/alert";

// Import icons
import { Eye, EyeOff, Mail, Lock, User, Phone } from "lucide-react";

// Import services
import { AuthService } from "../services/authService";
import { toast } from "sonner";
import { useLanguage } from "../hooks/useLanguage";

/**
 * Interface định nghĩa props của LoginModal
 */
interface LoginModalProps {
  isOpen: boolean;                    // Trạng thái mở/đóng modal
  onClose: () => void;                // Callback khi đóng modal
  onSuccess: (user: any) => void;     // Callback khi login/register thành công
}

export function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("login");

  // Reset tab to login whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab("login");
      setError("");
    }
  }, [isOpen]);

  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: ""
  });

  // Register form state
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const user = await AuthService.login(loginForm.email, loginForm.password);
      toast.success(`Chào mừng trở lại, ${user.name}!`);
      onSuccess(user);
      onClose();
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validation
    if (registerForm.password !== registerForm.confirmPassword) {
      setError("Mật khẩu không khớp");
      setIsLoading(false);
      return;
    }

    if (registerForm.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      setIsLoading(false);
      return;
    }

    try {
      const user = await AuthService.register({
        name: registerForm.name,
        email: registerForm.email,
        phone: registerForm.phone,
        password: registerForm.password,
        vehicleInfo: {
          make: "N/A",
          model: "N/A", 
          year: 2020,
          batteryCapacity: 50
        }
      });
      
      console.log('User registered successfully:', user);
      toast.success(`Tạo tài khoản thành công! Chào mừng, ${user.name}!`);
      onSuccess(user);
      onClose();
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || "Đăng ký thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForms = () => {
    setLoginForm({ email: "", password: "" });
    setRegisterForm({
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: ""
    });
    setError("");
    setActiveTab("login"); // Always reset to login tab
  };

  const handleClose = () => {
    resetForms();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">
            {t.welcome}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">{t.signIn}</TabsTrigger>
            <TabsTrigger value="register">{t.signUp}</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <Card>
              <CardHeader className="text-center">
                <CardTitle>{t.signInTitle}</CardTitle>
                <CardDescription>
                  Nhập thông tin của bạn để đăng nhập
                </CardDescription>             
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t.email}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="email"
                        type="email"
                        placeholder={t.emailPlaceholder}
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">{t.password}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder={t.passwordPlaceholder}
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertDescription className="text-red-700">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={isLoading}
                  >
                    {isLoading ? "Đang đăng nhập..." : t.signIn}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            <Card>
              <CardHeader className="text-center">
                <CardTitle>{t.createAccount}</CardTitle>
                <CardDescription>
                  Tham gia ChargeTech để bắt đầu hành trình xe điện
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleRegister} className="space-y-4">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-700">{t.personalInformation}</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="register-name">{t.fullName}</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            id="register-name"
                            type="text"
                            placeholder={t.fullNamePlaceholder}
                            value={registerForm.name}
                            onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="register-phone">{t.phoneNumber}</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            id="register-phone"
                            type="tel"
                            placeholder={t.phoneNumberPlaceholder}
                            value={registerForm.phone}
                            onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-email">{t.email}</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="register-email"
                          type="email"
                          placeholder={t.emailPlaceholder}
                          value={registerForm.email}
                          onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="register-password">{t.password}</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            id="register-password"
                            type="password"
                            placeholder={t.passwordPlaceholder}
                            value={registerForm.password}
                            onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="register-confirm">{t.confirmPassword}</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            id="register-confirm"
                            type="password"
                            placeholder={t.passwordPlaceholder}
                            value={registerForm.confirmPassword}
                            onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertDescription className="text-red-700">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={isLoading}
                  >
                    {isLoading ? "Đang tạo tài khoản..." : t.createAccount}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}