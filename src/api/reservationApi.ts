/**
 * ===============================================================
 * RESERVATION API CLIENT (FRONTEND)
 * ===============================================================
 * API client gọi backend endpoints /api/reservations
 * 
 * Chức năng:
 * - 📡 POST /api/reservations - Tạo reservation mới
 * - ❌ DELETE /api/reservations/:id - Hủy reservation
 * - 🔍 GET /api/reservations/active - Lấy active reservation của user
 * - 📋 GET /api/reservations/user/:userId - Lấy lịch sử reservations
 * 
 * Interfaces:
 * - BackendReservation: Dữ liệu reservation từ backend (booking_id, expire_time)
 * - CreateReservationRequest: Params tạo reservation (userId, pointId, durationMinutes)
 * - CreateReservationResponse: Response từ backend (success, data, error)
 * 
 * Flow tạo reservation:
 * 1. Frontend gọi createReservation({ userId, pointId, durationMinutes })
 * 2. Backend kiểm tra:
 *    - Charging point available?
 *    - User có reservation active khác không?
 *    - Point đã được reserved bởi user khác chưa?
 * 3. Backend tạo booking record với status=Confirmed
 * 4. Backend tính expire_time = now + durationMinutes (default 15 phút)
 * 5. Return booking_id, expire_time
 * 
 * Timezone handling:
 * - Backend trả về expire_time không có 'Z' → JavaScript parse as local time
 * - Fix: Thêm 'Z' vào cuối để force UTC parsing
 * - Example: "2025-11-06T22:16:25.832" → "2025-11-06T22:16:25.832Z"
 * 
 * Dependencies:
 * - Backend API: /api/reservations endpoints
 * - env: VITE_API_BASE_URL (default localhost:5000)
 */

/**
 * Reservation API Client
 * Calls backend /api/reservations endpoints
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export interface BackendReservation {
  booking_id: number; // Changed from reservation_id to booking_id
  user_id: number;
  point_id: number;
  station_id: string;
  start_time: string;
  expire_time: string;
  status: 'Confirmed' | 'Active' | 'Completed' | 'Cancelled' | 'Expired';
  confirmed_at?: string;
  canceled_at?: string;
  created_at: string;
  updated_at?: string;
}

export interface CreateReservationRequest {
  userId: number;
  pointId: number;
  durationMinutes?: number;
}

export interface CreateReservationResponse {
  success: boolean;
  data?: BackendReservation;
  message?: string;
  error?: string;
}

/**
 * Create a new reservation
 */
export async function createReservation(
  request: CreateReservationRequest
): Promise<CreateReservationResponse> {
  try {
    console.log('📡 Calling POST /api/reservations:', request);
    
    const response = await fetch(`${API_BASE_URL}/api/reservations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error('❌ API error:', result);
      return {
        success: false,
        error: result.error || 'Failed to create reservation',
      };
    }

    console.log('✅ Reservation created via API:', result.data);
    return result;
  } catch (error) {
    console.error('❌ Network error creating reservation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

/**
 * Cancel a reservation
 */
export async function cancelReservation(
  reservationId: number,
  userId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`📡 Calling DELETE /api/reservations/${reservationId}`);
    
    const response = await fetch(
      `${API_BASE_URL}/api/reservations/${reservationId}?userId=${userId}`,
      {
        method: 'DELETE',
      }
    );

    const result = await response.json();
    
    if (!response.ok) {
      console.error('❌ API error:', result);
      return {
        success: false,
        error: result.error || 'Failed to cancel reservation',
      };
    }

    console.log('✅ Reservation cancelled via API');
    return { success: true };
  } catch (error) {
    console.error('❌ Network error cancelling reservation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

/**
 * Get user's active reservation
 */
export async function getActiveReservation(
  userId: number
): Promise<{ success: boolean; data?: BackendReservation; error?: string }> {
  try {
    console.log(`📡 Calling GET /api/reservations/active?userId=${userId}`);
    
    const response = await fetch(
      `${API_BASE_URL}/api/reservations/active?userId=${userId}`
    );

    const result = await response.json();
    
    if (!response.ok) {
      console.error('❌ API error:', result);
      return {
        success: false,
        error: result.error,
      };
    }

    console.log('✅ Active reservation fetched:', result.data);
    return result;
  } catch (error) {
    console.error('❌ Network error fetching active reservation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

/**
 * Get user's reservation history
 */
export async function getUserReservations(
  userId: number,
  status?: string
): Promise<{ success: boolean; data?: BackendReservation[]; error?: string }> {
  try {
    const url = new URL(`${API_BASE_URL}/api/reservations/user/${userId}`);
    if (status) {
      url.searchParams.append('status', status);
    }
    
    console.log(`📡 Calling GET ${url.pathname}${url.search}`);
    
    const response = await fetch(url.toString());
    const result = await response.json();
    
    if (!response.ok) {
      console.error('❌ API error:', result);
      return {
        success: false,
        error: result.error,
      };
    }

    console.log(`✅ Fetched ${result.data?.length || 0} reservations`);
    return result;
  } catch (error) {
    console.error('❌ Network error fetching reservations:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}
