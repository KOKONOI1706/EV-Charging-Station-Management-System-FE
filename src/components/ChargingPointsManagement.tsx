/**
 * ========================================
 * CHARGING POINTS MANAGEMENT COMPONENT
 * ========================================
 * Component quản lý các điểm sạc cho Staff và Admin
 * 
 * Chức năng:
 * - Hiển thị danh sách điểm sạc theo trạm
 * - Cập nhật trạng thái điểm sạc (Available, In Use, Maintenance, Offline)
 * - Refresh danh sách real-time
 * - Phân quyền: Staff chỉ thấy trạm được assign, Admin thấy tất cả
 * 
 * Trạng thái điểm sạc:
 * - Available: Sẵn sàng sử dụng
 * - In Use: Đang được sử dụng
 * - Reserved: Đã đặt chỗ
 * - Maintenance: Đang bảo trì
 * - Offline: Mất kết nối
 */

// Import React hooks
import { useState, useEffect } from 'react';

// Import UI components
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

// Import icons
import { 
  Zap,           // Icon sạc điện
  Wrench,        // Icon bảo trì
  CheckCircle,   // Icon hoàn thành
  XCircle,       // Icon lỗi
  AlertTriangle, // Icon cảnh báo
  RefreshCw      // Icon làm mới
} from 'lucide-react';

// Import thông báo toast
import { toast } from 'sonner';

// Lấy API URL từ environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Interface định nghĩa cấu trúc dữ liệu điểm sạc
 */
interface ChargingPoint {
  point_id: number;          // ID của điểm sạc
  station_id: string;        // ID trạm sạc
  name: string;              // Tên điểm sạc
  power_kw: number;          // Công suất (kW)
  connector_type: string;    // Loại đầu sạc
  status: 'Available' | 'In Use' | 'Reserved' | 'Maintenance' | 'Offline'; // Trạng thái
  last_seen_at?: string;     // Thời gian nhìn thấy lần cuối
  updated_at?: string;       // Thời gian cập nhật
  stations?: {               // Thông tin trạm (optional)
    id: string;
    name: string;
    address: string;
  };
}

/**
 * Interface props của component
 */
interface ChargingPointsManagementProps {
  stationId?: string;                // ID trạm (cho Staff - chỉ quản lý 1 trạm)
  userRole: 'staff' | 'admin';       // Vai trò: staff hoặc admin
}

export function ChargingPointsManagement({ stationId, userRole }: ChargingPointsManagementProps) {
  const [chargingPoints, setChargingPoints] = useState<ChargingPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  // Fetch charging points
  const fetchChargingPoints = async () => {
    try {
      setLoading(true);
      const url = stationId 
        ? `${API_URL}/charging-points?station_id=${stationId}`
        : `${API_URL}/charging-points`;
      
      const response = await fetch(url);
      const result = await response.json();
      
      if (result.success) {
        setChargingPoints(result.data || []);
      } else {
        toast.error('Failed to fetch charging points');
      }
    } catch (error) {
      console.error('Error fetching charging points:', error);
      toast.error('Error loading charging points');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userRole === 'staff' && !stationId) {
      console.log('Staff must have station selected');
      return;
    }
    fetchChargingPoints();
  }, [stationId, userRole]);

  // Update charging point status
  const updateStatus = async (pointId: number, newStatus: ChargingPoint['status']) => {
    try {
      setUpdating(pointId);
      
      const response = await fetch(`${API_URL}/charging-points/${pointId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success(`Charging point status updated to ${newStatus}`);
        fetchChargingPoints(); // Refresh list
      } else {
        toast.error(result.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error updating charging point status');
    } finally {
      setUpdating(null);
    }
  };

  // Get status badge color
  const getStatusColor = (status: ChargingPoint['status']) => {
    switch (status) {
      case 'Available':
        return 'bg-green-100 text-green-800';
      case 'In Use':
        return 'bg-red-100 text-red-800';
      case 'Reserved':
        return 'bg-blue-100 text-blue-800';
      case 'Maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'Offline':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status icon
  const getStatusIcon = (status: ChargingPoint['status']) => {
    switch (status) {
      case 'Available':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'In Use':
        return <Zap className="w-4 h-4 text-red-600" />;
      case 'Reserved':
        return <Zap className="w-4 h-4 text-blue-600" />;
      case 'Maintenance':
        return <Wrench className="w-4 h-4 text-yellow-600" />;
      case 'Offline':
        return <XCircle className="w-4 h-4 text-gray-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  // Count by status
  const statusCounts = {
    available: chargingPoints.filter(cp => cp.status === 'Available').length,
    inUse: chargingPoints.filter(cp => cp.status === 'In Use').length,
    maintenance: chargingPoints.filter(cp => cp.status === 'Maintenance').length,
    offline: chargingPoints.filter(cp => cp.status === 'Offline').length,
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Loading charging points...</p>
        </CardContent>
      </Card>
    );
  }

  if (userRole === 'staff' && !stationId) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
          <p className="text-gray-600">Please select a station to view charging points</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Available</p>
                <p className="text-2xl font-bold">{statusCounts.available}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Zap className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">In Use</p>
                <p className="text-2xl font-bold">{statusCounts.inUse}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Wrench className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Maintenance</p>
                <p className="text-2xl font-bold">{statusCounts.maintenance}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <XCircle className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Offline</p>
                <p className="text-2xl font-bold">{statusCounts.offline}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charging Points List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Charging Points</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchChargingPoints}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {chargingPoints.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No charging points found
            </div>
          ) : (
            <div className="space-y-3">
              {chargingPoints.map((point) => (
                <Card key={point.point_id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {getStatusIcon(point.status)}
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{point.name}</h4>
                            <Badge className={getStatusColor(point.status)}>
                              {point.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            {point.power_kw} kW • {point.connector_type}
                            {userRole === 'admin' && point.stations && (
                              <> • {point.stations.name}</>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Available → Maintenance */}
                        {point.status === 'Available' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatus(point.point_id, 'Maintenance')}
                            disabled={updating === point.point_id}
                          >
                            <Wrench className="w-4 h-4 mr-2" />
                            Set Maintenance
                          </Button>
                        )}

                        {/* Maintenance → Available */}
                        {point.status === 'Maintenance' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-green-50 hover:bg-green-100"
                            onClick={() => updateStatus(point.point_id, 'Available')}
                            disabled={updating === point.point_id}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Set Available
                          </Button>
                        )}

                        {/* Offline → Available */}
                        {point.status === 'Offline' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatus(point.point_id, 'Available')}
                            disabled={updating === point.point_id}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Set Available
                          </Button>
                        )}

                        {/* In Use - Cannot change manually */}
                        {point.status === 'In Use' && (
                          <Badge variant="secondary" className="bg-red-50 text-red-700">
                            Currently Charging
                          </Badge>
                        )}

                        {updating === point.point_id && (
                          <RefreshCw className="w-4 h-4 animate-spin text-gray-400" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
