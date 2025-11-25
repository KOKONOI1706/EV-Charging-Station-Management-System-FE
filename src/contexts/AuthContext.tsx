/**
 * ========================================
 * AUTH CONTEXT
 * ========================================
 * React Context để quản lý state xác thực toàn app
 * 
 * Chức năng:
 * - Cung cấp thông tin user cho toàn bộ app
 * - Quản lý trạng thái đăng nhập (authenticated state)
 * - Cung cấp hàm login/logout
 * - Cung cấp hàm cập nhật thông tin user
 * - Tự động khôi phục session từ localStorage khi app load
 * 
 * Cách sử dụng:
 * 1. Wrap app với <AuthProvider>
 * 2. Dùng hook useAuth() để truy cập context
 * 
 * State cung cấp:
 * - user: Thông tin user hiện tại (hoặc null nếu chưa login)
 * - isAuthenticated: Boolean cho biết đã login hay chưa
 * - isLoading: Boolean cho biết đang check auth state
 * - login(): Hàm set user sau khi đăng nhập
 * - logout(): Hàm đăng xuất
 * - updateUser(): Hàm cập nhật thông tin user
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