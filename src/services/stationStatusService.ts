import { Station } from './supabaseService';

export interface StationStatusResult {
  color: string;
  status: 'available' | 'full' | 'maintenance' | 'soon_available';
  statusText: string;
  description: string;
  priority: number;
}

export interface ChargingPoint {
  id: string;
  station_id: string;
  connector_type: string;
  power_kw: number;
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  current_user_id?: string;
  estimated_completion_time?: string;
  vehicle_type_compatibility: string[];
}

export class StationStatusService {
  
  /**
   * Xác định trạng thái và màu sắc của trạm sạc theo quy tắc business
   */
  static getStationDisplayStatus(station: Station, userVehicleType?: string): StationStatusResult {
    // Rule 1: Trạm bảo trì -> Màu xám
    if (station.status === 'maintenance') {
      return {
        color: '#6b7280', // gray-500
        status: 'maintenance',
        statusText: 'Đang bảo trì',
        description: 'Trạm hiện đang được bảo trì và không thể sử dụng',
        priority: 4
      };
    }

    // Rule 2: Trạm offline -> Màu xám đậm
    if (station.status === 'offline') {
      return {
        color: '#374151', // gray-700
        status: 'maintenance',
        statusText: 'Tạm ngừng hoạt động',
        description: 'Trạm hiện không hoạt động',
        priority: 5
      };
    }

    // Rule 3: Trạm đầy nhưng sắp có chỗ -> Màu vàng
    if (station.available_spots === 0 && station.next_available_in_minutes && station.next_available_in_minutes <= 10) {
      return {
        color: '#eab308', // yellow-500
        status: 'soon_available',
        statusText: 'Sắp có chỗ',
        description: `Dự kiến có chỗ trong ${station.next_available_in_minutes} phút`,
        priority: 2
      };
    }

    // Rule 4: Trạm đầy -> Màu đỏ
    if (station.available_spots === 0) {
      return {
        color: '#dc2626', // red-600
        status: 'full',
        statusText: 'Đã đầy',
        description: 'Tất cả chỗ sạc đều đang được sử dụng',
        priority: 3
      };
    }

    // Rule 5: Trạm có chỗ phù hợp với xe -> Màu xanh lá
    if (station.available_spots > 0 && station.status === 'active') {
      const isCompatible = this.checkVehicleCompatibility(station, userVehicleType);
      
      if (isCompatible) {
        return {
          color: '#16a34a', // green-600
          status: 'available',
          statusText: 'Có sẵn',
          description: `${station.available_spots}/${station.total_spots} chỗ còn trống`,
          priority: 1
        };
      } else {
        // Có chỗ nhưng không phù hợp với loại xe
        return {
          color: '#f59e0b', // amber-500
          status: 'available',
          statusText: 'Không tương thích',
          description: 'Có chỗ trống nhưng không phù hợp với loại xe của bạn',
          priority: 2
        };
      }
    }

    // Default fallback
    return {
      color: '#6b7280', // gray-500
      status: 'maintenance',
      statusText: 'Không xác định',
      description: 'Trạng thái trạm chưa được xác định',
      priority: 4
    };
  }

  /**
   * Kiểm tra tính tương thích của trạm với loại xe
   */
  private static checkVehicleCompatibility(station: Station, userVehicleType?: string): boolean {
    if (!userVehicleType || !station.vehicle_compatibility) {
      return true; // Mặc định tương thích nếu không có thông tin
    }

    return station.vehicle_compatibility.some(compatibility => 
      compatibility.toLowerCase().includes(userVehicleType.toLowerCase())
    );
  }

  /**
   * Tạo marker HTML cho Leaflet với màu sắc tương ứng
   */
  static createStationMarkerHTML(station: Station, userVehicleType?: string): string {
    const statusInfo = this.getStationDisplayStatus(station, userVehicleType);
    
    return `
      <div style="
        background-color: ${statusInfo.color};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 14px;
        position: relative;
      ">
        ${this.getStationIcon(statusInfo.status)}
        ${this.getStatusIndicator(statusInfo.status)}
      </div>
    `;
  }

  /**
   * Lấy icon phù hợp cho trạng thái
   */
  private static getStationIcon(status: string): string {
    switch (status) {
      case 'available': return '⚡';
      case 'full': return '🔴';
      case 'maintenance': return '🔧';
      case 'soon_available': return '⏱️';
      default: return '⚡';
    }
  }

  /**
   * Tạo indicator nhỏ cho trạng thái đặc biệt
   */
  private static getStatusIndicator(status: string): string {
    if (status === 'soon_available') {
      return `
        <div style="
          position: absolute;
          top: -2px;
          right: -2px;
          width: 8px;
          height: 8px;
          background-color: #fbbf24;
          border-radius: 50%;
          border: 1px solid white;
        "></div>
      `;
    }
    return '';
  }

  /**
   * Tạo popup content chi tiết cho marker
   */
  static createStationPopupContent(station: Station, userVehicleType?: string): string {
    const statusInfo = this.getStationDisplayStatus(station, userVehicleType);
    
    return `
      <div style="min-width: 280px; font-family: system-ui;">
        <div style="border-bottom: 2px solid ${statusInfo.color}; padding-bottom: 8px; margin-bottom: 8px;">
          <h3 style="margin: 0; font-size: 18px; font-weight: bold; color: #1f2937;">
            ${station.name}
          </h3>
          <div style="display: flex; align-items: center; margin-top: 4px;">
            <span style="
              background-color: ${statusInfo.color};
              color: white;
              padding: 2px 8px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: bold;
            ">
              ${statusInfo.statusText}
            </span>
          </div>
        </div>
        
        <div style="margin-bottom: 12px;">
          <p style="margin: 0; color: #6b7280; font-size: 14px;">📍 ${station.address}</p>
          <p style="margin: 4px 0; color: #374151; font-size: 14px;">
            <strong>${statusInfo.description}</strong>
          </p>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; font-size: 13px;">
          <div>
            <strong>Chỗ sạc:</strong><br>
            <span style="color: ${statusInfo.color}; font-weight: bold;">
              ${station.available_spots}/${station.total_spots} có sẵn
            </span>
          </div>
          <div>
            <strong>Công suất:</strong><br>
            ${station.power_kw}kW ${this.getChargerTypeIcon(station.charger_type)}
          </div>
          <div>
            <strong>Giá:</strong><br>
            <span style="color: #16a34a; font-weight: bold;">$${station.price_per_kwh}/kWh</span>
          </div>
          <div>
            <strong>Đánh giá:</strong><br>
            <span style="color: #f59e0b;">⭐ ${station.rating}/5.0</span>
          </div>
        </div>

        ${this.getAdditionalInfo(station, statusInfo)}

        <div style="margin-top: 12px; text-align: center;">
          <button 
            onclick="window.selectStation && window.selectStation('${station.id}')"
            style="
              background: ${statusInfo.status === 'available' ? '#16a34a' : '#6b7280'};
              color: white;
              border: none;
              padding: 8px 16px;
              border-radius: 6px;
              cursor: ${statusInfo.status === 'available' ? 'pointer' : 'not-allowed'};
              font-size: 14px;
              font-weight: bold;
              width: 100%;
              transition: all 0.2s;
            "
            ${statusInfo.status !== 'available' ? 'disabled' : ''}
          >
            ${this.getButtonText(statusInfo.status)}
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Lấy thông tin bổ sung cho popup
   */
  private static getAdditionalInfo(station: Station, statusInfo: StationStatusResult): string {
    let additionalInfo = '';

    // Thời gian cập nhật cuối
    if (station.last_updated) {
      const lastUpdated = new Date(station.last_updated);
      const now = new Date();
      const diffMinutes = Math.floor((now.getTime() - lastUpdated.getTime()) / (1000 * 60));
      
      additionalInfo += `
        <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">
          Cập nhật: ${diffMinutes < 1 ? 'vừa xong' : `${diffMinutes} phút trước`}
        </div>
      `;
    }

    // Thông tin thời gian chờ cho trạng thái sắp có chỗ
    if (statusInfo.status === 'soon_available' && station.estimated_completion_times?.length) {
      const nextTimes = station.estimated_completion_times.slice(0, 3).join(', ');
      additionalInfo += `
        <div style="
          background-color: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 4px;
          padding: 6px;
          margin-bottom: 8px;
          font-size: 12px;
        ">
          <strong>⏰ Thời gian dự kiến:</strong><br>
          ${nextTimes} phút
        </div>
      `;
    }

    // Thông tin tương thích xe
    if (station.vehicle_compatibility?.length) {
      additionalInfo += `
        <div style="margin-bottom: 8px;">
          <strong style="font-size: 12px;">Tương thích:</strong><br>
          <div style="display: flex; flex-wrap: wrap; gap: 2px; margin-top: 2px;">
            ${station.vehicle_compatibility.map(compat => 
              `<span style="
                background-color: #e5e7eb;
                color: #374151;
                padding: 1px 4px;
                border-radius: 3px;
                font-size: 10px;
              ">${compat}</span>`
            ).join('')}
          </div>
        </div>
      `;
    }

    return additionalInfo;
  }

  /**
   * Lấy icon cho loại sạc
   */
  private static getChargerTypeIcon(chargerType: string): string {
    if (chargerType?.toLowerCase().includes('ultra')) return '⚡⚡⚡';
    if (chargerType?.toLowerCase().includes('fast')) return '⚡⚡';
    return '⚡';
  }

  /**
   * Lấy text cho button
   */
  private static getButtonText(status: string): string {
    switch (status) {
      case 'available': return 'Chọn trạm này';
      case 'full': return 'Đã hết chỗ';
      case 'maintenance': return 'Không khả dụng';
      case 'soon_available': return 'Đặt chỗ chờ';
      default: return 'Không khả dụng';
    }
  }

  /**
   * Cập nhật trạng thái realtime cho trạm
   */
  static async updateStationRealTimeStatus(stationId: string): Promise<Station | null> {
    // Simulate real-time update
    // In production, this would call an API
    const mockUpdate = {
      last_updated: new Date().toISOString(),
      next_available_in_minutes: Math.random() > 0.7 ? Math.floor(Math.random() * 15) : undefined
    };

    return mockUpdate as any;
  }

  /**
   * Tính toán thời gian chờ dự kiến
   */
  static calculateEstimatedWaitTime(currentUsers: number, avgChargingTime: number = 45): number {
    return currentUsers * avgChargingTime;
  }
}

/**
 * Service riêng cho Charging Points (điểm sạc cụ thể)
 */
export class ChargingPointService {
  
  /**
   * Lấy trạng thái của từng điểm sạc trong trạm
   */
  static getChargingPointStatus(point: ChargingPoint): StationStatusResult {
    switch (point.status) {
      case 'available':
        return {
          color: '#16a34a',
          status: 'available',
          statusText: 'Có sẵn',
          description: `${point.connector_type} - ${point.power_kw}kW`,
          priority: 1
        };
      
      case 'occupied':
        const timeLeft = point.estimated_completion_time 
          ? this.getTimeUntilCompletion(point.estimated_completion_time)
          : null;
        
        return {
          color: '#dc2626',
          status: 'full',
          statusText: 'Đang sử dụng',
          description: timeLeft ? `Còn ${timeLeft} phút` : 'Đang sạc',
          priority: 3
        };
      
      case 'reserved':
        return {
          color: '#f59e0b',
          status: 'soon_available',
          statusText: 'Đã đặt chỗ',
          description: 'Có người đặt trước',
          priority: 2
        };
      
      case 'maintenance':
        return {
          color: '#6b7280',
          status: 'maintenance',
          statusText: 'Bảo trì',
          description: 'Đang được sửa chữa',
          priority: 4
        };
      
      default:
        return {
          color: '#6b7280',
          status: 'maintenance',
          statusText: 'Không rõ',
          description: 'Trạng thái chưa xác định',
          priority: 4
        };
    }
  }

  /**
   * Tính thời gian còn lại đến khi hoàn thành
   */
  private static getTimeUntilCompletion(estimatedCompletion: string): number {
    const completion = new Date(estimatedCompletion);
    const now = new Date();
    const diffMs = completion.getTime() - now.getTime();
    return Math.max(0, Math.floor(diffMs / (1000 * 60)));
  }

  /**
   * Tạo marker cho charging point cụ thể
   */
  static createChargingPointMarker(point: ChargingPoint, stationName: string): string {
    const status = this.getChargingPointStatus(point);
    
    return `
      <div style="
        background-color: ${status.color};
        width: 20px;
        height: 20px;
        border-radius: 4px;
        border: 2px solid white;
        box-shadow: 0 1px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 10px;
      ">
        ${point.power_kw}
      </div>
    `;
  }
}