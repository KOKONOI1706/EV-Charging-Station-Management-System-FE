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
