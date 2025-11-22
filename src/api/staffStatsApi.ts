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
