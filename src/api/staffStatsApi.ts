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
 */
export async function getStaffMetrics(stationId?: string): Promise<StaffMetrics> {
  try {
    const response = await fetch(`${API_URL}/staff-stats/metrics?stationId=${stationId || 'all'}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch staff metrics: ${response.statusText}`);
    }
    
    const data = await response.json();
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
 */
export async function getStaffAnalytics(stationId?: string): Promise<StaffAnalytics> {
  try {
    const response = await fetch(`${API_URL}/staff-stats/analytics?stationId=${stationId || 'all'}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch staff analytics: ${response.statusText}`);
    }
    
    const data = await response.json();
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
