/**
 * ===============================================================
 * ADMIN STATISTICS API (FRONTEND)
 * ===============================================================
 * API client lấy thống kê toàn hệ thống cho Admin Dashboard
 * 
 * Chức năng:
 * - 📊 Lấy tất cả stats trong 1 API call (getDashboardStats)
 * - 💰 Revenue statistics (today, week, month, YTD)
 * - 🏆 Top performing stations
 * - ⚠️ System alerts (warnings, errors)
 * - 📝 Recent activities log
 * - 👥 Total users count
 * - 📍 Total stations count
 * - ⚡ Total sessions count
 * 
 * Interfaces:
 * 
 * 1. RevenueStats:
 *    - today: Doanh thu hôm nay (VND)
 *    - thisWeek: Doanh thu tuần này
 *    - thisMonth: Doanh thu tháng này
 *    - yearToDate: Doanh thu từ đầu năm
 * 
 * 2. TopStation:
 *    - id, name, location: Thông tin trạm
 *    - revenue: Doanh thu
 *    - period: Thời gian ("This Month", "This Week")
 * 
 * 3. SystemAlert:
 *    - type: 'warning' | 'info' | 'error'
 *    - title: Tiêu đề alert
 *    - message: Nội dung
 *    - timestamp: Thời gian
 * 
 * 4. RecentActivity:
 *    - user: Tên user (hoặc userName)
 *    - action: Hành động ("Completed session", "Created station")
 *    - timestamp: Thời gian
 *    - type: 'success' | 'info' | 'warning'
 * 
 * 5. AdminDashboardStats:
 *    - revenue: RevenueStats
 *    - topStations: TopStation[]
 *    - systemAlerts: SystemAlert[]
 *    - recentActivities: RecentActivity[]
 *    - totalUsers, totalStations, totalSessions: Counters
 * 
 * Methods:
 * 
 * 1. getDashboardStats()
 *    - GET /api/admin/stats
 *    - Return tất cả stats trong 1 response
 *    - Cache-friendly
 * 
 * 2. getRevenueStats()
 *    - GET /api/admin/revenue
 *    - Chỉ lấy revenue data
 * 
 * 3. getTopStations(limit = 4)
 *    - GET /api/admin/top-stations?limit={limit}
 *    - Top stations theo revenue
 * 
 * Data transformation:
 * - Backend có thể trả userName hoặc user
 * - Frontend normalize thành user field
 * 
 * Dependencies:
 * - Backend API: /api/admin/stats, /admin/revenue, /admin/top-stations
 * - env: VITE_API_URL
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface RevenueStats {
  today: number;
  thisWeek: number;
  thisMonth: number;
  yearToDate: number;
}

export interface TopStation {
  id: string;
  name: string;
  location: string;
  revenue: number;
  period: string;
}

export interface SystemAlert {
  id: string;
  type: 'warning' | 'info' | 'error';
  title: string;
  message: string;
  timestamp: string;
}

export interface RecentActivity {
  id: string;
  user: string; // Changed from userName to match backend
  userId?: string;
  userName?: string; // Keep for backward compatibility
  userAvatar?: string;
  action: string;
  timestamp: string;
  type?: 'success' | 'info' | 'warning';
}

export interface AdminDashboardStats {
  revenue: RevenueStats;
  topStations: TopStation[];
  systemAlerts: SystemAlert[];
  recentActivities: RecentActivity[];
  totalUsers: number;
  totalStations: number;
  totalSessions: number;
}

class AdminStatsApi {
  async getDashboardStats(): Promise<AdminDashboardStats> {
    try {
      const url = `${API_BASE_URL}/admin/stats`;
      console.log('📊 Fetching admin dashboard stats from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch admin stats: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Admin stats fetched:', data);

      return data;
    } catch (error) {
      console.error('❌ Error fetching admin stats:', error);
      throw error;
    }
  }

  async getRevenueStats(): Promise<RevenueStats> {
    try {
      const url = `${API_BASE_URL}/admin/revenue`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch revenue stats: ${response.status}`);
      }

      const data = await response.json();
      return data.revenue;
    } catch (error) {
      console.error('❌ Error fetching revenue stats:', error);
      throw error;
    }
  }

  async getTopStations(limit: number = 4): Promise<TopStation[]> {
    try {
      const url = `${API_BASE_URL}/admin/top-stations?limit=${limit}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch top stations: ${response.status}`);
      }

      const data = await response.json();
      return data.stations;
    } catch (error) {
      console.error('❌ Error fetching top stations:', error);
      throw error;
    }
  }

  async getSystemAlerts(): Promise<SystemAlert[]> {
    try {
      const url = `${API_BASE_URL}/admin/alerts`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch system alerts: ${response.status}`);
      }

      const data = await response.json();
      return data.alerts;
    } catch (error) {
      console.error('❌ Error fetching system alerts:', error);
      throw error;
    }
  }

  async getRecentActivities(limit: number = 10): Promise<RecentActivity[]> {
    try {
      const url = `${API_BASE_URL}/admin/recent-activities?limit=${limit}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch recent activities: ${response.status}`);
      }

      const data = await response.json();
      return data.activities;
    } catch (error) {
      console.error('❌ Error fetching recent activities:', error);
      throw error;
    }
  }
}

export const adminStatsApi = new AdminStatsApi();
