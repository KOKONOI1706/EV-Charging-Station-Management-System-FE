const API_BASE_URL = 'http://localhost:5000/api';

export interface CreateBookingRequest {
  user_id: number;
  point_id: number;
  start_time: string;
  expire_time: string;
  promo_id?: number;
  price_estimate?: number;
}

export interface BookingResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

export const bookingApi = {
  // Create a new booking
  async createBooking(data: CreateBookingRequest): Promise<BookingResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || result.message || 'Failed to create booking');
      }

      return result;
    } catch (error: any) {
      console.error('Error creating booking:', error);
      return {
        success: false,
        error: error.message || 'Failed to create booking',
      };
    }
  },

  // Get bookings for a user
  async getUserBookings(userId: number): Promise<BookingResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings?userId=${userId}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch bookings');
      }

      return result;
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch bookings',
      };
    }
  },

  // Update booking status
  async updateBookingStatus(
    bookingId: number,
    status: 'Pending' | 'Confirmed' | 'Canceled' | 'Completed'
  ): Promise<BookingResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update booking status');
      }

      return result;
    } catch (error: any) {
      console.error('Error updating booking status:', error);
      return {
        success: false,
        error: error.message || 'Failed to update booking status',
      };
    }
  },

  // Cancel booking
  async cancelBooking(bookingId: number): Promise<BookingResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to cancel booking');
      }

      return result;
    } catch (error: any) {
      console.error('Error cancelling booking:', error);
      return {
        success: false,
        error: error.message || 'Failed to cancel booking',
      };
    }
  },
};
