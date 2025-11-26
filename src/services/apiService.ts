/**
 * ===============================================================
 * API SERVICE (DỊCH VỤ HTTP CLIENT)
 * ===============================================================
 * HTTP client wrapper để gọi RESTful API backend
 * 
 * Mô tả:
 * Singleton service cung cấp các methods HTTP (GET, POST, PUT, DELETE) với:
 * - Tự động thêm base URL
 * - Tự động parse JSON response
 * - Tự động thêm headers (Content-Type)
 * - Centralized error handling
 * 
 * Chức năng chính:
 * - 🌐 get<T>(endpoint): GET request
 * - 📤 post<T>(endpoint, data): POST request
 * - ✏️ put<T>(endpoint, data): PUT request
 * - 🗑️ delete<T>(endpoint): DELETE request
 * - ❤️ healthCheck(): Kiểm tra backend health
 * 
 * Configuration:
 * - Base URL: VITE_API_URL environment variable hoặc http://localhost:5000/api
 * - Headers: { 'Content-Type': 'application/json' }
 * - Response format: JSON
 * 
 * Generic Types Exported:
 * - ApiResponse<T>: { success, data, message?, error? }
 * - Station: Trạm sạc interface
 * - ChargingPoint: Điểm sạc interface
 * - User: User interface
 * - Booking: Booking interface
 * 
 * Error Handling:
 * - Throw Error nếu HTTP status không OK (!response.ok)
 * - Log error ra console
 * - Caller phải catch error
 * 
 * Usage:
 * ```typescript
 * import { apiService } from './apiService';
 * 
 * const response = await apiService.get<ApiResponse<Station[]>>('/stations');
 * if (response.success) {
 *   const stations = response.data;
 * }
 * ```
 * 
 * Dependencies:
 * - Vite environment variables (import.meta.env)
 * - Fetch API (browser native)
 */

// API configuration and utilities
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
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
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