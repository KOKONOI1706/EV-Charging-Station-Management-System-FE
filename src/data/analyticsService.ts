// Analytics Service for EV Charging System
// NOTE: This file contains mock analytics data
// TODO: Replace with real analytics from Supabase in production

import { Station } from '../services/supabaseService';

// Analytics interfaces
export interface AnalyticsData {
  revenue: RevenueAnalytics;
  usage: UsageAnalytics;
  stations: StationAnalytics;
  customers: CustomerAnalytics;
  forecasting: ForecastingData;
  realTime: RealTimeMetrics;
}

export interface RevenueAnalytics {
  total: number;
  daily: Array<{ date: string; revenue: number; sessions: number }>;
  monthly: Array<{ month: string; revenue: number; growth: number }>;
  byStation: Array<{ stationId: string; stationName: string; revenue: number; percentage: number }>;
  byPricingPlan: Array<{ plan: string; revenue: number; users: number }>;
  averageRevenuePerSession: number;
  profitMargin: number;
}

export interface UsageAnalytics {
  totalSessions: number;
  sessionsThisMonth: number;
  averageSessionDuration: number;
  peakHours: Array<{ hour: number; sessions: number }>;
  utilizationRate: number;
  energyDelivered: number;
  mostPopularConnectorType: string;
  averageWaitTime: number;
  sessionsByConnectorType: Array<{ type: string; sessions: number; percentage: number }>;
  sessionsByDay: Array<{ day: string; sessions: number; revenue: number }>;
  hourlyUsage: Array<{ hour: number; sessions: number; avgDuration: number }>;
}

export interface StationAnalytics {
  totalStations: number;
  averageUtilization: number;
  topPerformingStations: Array<{
    station: Station;
    sessions: number;
    revenue: number;
    utilization: number;
    rating: number;
  }>;
  stationHealth: Array<{
    stationId: string;
    stationName: string;
    status: string;
    uptime: number;
    lastMaintenance: string;
  }>;
  maintenanceAlerts: Array<{
    stationId: string;
    stationName: string;
    severity: 'low' | 'medium' | 'high';
    issue: string;
    reportedAt: string;
  }>;
  geographicDistribution: Array<{
    city: string;
    stations: number;
    utilization: number;
    revenue: number;
  }>;
}

export interface CustomerAnalytics {
  totalCustomers: number;
  newCustomersThisMonth: number;
  customerGrowthRate: number;
  averageSessionsPerCustomer: number;
  customerRetentionRate: number;
  topCustomers: Array<{
    name: string;
    sessions: number;
    revenue: number;
    joinDate: string;
  }>;
  customerSegments: Array<{
    segment: string;
    count: number;
    avgSpending: number;
  }>;
  churnRate: number;
  lifetimeValue: number;
}

export interface ForecastingData {
  demandForecast: Array<{
    month: string;
    predictedSessions: number;
    confidence: number;
  }>;
  revenueForecast: Array<{
    month: string;
    predictedRevenue: number;
    growth: number;
  }>;
  stationExpansionRecommendations: Array<{
    city: string;
    priority: number;
    expectedROI: number;
    reason: string;
  }>;
  seasonalTrends: Array<{
    season: string;
    avgSessions: number;
    trend: 'up' | 'down' | 'stable';
    change: number;
  }>;
}

export interface RealTimeMetrics {
  activeSessionsNow: number;
  currentHourRevenue: number;
  stationsOnline: number;
  totalStations: number;
  currentUtilization: number;
  alertsCount: number;
  todaysSessions: number;
  todaysRevenue: number;
}

// Mock Analytics Data Generator
// TODO: Replace with real Supabase queries
export class AnalyticsService {
  // NOTE: This is mock data - replace with Supabase analytics queries
  static generateMockAnalytics(): AnalyticsData {
    return {
      revenue: this.generateRevenueAnalytics(),
      usage: this.generateUsageAnalytics(),
      stations: this.generateStationAnalytics(),
      customers: this.generateCustomerAnalytics(),
      forecasting: this.generateForecastingData(),
      realTime: this.generateRealTimeMetrics()
    };
  }

  private static generateRevenueAnalytics(): RevenueAnalytics {
    // Mock data - replace with Supabase queries
    const dailyData: Array<{date: string; revenue: number; sessions: number}> = [];
    const monthlyData: Array<{month: string; revenue: number; growth: number}> = [];
    
    // Generate mock daily data for last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dailyData.push({
        date: date.toISOString().split('T')[0],
        revenue: Math.floor(Math.random() * 5000) + 2000,
        sessions: Math.floor(Math.random() * 200) + 50
      });
    }

    // Generate mock monthly data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    for (let i = 0; i < 6; i++) {
      const revenue = Math.floor(Math.random() * 50000) + 30000;
      const prevRevenue = Math.floor(Math.random() * 45000) + 25000;
      monthlyData.push({
        month: months[i],
        revenue,
        growth: ((revenue - prevRevenue) / prevRevenue * 100)
      });
    }

    return {
      total: 847650.50,
      daily: dailyData,
      monthly: monthlyData,
      byStation: [
        { stationId: '1', stationName: 'Downtown Charging Hub', revenue: 125450, percentage: 14.8 },
        { stationId: '2', stationName: 'Mall Charging Center', revenue: 98750, percentage: 11.6 },
        { stationId: '3', stationName: 'Airport Express Station', revenue: 187320, percentage: 22.1 },
      ],
      byPricingPlan: [
        { plan: 'Basic', revenue: 285450, users: 2847 },
        { plan: 'Plus', revenue: 324100, users: 1623 },
        { plan: 'Premium', revenue: 238100, users: 567 }
      ],
      averageRevenuePerSession: 18.45,
      profitMargin: 34.2
    };
  }

  private static generateUsageAnalytics(): UsageAnalytics {
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    return {
      totalSessions: 45670,
      sessionsThisMonth: 3890,
      averageSessionDuration: 42,
      peakHours: [
        { hour: 8, sessions: 1250 },
        { hour: 17, sessions: 1180 },
        { hour: 12, sessions: 980 },
      ],
      utilizationRate: 67.8,
      energyDelivered: 1834590,
      mostPopularConnectorType: 'CCS',
      averageWaitTime: 4.2,
      sessionsByConnectorType: [
        { type: 'CCS', sessions: 18500, percentage: 40.5 },
        { type: 'CHAdeMO', sessions: 12200, percentage: 26.7 },
        { type: 'Type 2', sessions: 8970, percentage: 19.6 },
        { type: 'Tesla Connector', sessions: 6000, percentage: 13.2 }
      ],
      sessionsByDay: daysOfWeek.map(day => ({
        day,
        sessions: Math.floor(Math.random() * 800) + 400,
        revenue: Math.floor(Math.random() * 15000) + 7500
      })),
      hourlyUsage: Array.from({ length: 24 }, (_, hour) => ({
        hour,
        sessions: Math.floor(Math.random() * 200) + 50,
        avgDuration: Math.floor(Math.random() * 60) + 20
      }))
    };
  }

  private static generateStationAnalytics(): StationAnalytics {
    const mockStations = [
      { id: '1', name: 'Downtown Charging Hub' },
      { id: '2', name: 'Mall Charging Center' },
      { id: '3', name: 'Airport Express Station' },
    ];

    return {
      totalStations: 6,
      averageUtilization: 67.8,
      topPerformingStations: mockStations.map((station) => ({
        station: station as any,
        sessions: Math.floor(Math.random() * 2000) + 1000,
        revenue: Math.floor(Math.random() * 50000) + 25000,
        utilization: Math.floor(Math.random() * 40) + 50,
        rating: 4.2 + Math.random() * 0.7
      })),
      stationHealth: mockStations.map(station => ({
        stationId: station.id,
        stationName: station.name,
        status: Math.random() > 0.1 ? 'Operational' : 'Maintenance',
        uptime: 95 + Math.random() * 5,
        lastMaintenance: `${Math.floor(Math.random() * 30) + 1} days ago`
      })),
      maintenanceAlerts: [],
      geographicDistribution: [
        { city: 'Downtown', stations: 2, utilization: 78.5, revenue: 224200 },
        { city: 'Westside', stations: 1, utilization: 65.2, revenue: 98750 },
      ]
    };
  }

  private static generateCustomerAnalytics(): CustomerAnalytics {
    return {
      totalCustomers: 5034,
      newCustomersThisMonth: 287,
      customerGrowthRate: 12.5,
      averageSessionsPerCustomer: 9.1,
      customerRetentionRate: 89.3,
      topCustomers: [
        { name: 'Alex Johnson', sessions: 45, revenue: 1250.75, joinDate: '2023-01-15' },
        { name: 'Maria Garcia', sessions: 67, revenue: 1825.30, joinDate: '2022-11-08' },
      ],
      customerSegments: [
        { segment: 'Frequent Users (20+ sessions)', count: 234, avgSpending: 1450.25 },
        { segment: 'Regular Users (5-19 sessions)', count: 1567, avgSpending: 485.75 },
      ],
      churnRate: 8.7,
      lifetimeValue: 456.80
    };
  }

  private static generateForecastingData(): ForecastingData {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    
    return {
      demandForecast: months.map((month, index) => ({
        month,
        predictedSessions: 7500 + (index * 250) + Math.floor(Math.random() * 500),
        confidence: 85 + Math.random() * 10
      })),
      revenueForecast: months.map((month, index) => ({
        month,
        predictedRevenue: 75000 + (index * 5000) + Math.floor(Math.random() * 10000),
        growth: 8 + Math.random() * 8
      })),
      stationExpansionRecommendations: [
        { city: 'Beverly Hills', priority: 95, expectedROI: 185, reason: 'High demand, affluent area' },
      ],
      seasonalTrends: [
        { season: 'Spring', avgSessions: 8750, trend: 'up', change: 12.5 },
        { season: 'Summer', avgSessions: 9200, trend: 'up', change: 18.3 },
        { season: 'Fall', avgSessions: 8100, trend: 'down', change: -8.2 },
        { season: 'Winter', avgSessions: 7600, trend: 'stable', change: 2.1 }
      ]
    };
  }

  private static generateRealTimeMetrics(): RealTimeMetrics {
    return {
      activeSessionsNow: 23,
      currentHourRevenue: 1247.50,
      stationsOnline: 58,
      totalStations: 60,
      currentUtilization: 68.5,
      alertsCount: 3,
      todaysSessions: 187,
      todaysRevenue: 3456.75
    };
  }

  // Helper methods for getting analytics data
  static async getAnalytics(): Promise<AnalyticsData> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return this.generateMockAnalytics();
  }

  static async getRevenueAnalytics(): Promise<RevenueAnalytics> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return this.generateRevenueAnalytics();
  }

  static async getUsageAnalytics(): Promise<UsageAnalytics> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return this.generateUsageAnalytics();
  }

  static async getStationAnalytics(): Promise<StationAnalytics> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return this.generateStationAnalytics();
  }

  static async getCustomerAnalytics(): Promise<CustomerAnalytics> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return this.generateCustomerAnalytics();
  }

  static async getRealTimeMetrics(): Promise<RealTimeMetrics> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return this.generateRealTimeMetrics();
  }
}