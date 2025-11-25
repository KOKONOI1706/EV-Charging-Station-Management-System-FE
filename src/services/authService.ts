/**
 * ========================================
 * AUTHENTICATION SERVICE
 * ========================================
 * Service xử lý tất cả logic xác thực và quản lý người dùng
 * 
 * Chức năng chính:
 * - Login: Đăng nhập với email/password
 * - Register: Đăng ký tài khoản mới
 * - Logout: Đăng xuất và xóa session
 * - Change Password: Đổi mật khẩu
 * - Update Profile: Cập nhật thông tin cá nhân
 * - Validate Password: Kiểm tra độ mạnh mật khẩu
 * - Storage Management: Lưu/đọc user từ localStorage
 * 
 * Cơ chế hoạt động:
 * 1. Gọi API backend để xác thực
 * 2. Fallback về demo mode nếu API fail (cho development)
 * 3. Lưu user vào localStorage sau khi login thành công
 * 4. Transform API response thành frontend User interface
 * 
 * Demo accounts (fallback):
 * - customer@demo.com / 123 (Customer role)
 * - staff@demo.com / 123 (Staff role)
 * - admin@demo.com / 123 (Admin role)
 */

// Import types
import { User, MOCK_USERS } from "../data/mockDatabase";

// Lấy API URL từ environment variable hoặc dùng default
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Interface cho dữ liệu đăng nhập
 */
export interface LoginCredentials {
  email: string;      // Email đăng nhập
  password: string;   // Mật khẩu
}

/**
 * Interface cho dữ liệu đăng ký
 */
export interface RegisterData {
  name: string;       // Tên người dùng
  email: string;      // Email
  phone: string;      // Số điện thoại
  password: string;   // Mật khẩu
  vehicleInfo: {      // Thông tin xe (optional)
    make: string;           // Hãng xe
    model: string;          // Mẫu xe
    year: number;           // Năm sản xuất
    batteryCapacity: number; // Dung lượng pin (kWh)
  };
}

export class AuthService {
  private static readonly STORAGE_KEY = "chargetech_user";
  private static users: User[] = [...MOCK_USERS];

  // Login with email and password
  static async login(email: string, password: string): Promise<User> {
    try {
      // Call real API
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || 'Login failed');
      }

      if (!result.success || !result.data?.user) {
        throw new Error('Invalid response from server');
      }

      // Transform API response to match frontend User interface
      const apiUser = result.data.user;
      const user: User = {
        id: apiUser.id,
        name: apiUser.name,
        email: apiUser.email,
        phone: apiUser.phone || '',
        memberSince: new Date(apiUser.createdAt).toISOString().split('T')[0],
        totalSessions: 0,
        totalSpent: 0,
        favoriteStations: [],
        role: apiUser.role as "customer" | "staff" | "admin",
        vehicleInfo: {
          make: "N/A",
          model: "N/A",
          year: 2020,
          batteryCapacity: 50
        }
      };

      this.saveUserToStorage(user);
      return user;
    } catch (error) {
      // Fallback to demo mode if API fails
      console.warn('API login failed, falling back to demo mode:', error);
      
      // Demo credentials for different roles
      const demoCredentials = [
        { email: "customer@demo.com", password: "123", role: "customer" },
        { email: "staff@demo.com", password: "123", role: "staff" },
        { email: "admin@demo.com", password: "123", role: "admin" },
      ];

      // Check demo credentials
      const demoUser = demoCredentials.find(
        cred => cred.email === email && cred.password === password
      );

      if (demoUser) {
        const user = this.users.find(u => u.role === demoUser.role);
        if (user) {
          this.saveUserToStorage(user);
          return user;
        }
      }

      // If it's a real API error (not network), throw it
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error("Login failed. Please check your credentials.");
    }
  }

  // Register new user
  static async register(data: RegisterData): Promise<User> {
    try {
      console.log('Attempting registration with data:', {
        name: data.name,
        email: data.email,
        phone: data.phone
      });
      console.log('API_BASE_URL:', API_BASE_URL);
      console.log('Full URL:', `${API_BASE_URL}/users/register`);

      // Call real API
      const response = await fetch(`${API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          password: data.password
        }),
      });

      console.log('API Response status:', response.status);
      console.log('API Response ok:', response.ok);

      const result = await response.json();
      console.log('API Response data:', result);

      if (!response.ok) {
        console.error('Registration failed:', result);
        throw new Error(result.error || result.message || 'Registration failed');
      }

      if (!result.success || !result.data?.user) {
        throw new Error('Invalid response from server');
      }

      // Transform API response to match frontend User interface
      const apiUser = result.data.user;
      const newUser: User = {
        id: apiUser.id,
        name: apiUser.name,
        email: apiUser.email,
        phone: apiUser.phone || '',
        memberSince: new Date(apiUser.createdAt).toISOString().split('T')[0],
        totalSessions: 0,
        totalSpent: 0,
        favoriteStations: [],
        role: apiUser.role as "customer" | "staff" | "admin",
        vehicleInfo: data.vehicleInfo
      };

      // Add to local users array for demo compatibility
      this.users.push(newUser);
      this.saveUserToStorage(newUser);
      
      return newUser;
    } catch (error) {
      // If API fails, show specific error
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection and try again.');
    }
  }

  // Quick login for demo purposes
  static async quickLogin(role: "customer" | "staff" | "admin"): Promise<User> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const user = this.users.find(u => u.role === role);
    if (!user) {
      throw new Error(`${role} account not found`);
    }

    this.saveUserToStorage(user);
    return user;
  }

  // Logout
  static async logout(): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // Get current user from storage
  static getCurrentUser(): User | null {
    try {
      const userData = localStorage.getItem(this.STORAGE_KEY);
      if (userData) {
        return JSON.parse(userData);
      }
    } catch (error) {
      console.error("Error parsing user data from storage:", error);
      localStorage.removeItem(this.STORAGE_KEY);
    }
    return null;
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  // Validate email format
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate password strength
  static validatePassword(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < 6) {
      errors.push("Password must be at least 6 characters long");
    }

    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }

    if (!/[0-9]/.test(password)) {
      errors.push("Password must contain at least one number");
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Update user profile
  static async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    try {
      // Call real API
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: updates.name,
          email: updates.email,
          phone: updates.phone,
          vehicleInfo: updates.vehicleInfo
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || 'Update failed');
      }

      if (!result.success || !result.data?.user) {
        throw new Error('Invalid response from server');
      }

      const updatedUser = result.data.user;
      
      // Update storage
      this.saveUserToStorage(updatedUser);
      
      return updatedUser;
    } catch (error) {
      console.error('API update profile failed:', error);
      
      // Fallback to demo mode
      const userIndex = this.users.findIndex(u => u.id === userId);
      if (userIndex === -1) {
        throw new Error("User not found");
      }

      // Update user data
      this.users[userIndex] = { ...this.users[userIndex], ...updates };
      
      // Update storage if this is the current user
      const currentUser = this.getCurrentUser();
      if (currentUser && currentUser.id === userId) {
        this.saveUserToStorage(this.users[userIndex]);
      }

      return this.users[userIndex];
    }
  }

  // Change password
  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      // Call real API
      const response = await fetch(`${API_BASE_URL}/users/${userId}/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || 'Failed to change password');
      }

      if (!result.success) {
        throw new Error(result.error || 'Failed to change password');
      }

      // Success - password changed in database
    } catch (error) {
      console.error('API change password failed:', error);
      
      // Fallback to demo mode validation
      const user = this.users.find(u => u.id === userId);
      if (!user) {
        throw new Error("User not found");
      }

      // In a real app, you would verify the current password
      if (currentPassword.length < 3) {
        throw new Error("Current password is incorrect");
      }

      const passwordValidation = this.validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors.join(", "));
      }

      // If we're in demo mode and validations pass, just succeed
      if (error instanceof Error && error.message.includes('fetch')) {
        // Network error, but validations passed - allow in demo mode
        return;
      }
      
      // Re-throw if it's an API error
      throw error;
    }
  }

  // Reset password
  static async resetPassword(email: string): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const user = this.users.find(u => u.email === email);
    if (!user) {
      throw new Error("No account found with this email address");
    }

    // In a real app, you would send a reset email
    // For demo purposes, we'll just simulate success
  }

  // Private helper method to save user to storage
  private static saveUserToStorage(user: User): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
  }

  // Get all users (admin only)
  static async getAllUsers(): Promise<User[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));
    return [...this.users];
  }

  // Delete user account
  static async deleteAccount(userId: string): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error("User not found");
    }

    // Remove user from users array
    this.users.splice(userIndex, 1);

    // Clear storage if this is the current user
    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }
}