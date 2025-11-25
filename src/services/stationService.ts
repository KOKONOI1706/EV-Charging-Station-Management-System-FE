/**
 * ========================================
 * STATION SERVICE
 * ========================================
 * Service quản lý các thao tác với trạm sạc (stations)
 * 
 * Chức năng:
 * - Lấy danh sách tất cả trạm sạc
 * - Lấy chi tiết 1 trạm theo ID
 * - Lấy danh sách điểm sạc của trạm
 * - Tìm trạm gần vị trí hiện tại (nearby search)
 * - Tìm kiếm trạm theo tên/địa chỉ
 * - Lọc điểm sạc đang sẵn sàng
 * - Kiểm tra kết nối backend
 * 
 * Tất cả method đều:
 * - Gọi API thông qua apiService
 * - Xử lý lỗi gracefully (không throw, return empty array/null)
 * - Log lỗi ra console để debug
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