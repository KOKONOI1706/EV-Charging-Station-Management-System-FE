/**
 * ===============================================================
 * STATION SERVICE (DỊCH VỤ QUẢN LÝ TRẠM SẠC)
 * ===============================================================
 * Service layer quản lý các thao tác liên quan đến trạm sạc xe điện
 * 
 * Mô tả:
 * Cung cấp API wrapper để tương tác với backend endpoints liên quan đến stations.
 * Xử lý business logic và error handling ở tầng frontend trước khi gọi API.
 * 
 * Chức năng chính:
 * - 📋 getAllStations(): Lấy danh sách tất cả trạm sạc trong hệ thống
 * - 🔍 getStationById(id): Lấy thông tin chi tiết 1 trạm theo ID
 * - ⚡ getChargingPoints(stationId): Lấy danh sách điểm sạc của trạm
 * - 📍 findNearbyStations(lat, lng, radius): Tìm trạm gần vị trí (default 10km)
 * - 🔎 searchStations(query): Tìm kiếm trạm theo tên hoặc địa chỉ
 * - ✅ getAvailablePoints(stationId): Lấy chỉ những điểm sạc Available
 * - 🔌 checkConnection(): Kiểm tra backend có hoạt động không
 * 
 * Error Handling Strategy:
 * - ❌ Không throw error ra ngoài (user-friendly)
 * - 📝 Log lỗi ra console.error để debug
 * - 🔄 Return empty array [] hoặc null thay vì throw
 * - 🎯 Frontend vẫn render được UI dù backend fail
 * 
 * Usage Examples:
 * 
 * 1. **Lấy tất cả trạm:**
 * ```typescript
 * const stations = await StationService.getAllStations();
 * // Return: Station[] hoặc [] nếu lỗi
 * ```
 * 
 * 2. **Tìm trạm gần nhất:**
 * ```typescript
 * const nearbyStations = await StationService.findNearbyStations(
 *   21.0285, 105.8542, 5 // Hà Nội, bán kính 5km
 * );
 * ```
 * 
 * 3. **Lấy điểm sạc còn trống:**
 * ```typescript
 * const available = await StationService.getAvailablePoints(stationId);
 * // Chỉ return những point có status='Available'
 * ```
 * 
 * 4. **Tìm kiếm trạm:**
 * ```typescript
 * const results = await StationService.searchStations('VinFast');
 * // Search trong name và address
 * ```
 * 
 * API Integration:
 * - Tất cả methods đều gọi qua apiService singleton
 * - ApiService xử lý:
 *   * Base URL configuration (VITE_API_URL)
 *   * Headers (Content-Type, Authorization)
 *   * HTTP methods (GET, POST, PUT, DELETE)
 *   * Response parsing (JSON)
 * 
 * Return Types:
 * - getAllStations(): Promise<Station[]>
 * - getStationById(id): Promise<Station | null>
 * - getChargingPoints(stationId): Promise<ChargingPoint[]>
 * - findNearbyStations(): Promise<Station[]>
 * - searchStations(query): Promise<Station[]>
 * - getAvailablePoints(stationId): Promise<ChargingPoint[]>
 * - checkConnection(): Promise<boolean>
 * 
 * Dependencies:
 * - apiService: HTTP client wrapper (fetch API)
 * - ApiResponse<T>: Generic response type
 * - Station interface: Database schema mapping
 * - ChargingPoint interface: Charging point data structure
 * 
 * Performance Notes:
 * - Nearby search có thể slow nếu database lớn (cần index lat/lng)
 * - Available points filter ở frontend (có thể optimize bằng backend filter)
 * - Connection check dùng cho fallback/offline mode
 */

// Import API service và types
import { apiService, ApiResponse, Station, ChargingPoint } from './apiService';

export class StationService {
  // Get all stations
  static async getAllStations(): Promise<Station[]> {
    try {
      const response: ApiResponse<Station[]> = await apiService.get('/stations');
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch stations:', error);
      throw new Error('Unable to fetch stations. Please try again later.');
    }
  }

  // Get station by ID
  static async getStationById(id: number): Promise<Station | null> {
    try {
      const response: ApiResponse<Station> = await apiService.get(`/stations/${id}`);
      return response.data || null;
    } catch (error) {
      console.error(`Failed to fetch station ${id}:`, error);
      return null;
    }
  }

  // Get charging points for a station
  static async getChargingPoints(stationId: number): Promise<ChargingPoint[]> {
    try {
      const response: ApiResponse<ChargingPoint[]> = await apiService.get(`/stations/${stationId}/charging-points`);
      return response.data || [];
    } catch (error) {
      console.error(`Failed to fetch charging points for station ${stationId}:`, error);
      return [];
    }
  }

  // Find stations near location
  static async findNearbyStations(latitude: number, longitude: number, radius: number = 10): Promise<Station[]> {
    try {
      const response: ApiResponse<Station[]> = await apiService.get(
        `/stations/nearby?lat=${latitude}&lng=${longitude}&radius=${radius}`
      );
      return response.data || [];
    } catch (error) {
      console.error('Failed to find nearby stations:', error);
      return [];
    }
  }

  // Search stations by name or address
  static async searchStations(query: string): Promise<Station[]> {
    try {
      const response: ApiResponse<Station[]> = await apiService.get(
        `/stations/search?q=${encodeURIComponent(query)}`
      );
      return response.data || [];
    } catch (error) {
      console.error('Failed to search stations:', error);
      return [];
    }
  }

  // Get available charging points at a station
  static async getAvailablePoints(stationId: number): Promise<ChargingPoint[]> {
    try {
      const points = await this.getChargingPoints(stationId);
      return points.filter(point => point.status === 'Available');
    } catch (error) {
      console.error(`Failed to get available points for station ${stationId}:`, error);
      return [];
    }
  }

  // Check if backend is connected
  static async checkConnection(): Promise<boolean> {
    try {
      await apiService.healthCheck();
      return true;
    } catch (error) {
      console.warn('Backend connection failed:', error);
      return false;
    }
  }
}

// Export for backward compatibility with existing code
export default StationService;