import { Badge } from './ui/badge';
import { Zap, AlertCircle, Clock, Wrench, XCircle, Activity } from 'lucide-react';

type ChargingStatus = 'Available' | 'Occupied' | 'Reserved' | 'AlmostDone' | 'Maintenance' | 'Faulted';

interface ChargingPointStatusBadgeProps {
  status: ChargingStatus | string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export function ChargingPointStatusBadge({ 
  status, 
  size = 'md',
  showIcon = true 
}: ChargingPointStatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Available':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: <Zap className="w-3 h-3" />,
          text: 'Available',
          textVi: 'Sẵn sàng'
        };
      case 'InUse':  // Database ENUM value
      case 'Occupied':  // Legacy value
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: <Activity className="w-3 h-3" />,
          text: 'In Use',
          textVi: 'Đang sử dụng'
        };
      case 'Reserved':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: <Clock className="w-3 h-3" />,
          text: 'Reserved',
          textVi: 'Đã đặt chỗ'
        };
      case 'AlmostDone':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: <Clock className="w-3 h-3" />,
          text: 'Almost Done',
          textVi: 'Sắp xong'
        };
      case 'Maintenance':
        return {
          color: 'bg-orange-100 text-orange-800 border-orange-200',
          icon: <Wrench className="w-3 h-3" />,
          text: 'Maintenance',
          textVi: 'Bảo trì'
        };
      case 'Faulted':
        return {
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: <XCircle className="w-3 h-3" />,
          text: 'Faulted',
          textVi: 'Lỗi'
        };
      case 'Offline':
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: <XCircle className="w-3 h-3" />,
          text: 'Offline',
          textVi: 'Ngoại tuyến'
        };
      // Legacy status mapping for backward compatibility
      case 'available':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: <Zap className="w-3 h-3" />,
          text: 'Available',
          textVi: 'Sẵn sàng'
        };
      case 'in-use':
      case 'In Use':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: <Activity className="w-3 h-3" />,
          text: 'In Use',
          textVi: 'Đang sử dụng'
        };
      case 'maintenance':
        return {
          color: 'bg-orange-100 text-orange-800 border-orange-200',
          icon: <Wrench className="w-3 h-3" />,
          text: 'Maintenance',
          textVi: 'Bảo trì'
        };
      case 'offline':
      case 'Offline':
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: <XCircle className="w-3 h-3" />,
          text: 'Offline',
          textVi: 'Ngoại tuyến'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: <AlertCircle className="w-3 h-3" />,
          text: status || 'Unknown',
          textVi: 'Không xác định'
        };
    }
  };

  const config = getStatusConfig(status);
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  return (
    <Badge className={`${config.color} border ${sizeClasses[size]} font-medium`}>
      <div className="flex items-center gap-1.5">
        {showIcon && config.icon}
        <span>{config.textVi}</span>
      </div>
    </Badge>
  );
}

/**
 * Get background color class for status (for use in styled components)
 */
export function getStatusColorClass(status: string): string {
  switch (status) {
    case 'Available':
      return 'bg-green-500 hover:bg-green-600';
    case 'InUse':  // Database ENUM value
    case 'Occupied':  // Legacy frontend value
      return 'bg-red-500';
    case 'Reserved':
      return 'bg-blue-500';
    case 'AlmostDone':
      return 'bg-yellow-500';
    case 'Maintenance':
      return 'bg-orange-500';
    case 'Faulted':
      return 'bg-purple-500';
    case 'Offline':
      return 'bg-gray-500';
    // Legacy status (lowercase)
    case 'available':
      return 'bg-green-500 hover:bg-green-600';
    case 'in-use':
    case 'In Use':
      return 'bg-red-500';
    case 'maintenance':
      return 'bg-orange-500';
    case 'offline':
      return 'bg-gray-500';
    default:
      return 'bg-gray-400';
  }
}

/**
 * Check if a charging point status allows booking
 */
export function isStatusBookable(status: string): boolean {
  return status === 'Available' || status === 'available';
}
