import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../data/mockDatabase';
import { AuthService } from '../services/authService';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { useAuth };

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
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser) {
      toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      await logout();
      return;
    }
    
    try {
      const updatedUser = await AuthService.updateProfile(currentUser.user_id, updates);
      setUser(updatedUser);
      toast.success("Cập nhật thông tin thành công");
    } catch (error) {
      console.error('Failed to update user:', error);
      toast.error("Cập nhật thất bại: " + (error instanceof Error ? error.message : "Lỗi không xác định"));
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