/**
 * ===============================================================
 * BOOKING VALIDATION SERVICE (KIỂM TRA ĐẶT CHỖ)
 * ===============================================================
 * Service kiểm tra các điều kiện trước khi cho phép đặt chỗ
 * 
 * Chức năng:
 * - ✅ Validate user đã đăng nhập
 * - 🚗 Validate user đã có xe trong hệ thống
 * - 🔌 Validate connector compatibility (đầu sạc xe khớp với trạm)
 * - 📊 Validate charging point status (Available/Occupied/etc.)
 * - ⚠️ Hiển thị warnings (battery nhỏ + sạc nhanh, chưa cập nhật connector)
 * 
 * Validation levels:
 * 1. Critical errors: Chặn đặt chỗ (isValid = false)
 *    - Chưa đăng nhập
 *    - Chưa có xe
 *    - Point không available
 *    - Connector không tương thích
 * 
 * 2. Warnings: Cho phép đặt nhưng cảnh báo (isValid = true)
 *    - Chưa cập nhật connector type của xe
 *    - Battery xe nhỏ với sạc siêu nhanh (>150kW)
 * 
 * Interfaces:
 * 
 * ValidationResult:
 * - isValid: boolean
 * - errors: string[] (danh sách lỗi critical)
 * - warnings: string[] (danh sách cảnh báo)
 * 
 * Methods:
 * 
 * 1. validateBooking(user, chargingPoint, userVehicles)
 *    - Validate khi user chọn charging point cụ thể
 *    - Kiểm tra:
 *      * Authentication
 *      * User có xe
 *      * Point status = Available
 *      * Connector compatibility
 *      * Battery size vs power warning
 * 
 * 2. validateStationBooking(user, hasAvailablePoints, userVehicles)
 *    - Validate khi user đặt chỗ station (không chọn point cụ thể)
 *    - Kiểm tra:
 *      * Authentication
 *      * User có xe
 *      * Station có ít nhất 1 point Available
 * 
 * Connector compatibility:
 * - So sánh vehicle.connector_types.name với chargingPoint.connector_type
 * - Normalize: Lowercase + remove spaces/hyphens
 * - Exact match: "CCS2" === "CCS2"
 * - CCS family: "CCS1" compatible với "CCS2"
 * - AC family: "Type2" compatible với "J1772"
 * - CHAdeMO: Chỉ khớp CHAdeMO
 * - Tesla: Chỉ khớp Tesla
 * 
 * Status mapping:
 * - Available: Có thể đặt chỗ ✅
 * - Occupied: "Đang có xe đang sạc" ❌
 * - Reserved: "Đã có người đặt chỗ trước" ❌
 * - AlmostDone: "Đang có xe sạc (sắp xong)" ❌
 * - Maintenance: "Đang bảo trì" ❌
 * - Faulted: "Điểm sạc đang gặp lỗi kỹ thuật" ❌
 * 
 * Warning scenarios:
 * 1. Vehicle chưa có connector_type_id:
 *    - Warning: "Bạn chưa cập nhật loại đầu sạc cho xe. Vui lòng kiểm tra tính tương thích."
 *    - isValid = true (cho phép đặt)
 * 
 * 2. High-power charger (≥150kW) + Small battery (<60kWh):
 *    - Warning: "Lưu ý: Đây là sạc siêu nhanh (150kW+). Xe của bạn có thể không tận dụng hết công suất này."
 *    - isValid = true
 * 
 * Helper methods:
 * 
 * - isStatusAvailable(status): Boolean
 *   Chỉ return true nếu status === 'Available'
 * 
 * - getStatusMessage(status): string
 *   Trả về message tiếng Việt cho từng status
 * 
 * - checkConnectorCompatibility(pointConnector, vehicles): { compatible, message }
 *   Kiểm tra xe có tương thích với connector không
 * 
 * - areConnectorsCompatible(vehicleConnector, pointConnector): boolean
 *   So sánh 2 connector types
 * 
 * - getConnectorDisplayName(connectorType): string
 *   Format: "CCS2" → "CCS Type 2 (DC Fast)"
 * 
 * Dependencies:
 * - Vehicle interface với connector_types relation
 * - ChargingPoint interface
 * - User interface
 */

/**
 * Booking Validation Service
 * Validates all conditions before allowing a user to book a charging point
 */

import { User } from '../data/mockDatabase';
import { ChargingPoint } from '../api/chargingPointsApi';
import { Vehicle } from '../api/vehicleApi';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class BookingValidationService {
  /**
   * Validate if user can book a charging point
   */
  static validateBooking(
    user: User | null,
    chargingPoint: ChargingPoint | null,
    userVehicles: Vehicle[]
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Check authentication
    if (!user) {
      errors.push('Bạn cần đăng nhập để đặt chỗ');
      return { isValid: false, errors, warnings };
    }

    // 2. Check if user has added a vehicle
    if (userVehicles.length === 0) {
      errors.push('Bạn cần thêm xe vào tài khoản trước khi đặt chỗ');
      return { isValid: false, errors, warnings };
    }

    // 3. If specific charging point is selected, validate it
    if (chargingPoint) {
      // Check charging point status
      if (!this.isStatusAvailable(chargingPoint.status)) {
        const statusMessage = this.getStatusMessage(chargingPoint.status);
        errors.push(`Điểm sạc này không khả dụng. ${statusMessage}`);
        return { isValid: false, errors, warnings };
      }

      // Check connector compatibility
      const isCompatible = this.checkConnectorCompatibility(
        chargingPoint.connector_type,
        userVehicles
      );

      if (!isCompatible.compatible) {
        errors.push(isCompatible.message);
        return { isValid: false, errors, warnings };
      }

      // Add warning if connector type not fully set up
      if (isCompatible.message) {
        warnings.push(isCompatible.message);
      }

      // Add warnings if vehicle battery is too small for high-power charger
      if (chargingPoint.power_kw >= 150) {
        const hasLargeBattery = userVehicles.some(
          v => (v.battery_capacity_kwh || 0) >= 60
        );
        if (!hasLargeBattery) {
          warnings.push(
            'Lưu ý: Đây là sạc siêu nhanh (150kW+). Xe của bạn có thể không tận dụng hết công suất này.'
          );
        }
      }
    }

    return {
      isValid: true,
      errors,
      warnings
    };
  }

  /**
   * Check if status allows booking
   */
  private static isStatusAvailable(status: string): boolean {
    return status === 'Available';
  }

  /**
   * Get user-friendly status message
   */
  private static getStatusMessage(status: string): string {
    switch (status) {
      case 'Occupied':
        return 'Đang có xe đang sạc.';
      case 'Reserved':
        return 'Đã có người đặt chỗ trước.';
      case 'AlmostDone':
        return 'Đang có xe sạc (sắp xong).';
      case 'Maintenance':
        return 'Đang bảo trì.';
      case 'Faulted':
        return 'Điểm sạc đang gặp lỗi kỹ thuật.';
      default:
        return 'Trạng thái: ' + status;
    }
  }

  /**
   * Check if user's vehicle connector is compatible with charging point
   */
  private static checkConnectorCompatibility(
    chargingPointConnector: string,
    userVehicles: Vehicle[]
  ): { compatible: boolean; message: string } {
    console.log('🔌 Checking connector compatibility:', {
      chargingPointConnector,
      vehiclesCount: userVehicles.length,
      vehicles: userVehicles.map(v => ({
        id: v.vehicle_id,
        connectorTypeId: v.connector_type_id,
        connectorTypes: v.connector_types
      }))
    });

    // If no vehicles have connector type defined, allow booking with warning
    const vehiclesWithConnector = userVehicles.filter(v => v.connector_type_id);
    
    if (vehiclesWithConnector.length === 0) {
      console.log('⚠️ No vehicles with connector type defined, allowing with warning');
      return {
        compatible: true,
        message: 'Cảnh báo: Bạn chưa cập nhật loại đầu sạc cho xe. Vui lòng kiểm tra tính tương thích.'
      };
    }

    // Check if any vehicle is compatible
    // Note: This requires connector_types relation to be loaded
    const hasCompatibleVehicle = userVehicles.some(vehicle => {
      if (!vehicle.connector_types) {
        console.log('⚠️ Vehicle missing connector_types relation:', vehicle.vehicle_id);
        return false;
      }
      
      const connectorName = vehicle.connector_types.name;
      const isCompat = this.areConnectorsCompatible(
        connectorName,
        chargingPointConnector
      );
      
      console.log(`🔍 Checking vehicle ${vehicle.vehicle_id}: ${connectorName} vs ${chargingPointConnector} = ${isCompat}`);
      return isCompat;
    });

    if (!hasCompatibleVehicle) {
      console.log('❌ No compatible vehicles found');
      return {
        compatible: false,
        message: `Đầu sạc ${chargingPointConnector} không tương thích với xe của bạn. Vui lòng chọn điểm sạc khác.`
      };
    }

    console.log('✅ Compatible vehicle found');
    return {
      compatible: true,
      message: ''
    };
  }

  /**
   * Check if two connector types are compatible
   */
  private static areConnectorsCompatible(
    vehicleConnector: string,
    chargingPointConnector: string
  ): boolean {
    // Check for null/undefined connectors
    if (!vehicleConnector || !chargingPointConnector) {
      console.warn('⚠️ Missing connector type:', { vehicleConnector, chargingPointConnector });
      return false;
    }
    
    // Normalize connector names
    const normalize = (str: string) => str.toLowerCase().replace(/[\s-]/g, '');
    const vConn = normalize(vehicleConnector);
    const cpConn = normalize(chargingPointConnector);

    // Exact match
    if (vConn === cpConn) return true;

    // CCS compatibility (CCS1 and CCS2 are often compatible)
    if ((vConn.includes('ccs') && cpConn.includes('ccs'))) return true;

    // CHAdeMO compatibility
    if (vConn.includes('chademo') && cpConn.includes('chademo')) return true;

    // Type 2 / J1772 compatibility for AC charging
    if ((vConn.includes('type2') || vConn.includes('j1772')) &&
        (cpConn.includes('type2') || cpConn.includes('j1772'))) {
      return true;
    }

    // Tesla compatibility (if station has Tesla connector)
    if (vConn.includes('tesla') && cpConn.includes('tesla')) return true;

    return false;
  }

  /**
   * Validate booking for station (any available point)
   */
  static validateStationBooking(
    user: User | null,
    hasAvailablePoints: boolean,
    userVehicles: Vehicle[]
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Check authentication
    if (!user) {
      errors.push('Bạn cần đăng nhập để đặt chỗ');
      return { isValid: false, errors, warnings };
    }

    // 2. Check if user has added a vehicle
    if (userVehicles.length === 0) {
      errors.push('Bạn cần thêm xe vào tài khoản trước khi đặt chỗ');
      return { isValid: false, errors, warnings };
    }

    // 3. Check if station has available points
    if (!hasAvailablePoints) {
      errors.push('Trạm này hiện không có điểm sạc nào khả dụng. Vui lòng chọn trạm khác hoặc thử lại sau.');
      return { isValid: false, errors, warnings };
    }

    return {
      isValid: true,
      errors,
      warnings
    };
  }

  /**
   * Get connector type display name
   */
  static getConnectorDisplayName(connectorType: string): string {
    const mapping: Record<string, string> = {
      'CCS1': 'CCS Type 1 (DC Fast)',
      'CCS2': 'CCS Type 2 (DC Fast)',
      'CHAdeMO': 'CHAdeMO (DC Fast)',
      'Type 2': 'Type 2 / Mennekes (AC)',
      'J1772': 'J1772 / Type 1 (AC)',
      'Tesla': 'Tesla Supercharger',
      'GB/T': 'GB/T (China Standard)'
    };

    return mapping[connectorType] || connectorType;
  }
}
