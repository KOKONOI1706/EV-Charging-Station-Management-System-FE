// Analytics Service for EV Charging System
import { Station, Booking, User } from './mockDatabase';

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
  daily: { date: string; revenue: number; sessions: number }[];
  monthly: { month: string; revenue: number; growth: number }[];
  byStation: { stationId: string; stationName: string; revenue: number; percentage: number }[];
  byPricingPlan: { plan: string; revenue: number; users: number }[];
  averageRevenuePerSession: number;
  profitMargin: number;
}

export interface UsageAnalytics {
  totalSessions: number;
  averageSessionDuration: number;
  peakHours: { hour: number; sessions: number; utilization: number }[];
  weeklyPattern: { day: string; sessions: number; avgDuration: number }[];
  sessionsByConnectorType: { type: string; sessions: number; percentage: number }[];
  sessionsByPowerLevel: { power: string; sessions: number; avgDuration: number }[];
  utilizationRate: number;
  customerSatisfaction: number;
}

export interface StationAnalytics {
  totalStations: number;
  averageUtilization: number;
  topPerformingStations: { 
    station: Station; 
    sessions: number; 
    revenue: number; 
    utilization: number;
    rating: number;
  }[];
  stationHealth: { stationId: string; stationName: string; status: string; uptime: number; lastMaintenance: string }[];
  maintenanceAlerts: { stationId: string; stationName: string; alertType: string; priority: string; dueDate: string }[];
  geographicDistribution: { city: string; stations: number; utilization: number; revenue: number }[];
}

export interface CustomerAnalytics {
  totalCustomers: number;
  newCustomersThisMonth: number;
  customerGrowthRate: number;
  averageSessionsPerCustomer: number;
  customerRetentionRate: number;
  topCustomers: { name: string; sessions: number; revenue: number; joinDate: string }[];
  customerSegments: { segment: string; count: number; avgSpending: number }[];
  churnRate: number;
  lifetimeValue: number;
}

export interface ForecastingData {
  demandForecast: { month: string; predictedSessions: number; confidence: number }[];
  revenueForecast: { month: string; predictedRevenue: number; growth: number }[];
  stationExpansionRecommendations: { city: string; priority: number; expectedROI: number; reason: string }[];
  seasonalTrends: { season: string; avgUtilization: number; peakDemand: string }[];
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
export class AnalyticsService {
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
    const dailyData = [];
    const monthlyData = [];
    
    // Generate last 30 days revenue data
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dailyData.push({
        date: date.toISOString().split('T')[0],
        revenue: Math.floor(Math.random() * 3000) + 1500,
        sessions: Math.floor(Math.random() * 150) + 75
      });
    }

    // Generate last 12 months data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const revenue = Math.floor(Math.random() * 50000) + 30000;
      const prevRevenue = Math.floor(Math.random() * 45000) + 25000;
      monthlyData.push({
        month: months[date.getMonth()],
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
        { stationId: '4', stationName: 'Green Energy Station', revenue: 156890, percentage: 18.5 },
        { stationId: '5', stationName: 'Highway Rest Stop', revenue: 164230, percentage: 19.4 },
        { stationId: '6', stationName: 'University Campus Station', revenue: 115010, percentage: 13.6 }
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
    const peakHours = [];
    for (let hour = 0; hour < 24; hour++) {
      let sessions = 15;
      // Simulate peak hours (8-10 AM and 5-7 PM)
      if ((hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 19)) {
        sessions = Math.floor(Math.random() * 80) + 60;
      } else if (hour >= 6 && hour <= 22) {
        sessions = Math.floor(Math.random() * 40) + 25;
      } else {
        sessions = Math.floor(Math.random() * 15) + 5;
      }
      
      peakHours.push({
        hour,
        sessions,
        utilization: Math.min((sessions / 120) * 100, 100)
      });
    }

    return {
      totalSessions: 45982,
      averageSessionDuration: 2.3,
      peakHours,
      weeklyPattern: [
        { day: 'Mon', sessions: 6850, avgDuration: 2.1 },
        { day: 'Tue', sessions: 7120, avgDuration: 2.2 },
        { day: 'Wed', sessions: 6890, avgDuration: 2.4 },
        { day: 'Thu', sessions: 7250, avgDuration: 2.3 },
        { day: 'Fri', sessions: 7680, avgDuration: 2.5 },
        { day: 'Sat', sessions: 5890, avgDuration: 2.8 },
        { day: 'Sun', sessions: 4302, avgDuration: 3.1 }
      ],
      sessionsByConnectorType: [
        { type: 'CCS', sessions: 28450, percentage: 61.9 },
        { type: 'CHAdeMO', sessions: 9850, percentage: 21.4 },
        { type: 'Type 2', sessions: 7682, percentage: 16.7 }
      ],
      sessionsByPowerLevel: [
        { power: '50-100kW', sessions: 15230, avgDuration: 3.2 },
        { power: '100-200kW', sessions: 18750, avgDuration: 2.1 },
        { power: '200kW+', sessions: 12002, avgDuration: 1.4 }
      ],
      utilizationRate: 67.8,
      customerSatisfaction: 4.7
    };
  }

  private static generateStationAnalytics(): StationAnalytics {
    // This would use real station data in production
    const mockStations = [
      { id: '1', name: 'Downtown Charging Hub', city: 'Downtown' },
      { id: '2', name: 'Mall Charging Center', city: 'Westside' },
      { id: '3', name: 'Airport Express Station', city: 'LAX' },
      { id: '4', name: 'Green Energy Station', city: 'Sustainable District' },
      { id: '5', name: 'Highway Rest Stop', city: 'Midway' },
      { id: '6', name: 'University Campus Station', city: 'University City' }
    ];

    return {
      totalStations: 6,
      averageUtilization: 67.8,
      topPerformingStations: mockStations.map((station, index) => ({
        station: station as any,
        sessions: Math.floor(Math.random() * 2000) + 1000,
        revenue: Math.floor(Math.random() * 50000) + 25000,
        utilization: Math.floor(Math.random() * 40) + 50,
        rating: 4.2 + Math.random() * 0.7
      })).sort((a, b) => b.revenue - a.revenue),
      stationHealth: mockStations.map(station => ({
        stationId: station.id,
        stationName: station.name,
        status: Math.random() > 0.1 ? 'Operational' : 'Maintenance',
        uptime: 95 + Math.random() * 5,
        lastMaintenance: `${Math.floor(Math.random() * 30) + 1} days ago`
      })),
      maintenanceAlerts: [
        { stationId: '2', stationName: 'Mall Charging Center', alertType: 'Scheduled Maintenance', priority: 'Medium', dueDate: '2025-01-15' },
        { stationId: '5', stationName: 'Highway Rest Stop', alertType: 'Connector Inspection', priority: 'Low', dueDate: '2025-01-20' }
      ],
      geographicDistribution: [
        { city: 'Downtown', stations: 1, utilization: 78.5, revenue: 125450 },
        { city: 'Westside', stations: 1, utilization: 65.2, revenue: 98750 },
        { city: 'LAX', stations: 1, utilization: 85.3, revenue: 187320 },
        { city: 'Sustainable District', stations: 1, utilization: 72.1, revenue: 156890 },
        { city: 'Midway', stations: 1, utilization: 59.8, revenue: 164230 },
        { city: 'University City', stations: 1, utilization: 45.7, revenue: 115010 }
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
        { name: 'David Kim', sessions: 52, revenue: 1456.90, joinDate: '2023-03-22' },
        { name: 'Sarah Wilson', sessions: 41, revenue: 1198.45, joinDate: '2023-02-14' },
        { name: 'Michael Brown', sessions: 38, revenue: 1087.65, joinDate: '2023-04-03' }
      ],
      customerSegments: [
        { segment: 'Frequent Users (20+ sessions)', count: 234, avgSpending: 1450.25 },
        { segment: 'Regular Users (5-19 sessions)', count: 1567, avgSpending: 485.75 },
        { segment: 'Occasional Users (1-4 sessions)', count: 2845, avgSpending: 127.50 },
        { segment: 'Inactive Users (0 sessions)', count: 388, avgSpending: 0 }
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
        { city: 'Santa Monica', priority: 88, expectedROI: 165, reason: 'Tourist destination, high traffic' },
        { city: 'Pasadena', priority: 75, expectedROI: 145, reason: 'Growing EV adoption' }
      ],
      seasonalTrends: [
        { season: 'Spring', avgUtilization: 72.3, peakDemand: 'March-April' },
        { season: 'Summer', avgUtilization: 85.1, peakDemand: 'July-August' },
        { season: 'Fall', avgUtilization: 68.9, peakDemand: 'September-October' },
        { season: 'Winter', avgUtilization: 61.2, peakDemand: 'December' }
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

  // Helper method to get analytics data with loading simulation
  static async getAnalytics(): Promise<AnalyticsData> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return this.generateMockAnalytics();
  }

  // Get specific analytics section
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