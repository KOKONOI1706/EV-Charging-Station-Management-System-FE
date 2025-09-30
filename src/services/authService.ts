import { User, MOCK_USERS } from "../data/mockDatabase";

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
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Demo credentials for different roles
    const demoCredentials = [
      { email: "customer@demo.com", password: "123", role: "customer" },
      { email: "staff@demo.com", password: "123", role: "staff" },
      { email: "admin@demo.com", password: "123", role: "admin" },
    ];

    // Check demo credentials first
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

    // Check registered users
    const user = this.users.find(u => u.email === email);
    if (!user) {
      throw new Error("User not found. Please check your email or sign up.");
    }

    // In a real app, you would verify the password hash
    // For demo purposes, we'll accept any password for existing users
    if (password.length < 3) {
      throw new Error("Invalid password. Please try again.");
    }

    this.saveUserToStorage(user);
    return user;
  }

  // Register new user
  static async register(data: RegisterData): Promise<User> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1200));

    // Check if user already exists
    const existingUser = this.users.find(u => u.email === data.email);
    if (existingUser) {
      throw new Error("An account with this email already exists.");
    }

    // Create new user
    const newUser: User = {
      id: `user_${Date.now()}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      memberSince: new Date().toISOString().split('T')[0],
      totalSessions: 0,
      totalSpent: 0,
      favoriteStations: [],
      role: "customer", // New users are customers by default
      vehicleInfo: data.vehicleInfo
    };

    // Add to users array
    this.users.push(newUser);

    this.saveUserToStorage(newUser);
    return newUser;
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
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

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

  // Change password
  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

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

    // In a real app, you would hash and save the new password
    // For demo purposes, we'll just simulate success
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