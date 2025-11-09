// API configuration and utilities
import { AuthService } from './authService';
import { toast } from 'sonner';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

  // Attach Authorization header if token exists (support multiple AuthService shapes)
  const currentAuthUser: any = (AuthService as any).getCurrentUser ? (AuthService as any).getCurrentUser() : null;
  const token = currentAuthUser?.token || currentAuthUser?.accessToken || null;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      // Handle auth errors globally
      if (response.status === 401) {
        // Unauthorized - clear session and force login
        try {
          await AuthService.logout();
        } catch (e) {
          console.warn('Failed to logout on 401:', e);
        }
        toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
        // Navigate to auth page
        window.location.href = '/auth';
        throw new Error('Unauthorized');
      }

      if (response.status === 403) {
        // Forbidden - show access denied
        toast.error('Bạn không có quyền truy cập tài nguyên này.');
        const body = await response.text();
        const message = body || 'Forbidden';
        const err: any = new Error(message);
        err.status = 403;
        throw err;
      }

      if (!response.ok) {
        const txt = await response.text();
        let parsed: any = null;
        try {
          parsed = JSON.parse(txt);
        } catch (e) {
          // not json
        }
        const msg = parsed?.message || parsed?.error || txt || `HTTP error ${response.status}`;
        throw new Error(msg);
      }

      // Parse JSON safely
      const text = await response.text();
      try {
        return JSON.parse(text) as T;
      } catch (e) {
        // If response is empty or not JSON, return as any
        return (text as unknown) as T;
      }
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // GET request
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST request
  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Health check
  async healthCheck() {
    return this.get('/health');
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Types for API responses
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface Station {
  station_id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  total_points: number;
  available_points: number;
  phone?: string;
  email?: string;
  opening_hours?: string;
  amenities?: string[];
  created_at: string;
  updated_at: string;
}

export interface ChargingPoint {
  point_id: number;
  station_id: number;
  name: string;
  status: 'Available' | 'Occupied' | 'Maintenance' | 'Out of Order';
  connector_type_id: number;
  power_kw: number;
  current_price: number;
  created_at: string;
  updated_at: string;
}

export interface User {
  user_id: number;
  name: string;
  email: string;
  phone?: string;
  role_id: number;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  booking_id: number;
  user_id: number;
  station_id: number;
  point_id: number;
  start_time: string;
  end_time: string;
  status: 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled';
  total_cost?: number;
  created_at: string;
  updated_at: string;
}