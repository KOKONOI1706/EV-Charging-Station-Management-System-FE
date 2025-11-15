import { User, MOCK_USERS } from "../data/mockDatabase";

// Get API URL from environment or default
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  vehicleInfo: {
    make: string;
    model: string;
    year: number;
    batteryCapacity: number;
  };
}

// Admin dashboard / user management types
export interface AdminDashboardData {
  totalUsers: number;
  totalStations: number;
  totalBookings: number;
  adminInfo: {
    id: string;
    email: string;
    role: string;
    full_name: string;
  };
}

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'staff' | 'customer';
  created_at: string;
}

export class AuthService {
  private static readonly STORAGE_KEY = "chargetech_user";
  private static readonly TOKEN_KEY = "chargetech_token";
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
      // Save token if provided by API (check multiple possible shapes)
      const token = result.token || result.access_token || result.authToken || result.data?.token || result.data?.access_token || result.data?.authToken;
      if (token) {
        localStorage.setItem(this.TOKEN_KEY, token);
      }
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
    // clear any token in demo quick login
    localStorage.removeItem(this.TOKEN_KEY);
    return user;
  }

  // Logout
  static async logout(): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
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

  // Get stored auth token (if any)
  static getAuthToken(): string | null {
    try {
      return localStorage.getItem(this.TOKEN_KEY);
    } catch (error) {
      return null;
    }
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

  // Admin: get dashboard data
  static async getAdminDashboard(): Promise<AdminDashboardData> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to fetch admin dashboard');
      return result.data as AdminDashboardData;
    } catch (error) {
      console.warn('Failed to fetch admin dashboard, returning mock data', error);
      // Fallback mock
      const admin = this.users.find(u => u.role === 'admin') || this.users[0];
      return {
        totalUsers: this.users.length,
        totalStations: 0,
        totalBookings: 0,
        adminInfo: {
          id: admin.id,
          email: admin.email,
          role: admin.role,
          full_name: admin.name,
        }
      };
    }
  }

  // Admin: fetch users list
  static async getAdminUsers(): Promise<AdminUser[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to fetch admin users');
      return result.data as AdminUser[];
    } catch (error) {
      console.warn('Failed to fetch admin users, falling back to local mock', error);
      return this.users.map(u => ({
        id: u.id,
        email: u.email,
        full_name: u.name,
        role: u.role as 'admin'|'staff'|'customer',
        created_at: u.memberSince || new Date().toISOString(),
      }));
    }
  }

  // Admin: update user role
  static async updateUserRole(userId: string, role: 'admin' | 'staff' | 'customer'): Promise<AdminUser> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to update role');
      return result.data as AdminUser;
    } catch (error) {
      console.warn('Failed to update role on server, updating mock local user', error);
      const idx = this.users.findIndex(u => u.id === userId);
      if (idx !== -1) {
        this.users[idx] = { ...this.users[idx], role } as User;
        return {
          id: this.users[idx].id,
          email: this.users[idx].email,
          full_name: this.users[idx].name,
          role: this.users[idx].role as 'admin'|'staff'|'customer',
          created_at: this.users[idx].memberSince || new Date().toISOString(),
        };
      }
      throw error;
    }
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