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
  userId: string;
  userName: string;
  userAvatar?: string;
  action: string;
  timestamp: string;
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
