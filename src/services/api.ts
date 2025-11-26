/**
 * ===============================================================
 * API SERVICE - LEGACY VERSION (PHIÊN BẢN CŨ)
 * ===============================================================
 * ⚠️ WARNING: File này có vẻ là legacy code (dùng REACT_APP_ thay vì VITE_)
 * 
 * Mô tả:
 * HTTP client service để gọi backend API với các methods:
 * - Authentication (login, register)
 * - Stations CRUD
 * - Bookings CRUD
 * - KV Store operations
 * - Health check
 * 
 * Chức năng:
 * - 🔐 login(email, password): Đăng nhập
 * - 📝 register(userData): Đăng ký tài khoản
 * - 🏢 getStations(): Lấy danh sách trạm
 * - 📍 getStation(id): Lấy chi tiết trạm
 * - ➕ createStation(data): Tạo trạm mới
 * - 📅 getBookings(userId?): Lấy bookings
 * - ➕ createBooking(data): Tạo booking mới
 * - ✏️ updateBooking(id, updates): Cập nhật booking
 * - ❌ cancelBooking(id): Hủy booking
 * - 💾 kvGet/kvSet/kvDelete: KV storage operations
 * - ❤️ healthCheck(): Kiểm tra backend
 * 
 * Note:
 * - Dùng process.env.REACT_APP_API_URL (Create React App style)
 * - Project hiện tại dùng Vite (import.meta.env.VITE_API_URL)
 * - Có thể cần migrate sang apiService.ts
 * 
 * TODO:
 * - [ ] Kiểm tra xem file này còn được dùng không
 * - [ ] Nếu không dùng → Xóa
 * - [ ] Nếu còn dùng → Migrate sang Vite env
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * API Service for communicating with backend
 */
class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Generic request method
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
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
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Auth methods
  async login(email: string, password: string) {
    return this.request('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: { name: string; email: string; password: string; role?: string }) {
    return this.request('/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Station methods
  async getStations() {
    return this.request('/stations');
  }

  async getStation(id: string) {
    return this.request(`/stations/${id}`);
  }

  async createStation(stationData: any) {
    return this.request('/stations', {
      method: 'POST',
      body: JSON.stringify(stationData),
    });
  }

  // Booking methods
  async getBookings(userId?: string) {
    const query = userId ? `?userId=${userId}` : '';
    return this.request(`/bookings${query}`);
  }

  async createBooking(bookingData: any) {
    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async updateBooking(id: string, updates: any) {
    return this.request(`/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async cancelBooking(id: string) {
    return this.request(`/bookings/${id}`, {
      method: 'DELETE',
    });
  }

  // KV Store methods
  async kvGet(key: string) {
    return this.request(`/kv/${key}`);
  }

  async kvSet(key: string, value: any) {
    return this.request('/kv', {
      method: 'POST',
      body: JSON.stringify({ key, value }),
    });
  }

  async kvDelete(key: string) {
    return this.request(`/kv/${key}`, {
      method: 'DELETE',
    });
  }

  async kvSearchByPrefix(prefix: string) {
    return this.request(`/kv/search/${prefix}`);
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export const apiService = new ApiService();
export default apiService;