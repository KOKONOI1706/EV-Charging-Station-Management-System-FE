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
      // Map role_id to role string
      const roleMap: { [key: number]: "customer" | "staff" | "admin" } = {
        1: "customer",
        2: "staff",
        3: "admin"
      };
      
      const user: User = {
        user_id: Number(apiUser.user_id),
        name: apiUser.name,
        email: apiUser.email,
        phone: apiUser.phone || null,
        role_id: apiUser.role_id,
        created_at: apiUser.created_at,
        updated_at: apiUser.updated_at,
        is_active: true,
        role: roleMap[apiUser.role_id] || "customer",
        token: result.data.token, // Save the token from login response
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
        user_id: Number(apiUser.user_id), // Ensure ID is a number
        name: apiUser.name,
        email: apiUser.email,
        phone: apiUser.phone || '',
        created_at: apiUser.created_at,
        role_id: apiUser.role_id,
        updated_at: apiUser.updated_at,
        is_active: true,
        role: this.mapRoleIdToRole(apiUser.role_id),
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
          is_active: updates.is_active,
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

        // Transform API response to frontend User interface format
      const apiUser = responseData.data.user;
      const updatedUser: User = {
        ...currentUser,
        user_id: Number(apiUser.user_id),
        name: apiUser.name,
        email: apiUser.email,
        phone: apiUser.phone || null,
        role_id: apiUser.role_id,
        created_at: apiUser.created_at,
        updated_at: apiUser.updated_at,
        is_active: apiUser.is_active,
        token: currentUser.token, // Preserve token
        role: this.mapRoleIdToRole(apiUser.role_id)
      };      // Update local storage
      this.saveUserToStorage(updatedUser);
      
      // Update users array if in demo mode
      const userIndex = this.users.findIndex(u => u.user_id === user_id);
      if (userIndex !== -1) {
        this.users[userIndex] = updatedUser;
      }

      return updatedUser;
    } catch (error) {
      console.error('[AuthService] Update profile failed:', error);
      
      // Check if we should fall back to demo mode
      if (error instanceof Error && error.message.includes('fetch')) {
        console.warn('[AuthService] Network error, falling back to demo mode');
        
        // Fallback to demo mode
        const userIndex = this.users.findIndex(u => u.user_id === user_id);
        if (userIndex === -1) {
          throw new Error("User not found");
        }

        // Update user data in demo mode
        const updatedDemoUser: User = {
          ...this.users[userIndex],
          name: updates.name || this.users[userIndex].name,
          email: updates.email || this.users[userIndex].email,
          phone: updates.phone || this.users[userIndex].phone,
          is_active: updates.is_active ?? this.users[userIndex].is_active,
          updated_at: new Date().toISOString(),
          user_id: user_id
        };
        this.users[userIndex] = updatedDemoUser;
        
        // Update storage if this is the current user
        const currentUser = this.getCurrentUser();
        if (currentUser && currentUser.user_id === user_id) {
          this.saveUserToStorage(updatedDemoUser);
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
      const user = this.users.find(u => u.user_id === userId);
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

    const userIndex = this.users.findIndex(u => u.user_id === user_id);
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
}