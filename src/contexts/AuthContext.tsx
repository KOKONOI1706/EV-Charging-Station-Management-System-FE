/**
 * ===============================================================
 * AUTH CONTEXT (QUẢN LÝ XÁC THỰC TOÀN APP)
 * ===============================================================
 * React Context Provider quản lý trạng thái xác thực (authentication) cho toàn bộ ứng dụng
 * 
 * Mô tả:
 * Context này cung cấp state và methods liên quan đến authentication cho tất cả components
 * trong app thông qua React Context API. Giúp tránh prop drilling và quản lý user state tập trung.
 * 
 * Chức năng chính:
 * - 👤 Quản lý thông tin user hiện tại (user state)
 * - 🔐 Quản lý trạng thái đăng nhập (authenticated state)
 * - 💾 Tự động khôi phục session từ localStorage khi app load
 * - 🔄 Cung cấp methods login/logout/updateUser cho toàn app
 * - ⏳ Quản lý loading state khi check authentication
 * - 🚀 Performance: Chỉ re-render components khi auth state thay đổi
 * 
 * Context Value (AuthContextType):
 * ```typescript
 * {
 *   user: User | null;              // Thông tin user đang đăng nhập (null = chưa login)
 *   isAuthenticated: boolean;        // true = đã login, false = chưa login
 *   isLoading: boolean;              // true = đang check auth state (app startup)
 *   login: (user) => void;           // Set user sau khi đăng nhập thành công
 *   logout: () => Promise<void>;     // Đăng xuất và xóa localStorage
 *   updateUser: (updates) => Promise<void>; // Cập nhật thông tin user
 * }
 * ```
 * 
 * Cách sử dụng:
 * 
 * 1. **Setup Provider (main.tsx hoặc App.tsx):**
 * ```tsx
 * import { AuthProvider } from './contexts/AuthContext';
 * 
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 * ```
 * 
 * 2. **Sử dụng trong component:**
 * ```tsx
 * import { useAuth } from './contexts/AuthContext';
 * 
 * function MyComponent() {
 *   const { user, isAuthenticated, login, logout } = useAuth();
 *   
 *   if (!isAuthenticated) return <div>Please login</div>;
 *   
 *   return <div>Welcome {user.name}!</div>;
 * }
 * ```
 * 
 * 3. **Login flow:**
 * ```tsx
 * const { login } = useAuth();
 * const handleLogin = async () => {
 *   const user = await AuthService.login(email, password);
 *   login(user); // ← Set user vào context
 * }
 * ```
 * 
 * 4. **Logout flow:**
 * ```tsx
 * const { logout } = useAuth();
 * const handleLogout = async () => {
 *   await logout(); // ← Xóa user + localStorage
 * }
 * ```
 * 
 * 5. **Update user info:**
 * ```tsx
 * const { updateUser } = useAuth();
 * const handleUpdate = async () => {
 *   await updateUser({ name: 'New Name' }); // ← Cập nhật backend + context
 * }
 * ```
 * 
 * Lifecycle:
 * 
 * 1. **App startup (useEffect):**
 *    - isLoading = true
 *    - Check localStorage có user không
 *    - Nếu có → setUser, setIsAuthenticated = true
 *    - Nếu không → user = null, isAuthenticated = false
 *    - isLoading = false
 * 
 * 2. **Login:**
 *    - User login thành công → AuthService trả về user object
 *    - Gọi login(user) → setUser, setIsAuthenticated = true
 *    - AuthService tự động lưu vào localStorage
 * 
 * 3. **Logout:**
 *    - Gọi logout() → AuthService xóa localStorage
 *    - setUser(null), setIsAuthenticated = false
 *    - Force logout ngay cả khi API call fail (để UX tốt)
 * 
 * State Persistence:
 * - AuthService quản lý localStorage:
 *   * Key: "chargetech_user"
 *   * Value: JSON.stringify(user)
 * - Khi app refresh → useEffect tự động khôi phục user từ localStorage
 * 
 * Error Handling:
 * - updateUser: Throw error nếu không có user đang login
 * - logout: Catch error từ API nhưng vẫn force logout (clear state)
 * - useAuth hook: Throw error nếu dùng ngoài AuthProvider
 * 
 * Protected Routes Integration:
 * ```tsx
 * import { useAuth } from './contexts/AuthContext';
 * import { Navigate } from 'react-router-dom';
 * 
 * function ProtectedRoute({ children }) {
 *   const { isAuthenticated, isLoading } = useAuth();
 *   
 *   if (isLoading) return <Spinner />;
 *   if (!isAuthenticated) return <Navigate to="/login" />;
 *   
 *   return children;
 * }
 * ```
 * 
 * Dependencies:
 * - React Context API (createContext, useContext)
 * - React Hooks (useState, useEffect)
 * - AuthService (login/logout/updateProfile/getCurrentUser)
 * - mockDatabase (User interface)
 * - localStorage (session persistence)
 * 
 * Type Safety:
 * - AuthContextType: Interface định nghĩa cấu trúc context
 * - useAuth(): Custom hook với type checking
 * - Throw error nếu useAuth() dùng ngoài Provider
 */

// Import React
import React, { createContext, useContext, useState, useEffect } from 'react';

// Import types và services
import { User } from '../data/mockDatabase';
import { AuthService } from '../services/authService';

/**
 * Interface định nghĩa cấu trúc dữ liệu của AuthContext
 */
interface AuthContextType {
  user: User | null;                          // User hiện tại (null nếu chưa login)
  login: (user: User) => void;                // Hàm đăng nhập
  logout: () => Promise<void>;                // Hàm đăng xuất
  isAuthenticated: boolean;                   // Trạng thái đã xác thực
  isLoading: boolean;                         // Trạng thái đang tải
  updateUser: (updates: Partial<User>) => Promise<void>; // Cập nhật user
}

// Tạo Context với giá trị mặc định là undefined
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Hook để sử dụng AuthContext
 * Throw error nếu dùng ngoài AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const login = (user: User) => {
    setUser(user);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      await AuthService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API call fails
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) throw new Error('No user logged in');
    
    try {
      const updatedUser = await AuthService.updateProfile(user.id, updates);
      setUser(updatedUser);
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  };

  useEffect(() => {
    // Check if user is stored in localStorage on app start
    const initializeAuth = () => {
      try {
        const currentUser = AuthService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated,
    isLoading,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};