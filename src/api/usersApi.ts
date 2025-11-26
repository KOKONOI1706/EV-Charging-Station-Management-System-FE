/**
 * ===============================================================
 * USERS API SERVICE (FRONTEND)
 * ===============================================================
 * API client quản lý users (CRUD operations)
 * 
 * Chức năng:
 * - 📋 GET /api/users - Lấy danh sách users (pagination, search, filter)
 * - 🔍 GET /api/users/:id - Lấy chi tiết 1 user
 * - ➕ POST /api/users - Tạo user mới
 * - ✏️ PUT /api/users/:id - Cập nhật user
 * - 🗑️ DELETE /api/users/:id - Xóa user
 * 
 * User Interface:
 * - id: User ID (string)
 * - name: Tên user
 * - email: Email (unique)
 * - phone: Số điện thoại
 * - role: 'customer' | 'staff' | 'admin'
 * - memberSince: Ngày đăng ký
 * - totalSessions: Tổng số sessions
 * - totalSpent: Tổng chi tiêu
 * - status: 'active' | 'inactive' | 'suspended'
 * - favoriteStations: Danh sách station yêu thích
 * - vehicleInfo: Thông tin xe (make, model, year, battery)
 * 
 * Query params (GET /users):
 * - page: Trang hiện tại (pagination)
 * - limit: Số users mỗi trang (default 10)
 * - role: Filter theo role
 * - search: Tìm kiếm theo name/email
 * 
 * Response:
 * - users: Array of User objects
 * - total: Tổng số users
 * - page: Current page number
 * - limit: Items per page
 * 
 * Data transformation:
 * - Backend trả user_id → Frontend transform thành id
 * - Backend trả username → Frontend transform thành name
 * - Normalize status: 'Active' → 'active'
 * - Default values cho missing fields
 * 
 * Dependencies:
 * - Backend API: /api/users endpoints
 * - env: VITE_API_URL
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'staff' | 'admin';
  memberSince: string;
  totalSessions?: number;
  totalSpent?: number;
  status?: 'active' | 'inactive' | 'suspended' | 'Active' | 'Inactive';
  favoriteStations?: string[];
  vehicleInfo?: {
    make: string;
    model: string;
    year: number;
    batteryCapacity: number;
  };
}

export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

class UsersApi {
  /**
   * Get all users with pagination and filters
   */
  async getUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
  }): Promise<UserListResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.role) queryParams.append('role', params.role);
      if (params?.search) queryParams.append('search', params.search);

      const url = `${API_BASE_URL}/users?${queryParams.toString()}`;
      console.log('📡 Fetching users from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Users fetched:', data);

      // Transform data to match our interface
      const users: User[] = data.users.map((user: any) => ({
        id: user.user_id?.toString() || user.id?.toString(),
        name: user.name || user.username || 'Unknown',
        email: user.email,
        phone: user.phone || '',
        role: user.role || 'customer',
        memberSince: user.created_at || user.memberSince || new Date().toISOString(),
        totalSessions: user.totalSessions || 0,
        totalSpent: user.totalSpent || 0,
        status: user.status || 'Active',
        favoriteStations: user.favoriteStations || [],
        vehicleInfo: user.vehicleInfo || {
          make: 'N/A',
          model: 'N/A',
          year: 2020,
          batteryCapacity: 50,
        },
      }));

      return {
        users,
        total: data.total || users.length,
        page: data.page || 1,
        limit: data.limit || 10,
      };
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        id: data.user_id?.toString() || data.id?.toString(),
        name: data.name || data.username,
        email: data.email,
        phone: data.phone || 'N/A',
        role: data.role || 'customer',
        memberSince: data.created_at || data.memberSince,
        totalSessions: data.totalSessions || 0,
        totalSpent: data.totalSpent || 0,
        status: data.status || 'active',
      };
    } catch (error) {
      console.error('❌ Error fetching user:', error);
      throw error;
    }
  }

  /**
   * Update user information
   */
  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`Failed to update user: ${response.status}`);
      }

      await response.json();
      return this.getUserById(userId);
    } catch (error) {
      console.error('❌ Error updating user:', error);
      throw error;
    }
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete user: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      throw error;
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId: string): Promise<{
    totalSessions: number;
    totalSpent: number;
    totalEnergyConsumed: number;
    averageRating: number;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user stats: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Error fetching user stats:', error);
      throw error;
    }
  }
}

export const usersApi = new UsersApi();
