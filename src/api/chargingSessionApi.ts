// API service for charging session management

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
import { apiFetch } from "../lib/api";

export interface Invoice {
  invoice_id: number;
  user_id: number;
  session_id: number;
  payment_id?: number;
  total_amount: number;
  issued_at: string;
  status: 'Issued' | 'Paid' | 'Cancelled';
}

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
  
  // ✅ Battery tracking fields
  initial_battery_percent?: number;
  target_battery_percent?: number;
  estimated_completion_time?: string;
  battery_full_time?: string;
  idle_start_time?: string;
  auto_stopped?: boolean;
  
  // ✅ Real-time calculated fields (from backend)
  current_duration_minutes?: number;
  elapsed_hours?: number;
  current_meter?: number;
  estimated_cost?: number;
  battery_progress?: number;
  charging_rate_kw?: number;
  estimated_minutes_remaining?: number; // ✅ NEW: Minutes until target battery reached
  calculation_timestamp?: string;
  
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
      price_per_kwh: number;
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
  invoice?: Invoice;
}

export interface StartSessionRequest {
  user_id: number;
  vehicle_id?: number;
  point_id: number;
  booking_id?: number;
  meter_start: number;
  initial_battery_percent?: number;  // ✅ NEW: Current battery %
  target_battery_percent?: number;    // ✅ NEW: Target battery % (default 100)
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
  private baseUrl = `${API_BASE_URL}/charging-sessions`;

  /**
   * Start a new charging session
   */
  async startSession(data: StartSessionRequest): Promise<ChargingSession> {
    console.log('Starting session with data:', data);
    console.log('POST URL:', this.baseUrl);
    
    const result = await apiFetch(this.baseUrl, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    return result.data;
  }

  /**
   * Stop an active charging session
   */
  async stopSession(sessionId: number, data: StopSessionRequest): Promise<ChargingSession> {
    const result = await apiFetch(`${this.baseUrl}/${sessionId}/stop`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return result.data;
  }

  /**
   * Get user's active charging session
   */
  async getActiveSession(userId: number): Promise<ChargingSession | null> {
    const url = `${this.baseUrl}/active/user/${userId}`;
    console.log(`📡 GET ${url}`);
    
    try {
      const result = await apiFetch(url, { cache: 'no-cache' } as any);
      return result.data;
    } catch (err: any) {
      if (err.message && err.message.includes('404')) return null;
      throw err;
    }
  }

  /**
   * Get session details by ID
   */
  async getSessionById(sessionId: number): Promise<ChargingSession> {
    const result = await apiFetch(`${this.baseUrl}/${sessionId}`);
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

    const result = await apiFetch(`${this.baseUrl}?${params.toString()}`);
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
    const result = await apiFetch(`${this.baseUrl}/${sessionId}/update-meter`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
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
    // 🔧 Fix timezone: Add 'Z' if missing to ensure UTC parsing
    let startStr = startTime;
    let endStr = endTime;
    
    if (typeof startStr === 'string' && !startStr.endsWith('Z') && !startStr.includes('+')) {
      startStr = startStr + 'Z';
    }
    if (endStr && typeof endStr === 'string' && !endStr.endsWith('Z') && !endStr.includes('+')) {
      endStr = endStr + 'Z';
    }
    
    const start = new Date(startStr);
    const end = endStr ? new Date(endStr) : new Date();
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

  /**
   * Get or create invoice for a completed session
   */
  async getOrCreateInvoice(sessionId: number): Promise<Invoice> {
    const result = await apiFetch(`${API_BASE_URL}/charging-sessions/${sessionId}/invoice`, {
      method: 'POST',
      credentials: 'include' as any,
    } as any);
    return result.data;
  }

  /**
   * Format invoice number with padding (e.g., INV-000123)
   */
  formatInvoiceNumber(invoiceId: number): string {
    return `INV-${String(invoiceId).padStart(6, '0')}`;
  }
}

export const chargingSessionApi = new ChargingSessionApiService();
