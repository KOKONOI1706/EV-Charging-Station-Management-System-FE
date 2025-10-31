/**
 * User Statistics API Service
 * Fetches real user statistics and charging session data
 */

export interface UserStats {
  totalSessions: number;
  sessionsThisMonth: number;
  totalSpent: number;
  averageRating: number;
  totalEnergyConsumed: number;
  activeSessions: number;
}

class UserStatsApiService {
  private baseUrl = 'http://localhost:5000/api';

  /**
   * Get user statistics from charging sessions
   */
  async getUserStats(userId: number): Promise<UserStats> {
    try {
      // Fetch all user's charging sessions
      const response = await fetch(`${this.baseUrl}/charging-sessions?user_id=${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch user stats');
      }

      const result = await response.json();
      const sessions = result.data || [];

      // Calculate statistics
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const stats: UserStats = {
        totalSessions: sessions.length,
        sessionsThisMonth: sessions.filter((session: any) => {
          const sessionDate = new Date(session.start_time);
          return sessionDate.getMonth() === currentMonth && 
                 sessionDate.getFullYear() === currentYear;
        }).length,
        totalSpent: sessions.reduce((sum: number, session: any) => 
          sum + (parseFloat(session.cost) || 0), 0),
        totalEnergyConsumed: sessions.reduce((sum: number, session: any) => 
          sum + (parseFloat(session.energy_consumed_kwh) || 0), 0),
        activeSessions: sessions.filter((session: any) => 
          session.status === 'Active').length,
        averageRating: 4.8 // TODO: Fetch from feedbacks table when available
      };

      return stats;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  }

  /**
   * Get user's recent charging sessions
   */
  async getRecentSessions(userId: number, limit: number = 10) {
    try {
      const response = await fetch(
        `${this.baseUrl}/charging-sessions?user_id=${userId}&limit=${limit}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch recent sessions');
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error fetching recent sessions:', error);
      throw error;
    }
  }

  /**
   * Get user's active charging session
   */
  async getActiveSession(userId: number) {
    try {
      const response = await fetch(
        `${this.baseUrl}/charging-sessions/active/user/${userId}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch active session');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching active session:', error);
      throw error;
    }
  }

  /**
   * Format currency with VND
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  /**
   * Format energy consumption
   */
  formatEnergy(kwh: number): string {
    return `${kwh.toFixed(2)} kWh`;
  }
}

export const userStatsApi = new UserStatsApiService();
