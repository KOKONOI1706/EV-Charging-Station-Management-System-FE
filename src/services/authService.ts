import { User, MOCK_USERS } from "../data/mockDatabase";

// Get API URL from environment or default
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';
console.log('API_BASE_URL:', API_BASE_URL);

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

export interface AuthUser {
  // Keep a superset that is compatible with the in-repo `User` shape
  id: string;
  user_id?: number; // some backend responses use numeric user_id
  name: string;
  email: string;
  phone?: string | null;
  memberSince?: string;
  totalSessions?: number;
  totalSpent?: number;
  favoriteStations?: string[];
  role: 'customer' | 'staff' | 'admin';
  vehicleInfo?: {
    make: string;
    model: string;
    year: number;
    batteryCapacity: number;
  };
  token?: string;
}

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

      // Transform API response to match frontend User/AuthUser interface
      const apiUser = result.data.user;
      // Map role_id to role string
      const roleMap: { [key: number]: "customer" | "staff" | "admin" } = {
        1: "customer",
        2: "staff",
        3: "admin"
      };

      const user: AuthUser = {
        id: String(apiUser.id ?? apiUser.user_id ?? apiUser.userId ?? apiUser.uuid ?? ''),
        user_id: apiUser.user_id ? Number(apiUser.user_id) : undefined,
        name: apiUser.name,
        email: apiUser.email,
        phone: apiUser.phone || null,
        memberSince: apiUser.created_at || new Date().toISOString(),
        totalSessions: apiUser.totalSessions || 0,
        totalSpent: apiUser.totalSpent || 0,
        favoriteStations: apiUser.favoriteStations || [],
        role: roleMap[apiUser.role_id] || "customer",
        token: result.data.token,
        vehicleInfo: apiUser.vehicleInfo || {
          make: "N/A",
          model: "N/A",
          year: 2020,
          batteryCapacity: 50
        }
      };

      this.saveUserToStorage(user);
      return user as any;
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
          // Ensure stored user contains both id and user_id when possible
          const storedUser: AuthUser = {
            id: user.id,
            user_id: parseInt(String(user.id).replace(/\D/g, '')) || undefined,
            name: user.name,
            email: user.email,
            phone: user.phone,
            memberSince: user.memberSince,
            totalSessions: user.totalSessions,
            totalSpent: user.totalSpent,
            favoriteStations: user.favoriteStations,
            role: user.role,
            vehicleInfo: user.vehicleInfo
          };
          this.saveUserToStorage(storedUser as any);
          return storedUser as any;
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

      // Transform API response to match frontend User/AuthUser interface
      const apiUser = result.data.user;
      const role = this.mapRoleIdToRole(apiUser.role_id);

      const authUser: AuthUser = {
        id: String(apiUser.id ?? apiUser.user_id ?? ''),
        user_id: apiUser.user_id ? Number(apiUser.user_id) : undefined,
        name: apiUser.name,
        email: apiUser.email,
        phone: apiUser.phone || '',
        memberSince: apiUser.created_at || new Date().toISOString(),
        totalSessions: 0,
        totalSpent: 0,
        favoriteStations: [],
        role,
        vehicleInfo: data.vehicleInfo
      };

      // Add to local users array for demo compatibility (use minimal User shape)
      const localUser: User = {
        id: authUser.id,
        name: authUser.name,
        email: authUser.email,
        phone: authUser.phone || '',
        memberSince: authUser.memberSince || new Date().toISOString(),
        totalSessions: authUser.totalSessions || 0,
        totalSpent: authUser.totalSpent || 0,
        favoriteStations: authUser.favoriteStations || [],
        role: authUser.role,
        vehicleInfo: authUser.vehicleInfo || { make: '', model: '', year: new Date().getFullYear(), batteryCapacity: 0 }
      };

      this.users.push(localUser);
      this.saveUserToStorage(authUser as any);

      return localUser;
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

    // Ensure stored object includes both id and user_id
    const storedUser: AuthUser = {
      id: user.id,
      user_id: parseInt(String(user.id).replace(/\D/g, '')) || undefined,
      name: user.name,
      email: user.email,
      phone: user.phone,
      memberSince: user.memberSince,
      totalSessions: user.totalSessions,
      totalSpent: user.totalSpent,
      favoriteStations: user.favoriteStations,
      role: user.role,
      vehicleInfo: user.vehicleInfo
    };

    this.saveUserToStorage(storedUser as any);
    return user;
  }

  // Logout
  static async logout(): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // Get current user from storage
  static getCurrentUser(): AuthUser | null {
    try {
      const userData = localStorage.getItem(this.STORAGE_KEY);
      if (userData) {
        const parsed = JSON.parse(userData) as any;
        // Ensure compatibility: provide both id (string) and user_id (number) when possible
        if (parsed) {
          if (!parsed.id && parsed.user_id) parsed.id = String(parsed.user_id);
          if (!parsed.user_id && parsed.id) {
            const digits = String(parsed.id).replace(/\D/g, '');
            parsed.user_id = digits ? Number(digits) : undefined;
          }
        }
        return parsed as AuthUser;
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
  static async updateProfile(user_id: number, updates: Partial<User>): Promise<User> {
    try {
      // Log the update request
      console.log('[AuthService] Starting profile update:', {
        user_id,
        updates,
        apiUrl: API_BASE_URL
      });

      // Get current user token
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        throw new Error('No user found in storage');
      }

      console.log('[AuthService] Current user:', currentUser);
      
      // Call backend API
      const response = await fetch(`${API_BASE_URL}/users/${user_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`,
        },
        body: JSON.stringify({
          name: updates.name,
          email: updates.email,
          phone: updates.phone,
          // backend may accept is_active but our User type doesn't include it — forward if present
          ...(updates as any).is_active !== undefined ? { is_active: (updates as any).is_active } : {},
          updated_at: new Date().toISOString()
        }),
      });

      // Log complete response details for debugging
      console.log('[AuthService] Update profile response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      // Get response text first for debugging
      const responseText = await response.text();
      console.log('[AuthService] Response text:', responseText);

      // Parse response text as JSON
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.error('[AuthService] Failed to parse response JSON:', e);
        throw new Error('Invalid JSON response from server');
      }

      if (!response.ok) {
        console.error('[AuthService] Update failed:', responseData);
        throw new Error(responseData.error || responseData.message || `Update failed: ${response.status} ${response.statusText}`);
      }

      if (!responseData.success || !responseData.data?.user) {
        throw new Error('Invalid response format from server');
      }

      console.log('[AuthService] Update success:', responseData);

        // Transform API response to frontend AuthUser/User interface format
        const apiUser = responseData.data.user;
        const role = this.mapRoleIdToRole(apiUser.role_id);
        const updatedAuthUser: AuthUser = {
          id: String(apiUser.id ?? apiUser.user_id ?? currentUser.id),
          user_id: apiUser.user_id ? Number(apiUser.user_id) : currentUser.user_id,
          name: apiUser.name,
          email: apiUser.email,
          phone: apiUser.phone || null,
          memberSince: apiUser.created_at || currentUser.memberSince,
          totalSessions: apiUser.totalSessions || currentUser.totalSessions || 0,
          totalSpent: apiUser.totalSpent || currentUser.totalSpent || 0,
          favoriteStations: apiUser.favoriteStations || currentUser.favoriteStations || [],
          role,
          vehicleInfo: apiUser.vehicleInfo || currentUser.vehicleInfo,
          token: currentUser.token
        };

        // Persist updated user
        this.saveUserToStorage(updatedAuthUser as any);

        // Update users array if in demo mode - match by numeric id or string id
        const userIndex = this.users.findIndex(u => {
          const numeric = parseInt(String(u.id).replace(/\D/g, '')) || undefined;
          return (numeric && numeric === Number(user_id)) || (u as any).user_id === user_id || u.id === String(apiUser.user_id) || u.id === String(apiUser.id);
        });
        if (userIndex !== -1) {
          // map to local User shape
          const localUpdated: User = {
            id: updatedAuthUser.id,
            name: updatedAuthUser.name,
            email: updatedAuthUser.email,
            phone: updatedAuthUser.phone || '',
            memberSince: updatedAuthUser.memberSince || new Date().toISOString(),
            totalSessions: updatedAuthUser.totalSessions || 0,
            totalSpent: updatedAuthUser.totalSpent || 0,
            favoriteStations: updatedAuthUser.favoriteStations || [],
            role: updatedAuthUser.role,
            vehicleInfo: updatedAuthUser.vehicleInfo || { make: '', model: '', year: new Date().getFullYear(), batteryCapacity: 0 }
          };
          this.users[userIndex] = localUpdated;
        }

        return updatedAuthUser as any;
    } catch (error) {
      console.error('[AuthService] Update profile failed:', error);
      
      // Check if we should fall back to demo mode
      if (error instanceof Error && error.message.includes('fetch')) {
        console.warn('[AuthService] Network error, falling back to demo mode');
        
        // Fallback to demo mode
        const userIndex = this.users.findIndex(u => {
          const numeric = parseInt(String(u.id).replace(/\D/g, '')) || undefined;
          return (numeric && numeric === Number(user_id)) || (u as any).user_id === user_id;
        });
        if (userIndex === -1) {
          throw new Error("User not found");
        }

        // Update user data in demo mode
        const updatedDemoUser: User = {
          ...this.users[userIndex],
          name: updates.name || this.users[userIndex].name,
          email: updates.email || this.users[userIndex].email,
          phone: updates.phone || this.users[userIndex].phone,
          id: this.users[userIndex].id
        };
        this.users[userIndex] = updatedDemoUser;
        
        // Update storage if this is the current user
        const currentUser = this.getCurrentUser();
        if (currentUser && currentUser.user_id === user_id) {
          // save an AuthUser-like version for storage
          const authSaved: AuthUser = {
            id: updatedDemoUser.id,
            user_id: parseInt(String(updatedDemoUser.id).replace(/\D/g, '')) || user_id,
            name: updatedDemoUser.name,
            email: updatedDemoUser.email,
            phone: updatedDemoUser.phone,
            memberSince: updatedDemoUser.memberSince,
            totalSessions: updatedDemoUser.totalSessions,
            totalSpent: updatedDemoUser.totalSpent,
            favoriteStations: updatedDemoUser.favoriteStations,
            role: updatedDemoUser.role,
            vehicleInfo: updatedDemoUser.vehicleInfo
          };
          this.saveUserToStorage(authSaved as any);
        }

        return updatedDemoUser;
      }
      
      // Re-throw the error if it's not a network error
      throw error;
    }
  }

  // Change password
  static async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void> {
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
      const user = this.users.find(u => {
        const numeric = parseInt(String(u.id).replace(/\D/g, '')) || undefined;
        return (numeric && numeric === Number(userId)) || (u as any).user_id === userId;
      });
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
  private static saveUserToStorage(user: AuthUser | User | any): void {
    // Ensure both id (string) and user_id (number) exist when possible so older code paths keep working
    const stored: any = { ...user };
    if (!stored.id && stored.user_id) stored.id = String(stored.user_id);
    if (!stored.user_id && stored.id) {
      const digits = String(stored.id).replace(/\D/g, '');
      if (digits) stored.user_id = Number(digits);
    }
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stored));
  }

  private static mapRoleIdToRole(roleId: number): "customer" | "staff" | "admin" {
    switch (roleId) {
      case 1:
        return "customer";
      case 2:
        return "staff";
      case 3:
        return "admin";
      default:
        return "customer";
    }
  }

  // Get all users (admin only)
  static async getAllUsers(): Promise<User[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));
    return [...this.users];
  }

  // Delete user account
  static async deleteAccount(user_id: number): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const userIndex = this.users.findIndex(u => {
      const numeric = parseInt(String(u.id).replace(/\D/g, '')) || undefined;
      return (numeric && numeric === Number(user_id)) || (u as any).user_id === user_id;
    });
    if (userIndex === -1) {
      throw new Error("User not found");
    }

    // Remove user from users array
    this.users.splice(userIndex, 1);

    // Clear storage if this is the current user
    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.user_id === user_id) {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  // Admin API methods
  static async getAdminDashboard(): Promise<AdminDashboardData> {
    const currentUser = this.getCurrentUser();
    if (!currentUser?.token) {
      throw new Error('No authentication token');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          this.logout();
          throw new Error('Unauthorized access');
        }
        throw new Error(result.message || 'Failed to fetch admin dashboard');
      }

      return result.data;
    } catch (error) {
      console.error('Admin dashboard fetch error:', error);
      // Fallback to mock data
      return {
        totalUsers: 150,
        totalStations: 25,
        totalBookings: 1250,
        adminInfo: {
          id: currentUser.id,
          email: currentUser.email,
          role: currentUser.role,
          full_name: currentUser.name
        }
      };
    }
  }

  static async getAdminUsers(): Promise<AdminUser[]> {
    const currentUser = this.getCurrentUser();
    if (!currentUser?.token) {
      throw new Error('No authentication token');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          this.logout();
          throw new Error('Unauthorized access');
        }
        throw new Error(result.message || 'Failed to fetch users');
      }

      return result.data;
    } catch (error) {
      console.error('Admin users fetch error:', error);
      // Fallback to mock data
      return this.users.map(user => ({
        id: user.id,
        email: user.email,
        full_name: user.name,
        // normalize legacy 'user' -> 'customer'
        role: ((user.role as any) === 'user' ? 'customer' : (user.role as 'admin' | 'staff' | 'customer')),
        created_at: new Date().toISOString()
      }));
    }
  }

  static async updateUserRole(userId: string, role: 'admin' | 'staff' | 'customer'): Promise<AdminUser> {
    const currentUser = this.getCurrentUser();
    if (!currentUser?.token) {
      throw new Error('No authentication token');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`,
        },
        body: JSON.stringify({ role }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          this.logout();
          throw new Error('Unauthorized access');
        }
        throw new Error(result.message || 'Failed to update user role');
      }

      return result.data;
    } catch (error) {
      console.error('Update user role error:', error);
      // Fallback: update local mock data
      const userIndex = this.users.findIndex(u => u.id === userId);
      if (userIndex !== -1) {
        this.users[userIndex] = { ...this.users[userIndex], role: role as any };
        return {
          id: userId,
          email: this.users[userIndex].email,
          full_name: this.users[userIndex].name,
          role,
          created_at: new Date().toISOString()
        };
      }
      throw error;
    }
  }

  // Check if current user has admin role
  static isAdmin(): boolean {
    const currentUser = this.getCurrentUser();
    return currentUser?.role === 'admin';
  }

  // Get auth token for API calls
  static getAuthToken(): string | null {
    const currentUser = this.getCurrentUser();
    return currentUser?.token || null;
  }
}