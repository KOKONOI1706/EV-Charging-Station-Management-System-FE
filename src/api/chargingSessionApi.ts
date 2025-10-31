// API service for charging session management

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface ChargingSession {
  session_id: number;
  user_id: number;
  vehicle_id?: number;
  point_id: number;
  booking_id?: number;
  start_time: string;
  end_time?: string;
  meter_start: number;
  meter_end?: number;
  energy_consumed_kwh: number;
  idle_minutes: number;
  idle_fee: number;
  cost: number;
  payment_id?: number;
  status: 'Active' | 'Completed' | 'Error';
  created_at: string;
  
  // Relations
  charging_points?: {
    point_id: number;
    name: string;
    power_kw: number;
    status: string;
    idle_fee_per_min: number;
    stations?: {
      id: string;
      name: string;
      address: string;
      price_rate: number;
    };
  };
  vehicles?: {
    vehicle_id: number;
    plate_number: string;
    battery_capacity_kwh: number;
  };
  users?: {
    user_id: number;
    name: string;
    email: string;
  };
  bookings?: {
    booking_id: number;
    start_time: string;
    status: string;
  };
  payments?: {
    payment_id: number;
    amount: number;
    status: string;
  };
}

export interface StartSessionRequest {
  user_id: number;
  vehicle_id?: number;
  point_id: number;
  booking_id?: number;
  meter_start: number;
}

export interface StopSessionRequest {
  meter_end: number;
  idle_minutes?: number;
}

export interface UpdateMeterRequest {
  current_meter: number;
}

export interface SessionFilters {
  user_id?: number;
  status?: 'Active' | 'Completed';
  point_id?: number;
  limit?: number;
  offset?: number;
}

class ChargingSessionApiService {
  private baseUrl = `${API_BASE_URL}/charging`;

  /**
   * Start a new charging session
   */
  async startSession(data: StartSessionRequest): Promise<ChargingSession> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to start charging session');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Stop an active charging session
   */
  async stopSession(sessionId: number, data: StopSessionRequest): Promise<ChargingSession> {
    const response = await fetch(`${this.baseUrl}/${sessionId}/stop`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to stop charging session');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Get user's active charging session
   */
  async getActiveSession(userId: number): Promise<ChargingSession | null> {
    const response = await fetch(`${this.baseUrl}/active/user/${userId}`);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      const error = await response.json();
      throw new Error(error.error || 'Failed to get active session');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Get session details by ID
   */
  async getSessionById(sessionId: number): Promise<ChargingSession> {
    const response = await fetch(`${this.baseUrl}/${sessionId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get session details');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Get list of sessions with filters
   */
  async getSessions(filters: SessionFilters = {}): Promise<{ sessions: ChargingSession[]; total: number }> {
    const params = new URLSearchParams();
    
    if (filters.user_id) params.append('user_id', filters.user_id.toString());
    if (filters.status) params.append('status', filters.status);
    if (filters.point_id) params.append('point_id', filters.point_id.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.offset) params.append('offset', filters.offset.toString());

    const response = await fetch(`${this.baseUrl}?${params.toString()}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get sessions');
    }

    const result = await response.json();
    return {
      sessions: result.data,
      total: result.total || 0,
    };
  }

  /**
   * Update meter reading during charging
   */
  async updateMeter(sessionId: number, data: UpdateMeterRequest): Promise<{ 
    session_id: number;
    meter_start: number;
    current_meter: number;
    energy_consumed_so_far: number;
  }> {
    const response = await fetch(`${this.baseUrl}/${sessionId}/update-meter`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update meter reading');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Calculate estimated cost for current meter reading
   */
  calculateEstimatedCost(
    meterStart: number,
    currentMeter: number,
    pricePerKwh: number,
    idleMinutes: number = 0,
    idleFeePerMin: number = 0
  ): number {
    const energyConsumed = currentMeter - meterStart;
    const energyCost = energyConsumed * pricePerKwh;
    const idleFee = idleMinutes * idleFeePerMin;
    return energyCost + idleFee;
  }

  /**
   * Format duration in human-readable format
   */
  formatDuration(startTime: string, endTime?: string): string {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const durationMs = end.getTime() - start.getTime();
    
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  /**
   * Format cost in VND currency
   */
  formatCost(cost: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(cost);
  }
}

export const chargingSessionApi = new ChargingSessionApiService();
