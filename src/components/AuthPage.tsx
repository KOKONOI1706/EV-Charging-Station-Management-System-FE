import { useState, useEffect } from "react";
import { AuthService } from "../services/authService";
import { User } from "../data/mockDatabase";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { ArrowLeft, Eye, EyeOff, Mail, Lock } from "lucide-react";
import { toast } from "sonner";

interface AuthPageProps {
  onSuccess: (user: User) => void;
  onBack: () => void;
}

export function AuthPage({ onSuccess, onBack }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Clear error on mount and when switching tabs
  useEffect(() => {
    setError("");
  }, [isLogin]);

  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  // Register form state
  const [registerForm, setRegisterForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Email verification state
  const [verificationStep, setVerificationStep] = useState<'input' | 'verifying'>('input');
  const [verificationCode, setVerificationCode] = useState("");
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const user = await AuthService.login(loginForm.email, loginForm.password);
      toast.success(`Chào mừng trở lại, ${user.name}!`);
      onSuccess(user);
    } catch (err: any) {
      setError(err.message || "Đăng nhập thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendVerificationCode = async () => {
    if (!registerForm.email) {
      setError("Vui lòng nhập email");
      return;
    }

    setIsSendingCode(true);
    setError("");

    try {
      const response = await fetch(`${(import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api'}/users/send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: registerForm.email })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Không thể gửi mã xác thực');
      }

      toast.success("Mã xác thực đã được gửi lại!");
    } catch (err: any) {
      setError(err.message || "Không thể gửi mã xác thực");
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If we're in input step, validate and send code
    if (verificationStep === 'input') {
      setError("");
      
      // Validation
      if (registerForm.password !== registerForm.confirmPassword) {
        setError("Mật khẩu không khớp");
        return;
      }

      if (registerForm.password.length < 6) {
        setError("Mật khẩu phải có ít nhất 6 ký tự");
        return;
      }

      // Send verification code and move to verification screen
      setIsSendingCode(true);
      try {
        const response = await fetch(`${(import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api'}/users/send-code`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: registerForm.email })
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Không thể gửi mã xác thực');
        }

        toast.success("Mã xác thực đã được gửi đến email của bạn!");
        setVerificationStep('verifying');
      } catch (err: any) {
        setError(err.message || "Không thể gửi mã xác thực");
      } finally {
        setIsSendingCode(false);
      }
      return;
    }

    // If we're in verifying step, verify code and register
    if (verificationStep === 'verifying') {
      if (!verificationCode || verificationCode.length !== 6) {
        setError("Vui lòng nhập đủ 6 chữ số mã xác thực");
        return;
      }

      setIsVerifying(true);
      setError("");

      try {
        // Step 1: Verify the code
        const verifyResponse = await fetch(`${(import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api'}/users/verify-code`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: registerForm.email,
            code: verificationCode 
          })
        });

        const verifyResult = await verifyResponse.json();

        if (!verifyResponse.ok) {
          throw new Error(verifyResult.error || 'Mã xác thực không hợp lệ');
        }

        // Step 2: Register the user
        const user = await AuthService.register({
          name: `User${Date.now()}`,
          email: registerForm.email,
          phone: "",
          password: registerForm.password,
          vehicleInfo: {
            make: "N/A",
            model: "N/A",
            year: 2020,
            batteryCapacity: 50
          }
        });

        toast.success(`Tạo tài khoản thành công! Chào mừng bạn!`);
        onSuccess(user);
      } catch (err: any) {
        setError(err.message || "Đăng ký thất bại");
      } finally {
        setIsVerifying(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-repeat" style={{
          backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cg fill-opacity='0.1'%3E%3Cpath d='M50 30c11.046 0 20 8.954 20 20s-8.954 20-20 20-20-8.954-20-20 8.954-20 20-20z'/%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="absolute -top-12 left-0 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>

        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-xl">⚡</span>
                </div>
                <span className="text-2xl font-bold text-green-600">ChargeTech</span>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {isLogin ? "Đăng nhập" : "Tạo tài khoản"}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {isLogin 
                ? "Đăng nhập để sử dụng dịch vụ ChargeTech" 
                : "Tạo tài khoản mới để bắt đầu sử dụng ChargeTech"
              }
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            {/* Tab Buttons */}
            <div className="grid w-full grid-cols-2 mb-6">
              <Button
                variant={isLogin ? "default" : "ghost"}
                onClick={() => {
                  setIsLogin(true);
                  setError("");
                  setVerificationStep('input');
                  setVerificationCode("");
                }}
                className="rounded-r-none"
              >
                Đăng nhập
              </Button>
              <Button
                variant={!isLogin ? "default" : "ghost"}
                onClick={() => {
                  setIsLogin(false);
                  setError("");
                  setVerificationStep('input');
                  setVerificationCode("");
                }}
                className="rounded-l-none"
              >
                Đăng ký
              </Button>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Login Form */}
            {isLogin ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Mật khẩu</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
                </Button>
              </form>
            ) : (
              /* Register Form */
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                {verificationStep === 'input' ? (
                  // Step 1: Email and Password Input
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="reg-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="reg-email"
                          type="email"
                          placeholder="your.email@example.com"
                          value={registerForm.email}
                          onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-password">Mật khẩu</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="reg-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={registerForm.password}
                          onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                          className="pl-10 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Xác nhận mật khẩu</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={registerForm.confirmPassword}
                          onChange={(e) => setRegisterForm({...registerForm, confirmPassword: e.target.value})}
                          className="pl-10 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isSendingCode}
                    >
                      {isSendingCode ? "Đang gửi mã..." : "Tạo tài khoản"}
                    </Button>
                  </>
                ) : (
                  // Step 2: Verification Code Input
                  <>
                    <Alert className="mt-4 mb-5 border-blue-200 bg-blue-50">
                      <AlertDescription className="text-blue-700">
                        Mã xác thực đã được gửi đến <strong>{registerForm.email}</strong>
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-3">
                      <Label htmlFor="verification-code" className="text-sm font-semibold text-gray-700">
                        Mã xác thực
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="verification-code"
                          type="text"
                          placeholder="Nhập mã 6 chữ số"
                          value={verificationCode}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            setVerificationCode(value);
                          }}
                          className="pl-11 pr-4 py-6 text-center text-2xl tracking-[0.5em] font-bold border-2 border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-lg shadow-sm"
                          maxLength={6}
                          autoFocus
                        />
                      </div>
                      <p className="text-xs text-gray-500 text-center mt-2">
                        Mã có hiệu lực trong 10 phút
                      </p>
                    </div>

                    <div className="mt-6 space-y-3">
                      <Button 
                        type="submit" 
                        className="w-full py-6 text-base font-semibold shadow-md hover:shadow-lg transition-all" 
                        disabled={isVerifying || !verificationCode}
                      >
                        {isVerifying ? "Đang xác thực..." : "Xác thực và tạo tài khoản"}
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        className="w-full py-5 border-2 hover:bg-gray-50 transition-all"
                        onClick={handleSendVerificationCode}
                        disabled={isSendingCode}
                      >
                        {isSendingCode ? "Đang gửi..." : "Gửi lại mã"}
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        className="w-full py-5 hover:bg-gray-100 transition-all"
                        onClick={() => {
                          setVerificationStep('input');
                          setVerificationCode("");
                          setError("");
                        }}
                      >
                        Quay lại
                      </Button>
                    </div>
                  </>
                )}
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}