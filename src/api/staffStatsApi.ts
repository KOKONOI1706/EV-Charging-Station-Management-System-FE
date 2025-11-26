                                                                                                                                                            /**
 * ===============================================================
 * STAFF STATISTICS API (FRONTEND)
 * ===============================================================
 * API client lấy thống kê cho Staff Dashboard
 * 
 * Chức năng:
 * - 📊 Lấy metrics của station (sessions, revenue, utilization)
 * - 📈 Lấy analytics data cho charts (daily, hourly, weekly)
 * - 📍 Filter theo station ID (hoặc 'all' cho tất cả stations của staff)
 * - 📅 Filter theo date range (startDate, endDate)
 * 
 * Interfaces:
 * 
 * 1. StaffMetrics:
 *    - todaysSessions: Số sessions hôm nay
 *    - todaysRevenue: Doanh thu hôm nay (VND)
 *    - currentUtilization: Tỉ lệ sử dụng hiện tại (%)
 *    - averageSessionDuration: Thời gian session trung bình (phút)
 *    - customerSatisfaction: Đánh giá khách hàng (1-5 sao)
 *    - maintenanceAlerts: Số cảnh báo bảo trì
 *    - percentageChanges: So sánh với hôm qua (% tăng/giảm)
 * 
 * 2. StaffAnalytics:
 *    - dailyUsage: Sử dụng theo ngày (7-30 ngày gần đây)
 *      * Array<{ date, sessions, revenue }>
 *    - hourlyPattern: Pattern theo giờ trong ngày (0-23h)
 *      * Array<{ hour, sessions, utilization }>
 *    - weeklyTrend: Xu hướng tuần (7 ngày)
 *      * Array<{ day, sessions, revenue }>
 *    - recentSessions: Sessions gần đây nhất
 *      * Array<{ id, customer, duration, amount, status }>
 * 
 * Methods:
 * 
 * 1. getStaffMetrics(stationId?, startDate?, endDate?)
 *    - GET /api/staff-stats/metrics
 *    - stationId: UUID của station hoặc 'all'
 *    - startDate/endDate: YYYY-MM-DD format
 *    - Mặc định: 7 ngày gần đây
 * 
 * 2. getStaffAnalytics(stationId?, startDate?, endDate?)
 *    - GET /api/staff-stats/analytics
 *    - Return data cho charts (daily, hourly, weekly)
 * 
 * Query params:
 * - stationId: Filter theo station (optional, default 'all')
 * - startDate: Ngày bắt đầu YYYY-MM-DD (optional)
 * - endDate: Ngày kết thúc YYYY-MM-DD (optional)
 * 
 * Error handling:
 * - Return default values (0) nếu API call thất bại
 * - Log errors ra console
 * - Không throw exception để không crash UI
 * 
 * Dependencies:
 * - Backend API: /staff-stats/metrics, /staff-stats/analytics
 * - env: VITE_API_URL
 */

/**
 * Staff Statistics API - Using Backend API
 * Backend will handle Supabase queries with service role
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface StaffMetrics {
  todaysSessions: number;
  todaysRevenue: number;
  currentUtilization: number;
  averageSessionDuration: number;
  customerSatisfaction: number;
  maintenanceAlerts: number;
  percentageChanges: {
    sessions: number;
    revenue: number;
  };
}

export interface StaffAnalytics {
  dailyUsage: Array<{
    date: string;
    sessions: number;
    revenue: number;
  }>;
  hourlyPattern: Array<{
    hour: number;
    sessions: number;
    utilization: number;
  }>;
  weeklyTrend: Array<{
    day: string;
    sessions: number;
    revenue: number;
  }>;
  recentSessions: Array<{
    id: string;
    customer: string;
    duration: string;
    amount: number;
    status: string;
  }>;
}

/**
 * Get staff metrics for dashboard
 * @param stationId - Station UUID from stations.id (optional, 'all' for all stations)
 * @param startDate - Start date in YYYY-MM-DD format (optional)
 * @param endDate - End date in YYYY-MM-DD format (optional)
 */
export async function getStaffMetrics(stationId?: string, startDate?: string, endDate?: string): Promise<StaffMetrics> {
  try {
    const params = new URLSearchParams();
    if (stationId) params.append('stationId', stationId);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const url = `${API_URL}/staff-stats/metrics?${params.toString()}`;
    console.log('📡 Fetching metrics from:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('❌ Metrics API error:', response.status, response.statusText);
      throw new Error(`Failed to fetch staff metrics: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ Metrics response:', data);
    return data;
  } catch (error) {
    console.error('Error fetching staff metrics:', error);
    return {
      todaysSessions: 0,
      todaysRevenue: 0,
      currentUtilization: 0,
      averageSessionDuration: 0,
      customerSatisfaction: 0,
      maintenanceAlerts: 0,
      percentageChanges: { sessions: 0, revenue: 0 }
    };
  }
}

/**
 * Get staff analytics data for charts
 * @param stationId - Station UUID from stations.id (optional, 'all' for all stations)
 * @param startDate - Start date in YYYY-MM-DD format (optional)
 * @param endDate - End date in YYYY-MM-DD format (optional)
 */
export async function getStaffAnalytics(stationId?: string, startDate?: string, endDate?: string): Promise<StaffAnalytics> {
  try {
    const params = new URLSearchParams();
    if (stationId) params.append('stationId', stationId);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const url = `${API_URL}/staff-stats/analytics?${params.toString()}`;
    console.log('📡 Fetching analytics from:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('❌ Analytics API error:', response.status, response.statusText);
      throw new Error(`Failed to fetch staff analytics: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ Analytics response:', data);
    return data;
  } catch (error) {
    console.error('Error fetching staff analytics:', error);
    return {
      dailyUsage: [],
      hourlyPattern: Array.from({ length: 24 }, (_, hour) => ({ hour, sessions: 0, utilization: 0 })),
      weeklyTrend: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({ day, sessions: 0, revenue: 0 })),
      recentSessions: []
    };
  }
}

/**
 * Calculate percentage change between two values
 * @param current - Current value
 * @param previous - Previous value
 * @returns Formatted string with + or - sign (e.g., "+15%" or "-5%")
 */
export function calculatePercentageChange(current: number, previous: number): string {
  if (previous === 0) {
    return current > 0 ? '+100%' : '0%';
  }
  
  const change = ((current - previous) / previous) * 100;
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(1)}%`;
}
