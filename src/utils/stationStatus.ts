/**
 * ===============================================================
 * STATION STATUS UTILS (TIỆN ÍCH TRẠNG THÁI TRẠM)
 * ===============================================================
 * Utilities tính toán và hiển thị trạng thái trạm sạc
 * 
 * Chức năng:
 * - 🟢 Xác định trạng thái trạm (available/limited/full/maintenance)
 * - 🎨 Cung cấp màu sắc, icon, label cho UI
 * - ⏳ Kiểm tra xe sắp sạc xong (trong 10 phút)
 * - 🗺️ Tạo marker colors cho bản đồ
 * - ✅ Kiểm tra có thể đặt chỗ không
 * 
 * Status types:
 * 1. available (Còn chỗ): 
 *    - available > 30% total
 *    - Color: Green (#22c55e)
 *    - Icon: ✅
 * 
 * 2. limited (Sắp đầy):
 *    - 0 < available <= 30% total
 *    - Color: Yellow (#eab308)
 *    - Icon: ⚠️
 * 
 * 3. full (Hết chỗ):
 *    - available = 0
 *    - Không có xe sắp xong
 *    - Color: Red (#ef4444)
 *    - Icon: 🔴
 * 
 * 4. maintenance (Bảo trì):
 *    - station.status = 'maintenance' hoặc 'offline'
 *    - Color: Gray (#9ca3af)
 *    - Icon: 🔧
 * 
 * Special case "Sắp có chỗ":
 * - available = 0 NHƯNG có xe sắp sạc xong (< 10 phút)
 * - Status: limited
 * - Label: "Sắp có chỗ"
 * - Icon: ⏳
 * 
 * Functions:
 * 
 * 1. getStationStatus(station): StationStatusInfo
 *    - Trả về đầy đủ info: status, color, bgColor, textColor, label, icon
 *    - Logic:
 *      * Kiểm tra maintenance/offline → return maintenance
 *      * Tính availabilityRate = available / total
 *      * Nếu available = 0:
 *        - checkChargingSoon() → return limited ("Sắp có chỗ")
 *        - Ngược lại → return full
 *      * Nếu availabilityRate <= 0.3 → return limited
 *      * Ngược lại → return available
 * 
 * 2. checkChargingSoon(station): boolean
 *    - Kiểm tra có charging point nào status='in-use' VÀ estimatedTimeRemaining <= 10
 *    - Fallback: 20% random nếu không có data
 * 
 * 3. getMarkerColor(station): string
 *    - Return hex color cho marker trên map
 * 
 * 4. getStatusBadgeClasses(station): string
 *    - Return Tailwind classes cho badge (bg-green-100 text-green-800)
 * 
 * 5. getStatusLabel(station): string
 *    - Return label tiếng Việt ("Còn chỗ", "Sắp đầy", etc.)
 * 
 * 6. getStatusIcon(station): string
 *    - Return emoji icon (✅, ⚠️, 🔴, 🔧)
 * 
 * 7. canBookStation(station): boolean
 *    - Return true nếu status = available HOẶC limited
 *    - Return false nếu full hoặc maintenance
 * 
 * Use cases:
 * - Station list: Hiển thị badge trạng thái
 * - Map markers: Tô màu marker theo trạng thái
 * - Booking validation: Kiểm tra có thể đặt chỗ không
 * - Real-time updates: Cập nhật UI khi trạng thái thay đổi
 * 
 * Dependencies:
 * - Station interface với chargingPoints relation
 */

import { Station } from '../data/mockDatabase';

export type StationStatusType = 'available' | 'limited' | 'full' | 'maintenance';

export interface StationStatusInfo {
  status: StationStatusType;
  color: string;
  bgColor: string;
  textColor: string;
  label: string;
  icon: string;
}

/**
 * Xác định trạng thái trạm sạc dựa trên:
 * - Số chỗ còn trống
 * - Trạng thái bảo trì
 * - Xe sắp sạc xong (dự kiến trong 10 phút)
 */
export function getStationStatus(station: Station): StationStatusInfo {
  // Kiểm tra nếu đang bảo trì hoặc xây dựng
  if (station.status === 'maintenance' || station.status === 'offline') {
    return {
      status: 'maintenance',
      color: '#9ca3af', // gray-400
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-800',
      label: 'Bảo trì',
      icon: '🔧'
    };
  }

  // Tính tỷ lệ chỗ trống
  const availabilityRate = station.available / station.total;
  
  // Hết chỗ
  if (station.available === 0) {
    // Kiểm tra xem có xe nào sắp sạc xong không (trong vòng 10 phút)
    const hasChargingSoon = checkChargingSoon(station);
    
    if (hasChargingSoon) {
      return {
        status: 'limited',
        color: '#eab308', // yellow-500
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        label: 'Sắp có chỗ',
        icon: '⏳'
      };
    }
    
    return {
      status: 'full',
      color: '#ef4444', // red-500
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      label: 'Hết chỗ',
      icon: '🔴'
    };
  }

  // Còn ít chỗ (dưới 30%)
  if (availabilityRate <= 0.3) {
    return {
      status: 'limited',
      color: '#eab308', // yellow-500
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      label: 'Sắp đầy',
      icon: '⚠️'
    };
  }

  // Còn nhiều chỗ
  return {
    status: 'available',
    color: '#22c55e', // green-500
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    label: 'Còn chỗ',
    icon: '✅'
  };
}

/**
 * Kiểm tra xem có xe nào sắp sạc xong trong 10 phút không
 */
function checkChargingSoon(station: Station): boolean {
  // Nếu có chargingPoints, kiểm tra thời gian còn lại
  if (station.chargingPoints && station.chargingPoints.length > 0) {
    return station.chargingPoints.some(point => 
      point.status === 'in-use' && 
      point.estimatedTimeRemaining !== undefined &&
      point.estimatedTimeRemaining <= 10
    );
  }
  
  // Giả lập: 20% khả năng có xe sắp sạc xong nếu đầy
  return Math.random() < 0.2;
}

/**
 * Lấy màu marker cho bản đồ
 */
export function getMarkerColor(station: Station): string {
  const statusInfo = getStationStatus(station);
  return statusInfo.color;
}

/**
 * Lấy thông tin hiển thị cho badge
 */
export function getStatusBadgeClasses(station: Station): string {
  const statusInfo = getStationStatus(station);
  return `${statusInfo.bgColor} ${statusInfo.textColor}`;
}

/**
 * Lấy label hiển thị
 */
export function getStatusLabel(station: Station): string {
  const statusInfo = getStationStatus(station);
  return statusInfo.label;
}

/**
 * Lấy icon cho trạng thái
 */
export function getStatusIcon(station: Station): string {
  const statusInfo = getStationStatus(station);
  return statusInfo.icon;
}

/**
 * Kiểm tra xem có thể đặt chỗ không
 */
export function canBookStation(station: Station): boolean {
  const statusInfo = getStationStatus(station);
  return statusInfo.status === 'available' || statusInfo.status === 'limited';
}
