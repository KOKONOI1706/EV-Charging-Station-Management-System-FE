/**
 * Staff Statistics API - Using Real Supabase Schema
 * 
 * Database Schema (from Supabase):
 * - charging_sessions: session_id (PK), user_id, point_id, start_time, end_time, cost, energy_consumed_kwh, status
 * - users: user_id (PK integer), name, email
 * - charging_points: point_id (PK integer), station_id
 * - stations: id (uuid PK)
 */

import { supabase } from '../lib/supabase';

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
 * Calculate percentage change between two numbers
 */
function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Format currency to 2 decimal places
 */
function formatCurrency(amount: number): number {
  return parseFloat(amount.toFixed(2));
}

/**
 * Get charging point IDs for a specific station (station.id is UUID)
 */
async function getStationPointIds(stationUuid: string): Promise<number[]> {
  const { data: points, error } = await supabase
    .from('charging_points')
    .select('point_id')
    .eq('station_id', stationUuid);
  
  if (error) {
    console.error('Error fetching station points:', error);
    return [];
  }
  
  return points?.map(p => p.point_id) || [];
}

/**
 * Get staff metrics for dashboard
 * @param stationId - Station UUID from stations.id (optional, 'all' for all stations)
 */
export async function getStaffMetrics(stationId?: string): Promise<StaffMetrics> {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    // Get point IDs if stationId provided
    let pointIds: number[] | null = null;
    if (stationId && stationId !== 'all') {
      pointIds = await getStationPointIds(stationId);
      if (pointIds.length === 0) {
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

    // Build queries
    let todayQuery = supabase
      .from('charging_sessions')
      .select('session_id, cost, start_time, end_time, status')
      .gte('start_time', todayStart.toISOString());

    let yesterdayQuery = supabase
      .from('charging_sessions')
      .select('session_id, cost')
      .gte('start_time', yesterdayStart.toISOString())
      .lt('start_time', todayStart.toISOString());

    if (pointIds && pointIds.length > 0) {
      todayQuery = todayQuery.in('point_id', pointIds);
      yesterdayQuery = yesterdayQuery.in('point_id', pointIds);
    }

    const [{ data: todaySessions }, { data: yesterdaySessions }] = await Promise.all([
      todayQuery,
      yesterdayQuery,
    ]);

    // Calculate metrics
    const todaysSessionCount = todaySessions?.length || 0;
    
    const completedToday = todaySessions?.filter(s => 
      s.status === 'completed' && s.cost != null
    ) || [];
    const todaysRevenue = completedToday.reduce((sum, session) => 
      sum + (parseFloat(session.cost?.toString() || '0') || 0), 0
    );

    const yesterdaySessionCount = yesterdaySessions?.length || 0;
    const yesterdayRevenue = yesterdaySessions?.reduce((sum, session) => 
      sum + (parseFloat(session.cost?.toString() || '0') || 0), 0
    ) || 0;

    // Average session duration
    const sessionsWithEndTime = completedToday.filter(s => s.end_time);
    const totalDuration = sessionsWithEndTime.reduce((sum, session) => {
      const start = new Date(session.start_time).getTime();
      const end = new Date(session.end_time!).getTime();
      return sum + (end - start) / (1000 * 60 * 60);
    }, 0);
    const averageSessionDuration = sessionsWithEndTime.length > 0 
      ? totalDuration / sessionsWithEndTime.length 
      : 0;

    // Current utilization
    let pointsQuery = supabase
      .from('charging_points')
      .select('point_id', { count: 'exact', head: true });
    
    if (pointIds && pointIds.length > 0) {
      pointsQuery = pointsQuery.in('point_id', pointIds);
    }
    
    const { count: totalPoints } = await pointsQuery;

    let activeQuery = supabase
      .from('charging_sessions')
      .select('session_id', { count: 'exact', head: true })
      .in('status', ['active', 'in-progress', 'charging']);

    if (pointIds && pointIds.length > 0) {
      activeQuery = activeQuery.in('point_id', pointIds);
    }

    const { count: activeSessions } = await activeQuery;
    const currentUtilization = totalPoints && totalPoints > 0 
      ? ((activeSessions || 0) / totalPoints) * 100 
      : 0;

    // TODO: Replace with real data from ratings table
    const customerSatisfaction = 4.7;
    const maintenanceAlerts = 2;

    return {
      todaysSessions: todaysSessionCount,
      todaysRevenue: formatCurrency(todaysRevenue),
      currentUtilization: parseFloat(currentUtilization.toFixed(1)),
      averageSessionDuration: parseFloat(averageSessionDuration.toFixed(1)),
      customerSatisfaction,
      maintenanceAlerts,
      percentageChanges: {
        sessions: parseFloat(calculatePercentageChange(todaysSessionCount, yesterdaySessionCount).toFixed(1)),
        revenue: parseFloat(calculatePercentageChange(todaysRevenue, yesterdayRevenue).toFixed(1)),
      },
    };
  } catch (error) {
    console.error('Error fetching staff metrics:', error);
    throw error;
  }
}

/**
 * Get staff analytics data for charts
 */
export async function getStaffAnalytics(stationId?: string): Promise<StaffAnalytics> {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    let pointIds: number[] | null = null;
    if (stationId && stationId !== 'all') {
      pointIds = await getStationPointIds(stationId);
      if (pointIds.length === 0) {
        return {
          dailyUsage: [],
          hourlyPattern: Array.from({ length: 24 }, (_, hour) => ({ hour, sessions: 0, utilization: 0 })),
          weeklyTrend: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({ day, sessions: 0, revenue: 0 })),
          recentSessions: []
        };
      }
    }

    let query = supabase
      .from('charging_sessions')
      .select('session_id, start_time, end_time, cost, status, user_id')
      .gte('start_time', sevenDaysAgo.toISOString())
      .order('start_time', { ascending: true });

    if (pointIds && pointIds.length > 0) {
      query = query.in('point_id', pointIds);
    }

    const { data: sessions } = await query;

    // Process data
    const dailyUsageMap = new Map<string, { sessions: number; revenue: number }>();
    const hourlyPatternMap = new Map<number, number>();
    const weeklyTrendMap = new Map<string, { sessions: number; revenue: number }>();

    sessions?.forEach((session) => {
      const date = new Date(session.start_time);
      const dateStr = date.toISOString().split('T')[0];
      const hour = date.getHours();
      const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];

      const daily = dailyUsageMap.get(dateStr) || { sessions: 0, revenue: 0 };
      daily.sessions++;
      if (session.status === 'completed' && session.cost) {
        daily.revenue += parseFloat(session.cost.toString()) || 0;
      }
      dailyUsageMap.set(dateStr, daily);

      hourlyPatternMap.set(hour, (hourlyPatternMap.get(hour) || 0) + 1);

      const weekly = weeklyTrendMap.get(dayOfWeek) || { sessions: 0, revenue: 0 };
      weekly.sessions++;
      if (session.status === 'completed' && session.cost) {
        weekly.revenue += parseFloat(session.cost.toString()) || 0;
      }
      weeklyTrendMap.set(dayOfWeek, weekly);
    });

    const dailyUsage = Array.from(dailyUsageMap.entries()).map(([date, data]) => ({
      date,
      sessions: data.sessions,
      revenue: formatCurrency(data.revenue),
    }));

    const hourlyPattern = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      sessions: hourlyPatternMap.get(hour) || 0,
      utilization: 0,
    }));

    const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weeklyTrend = dayOrder.map((day) => {
      const data = weeklyTrendMap.get(day) || { sessions: 0, revenue: 0 };
      return {
        day,
        sessions: data.sessions,
        revenue: formatCurrency(data.revenue),
      };
    });

    // Recent sessions
    let recentQuery = supabase
      .from('charging_sessions')
      .select('session_id, start_time, end_time, cost, status, user_id')
      .order('start_time', { ascending: false })
      .limit(5);

    if (pointIds && pointIds.length > 0) {
      recentQuery = recentQuery.in('point_id', pointIds);
    }

    const { data: recentSessionsData } = await recentQuery;

    const userIds = recentSessionsData?.map(s => s.user_id).filter(Boolean) || [];
    const { data: usersData } = await supabase
      .from('users')
      .select('user_id, name')
      .in('user_id', userIds);

    const usersMap = new Map(usersData?.map(u => [u.user_id, u.name]) || []);

    const recentSessions = recentSessionsData?.map((session) => {
      const duration = session.end_time && session.start_time
        ? ((new Date(session.end_time).getTime() - new Date(session.start_time).getTime()) / (1000 * 60 * 60)).toFixed(1)
        : 'In progress';

      return {
        id: session.session_id.toString(),
        customer: usersMap.get(session.user_id) || 'Unknown',
        duration: typeof duration === 'string' ? duration : `${duration}h`,
        amount: formatCurrency(parseFloat(session.cost?.toString() || '0')),
        status: session.status || 'unknown',
      };
    }) || [];

    return {
      dailyUsage,
      hourlyPattern,
      weeklyTrend,
      recentSessions,
    };
  } catch (error) {
    console.error('Error fetching staff analytics:', error);
    throw error;
  }
}
