/**
 * ===============================================================
 * STATION DETAIL VIEW (XEM CHI TIẾT TRẠM SẠC)
 * ===============================================================
 * Component hiển thị thông tin chi tiết trạm sạc + interactive layout
 * 
 * Chức năng:
 * - 📍 Hiển thị thông tin trạm: Tên, địa chỉ, giờ mở cửa, số điện thoại
 * - 🔌 Danh sách charging points với trạng thái real-time
 * - 🗺️ Interactive station layout (sơ đồ trạm 2D)
 * - 🔄 Auto-refresh status mỗi 30s
 * - 👁️ Click charging point → Hiển thị thông tin chi tiết
 * - 🚗 Kiểm tra tương thích xe của user với connector
 * - 🎯 Nút "Đặt chỗ" cho từng charging point
 * - ← Nút "Quay lại" danh sách trạm
 * 
 * Props:
 * - station: Station object (từ StationFinder)
 * - onBack: Callback quay lại list view
 * - onBookChargingPoint: Callback đặt chỗ (station, chargingPointId)
 * 
 * Data loading:
 * 1. Load charging points từ backend (getStationChargingPoints API)
 * 2. Load user vehicles (nếu đã đăng nhập)
 * 3. Auto-refresh mỗi 30s để cập nhật trạng thái
 * 
 * Charging Point Card:
 * - Tên điểm sạc (Point A1, Point B2, etc.)
 * - Trạng thái: Available / Occupied / AlmostDone / Offline / Maintenance
 * - Công suất (kW)
 * - Loại đầu cắm (Type 2, CCS, CHAdeMO)
 * - Compatibility badge (nếu xe của user tương thích)
 * - Nút "Đặt chỗ" (chỉ active nếu Available)
 * 
 * Interactive Layout:
 * - Canvas 2D hiển thị sơ đồ trạm
 * - Charging points được hiển thị tại vị trí (pos_x, pos_y)
 * - Facilities: Tường, cửa, bãi đậu xe, toilet, etc.
 * - Click point → Highlight + scroll to info
 * - Màu sắc theo status
 * 
 * Compatibility check:
 * - So sánh connector_type_id của point với vehicles của user
 * - Hiển thị badge "Tương thích với [Plate Number]" nếu match
 * - Warning nếu không tương thích
 * 
 * Status colors:
 * - Available: Green
 * - Occupied: Blue
 * - AlmostDone: Yellow/Orange (cảnh báo idle fee)
 * - Offline: Gray
 * - Maintenance: Red
 * 
 * Dependencies:
 * - chargingPointsApi: Lấy charging points từ backend
 * - vehicleApi: Lấy xe của user
 * - InteractiveStationLayout: Component render layout 2D
 * - useAuth: Kiểm tra user authentication
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  ArrowLeft, 
  Zap, 
  Clock, 
  MapPin,
  Phone,
  Star,
  RefreshCw
} from 'lucide-react';
import { Station } from '../data/mockDatabase';
import { ChargingPoint as ApiChargingPoint, getStationChargingPoints } from '../api/chargingPointsApi';
import { useAuth } from '../contexts/AuthContext';
import { vehicleApi, Vehicle } from '../api/vehicleApi';
import { InteractiveStationLayout } from './InteractiveStationLayout';

interface StationDetailViewProps {
  station: Station;
  onBack: () => void;
  onBookChargingPoint: (station: Station, chargingPointId?: string) => void;
}

export function StationDetailView({ station, onBack, onBookChargingPoint }: StationDetailViewProps) {
  const { user } = useAuth();
  const [realChargingPoints, setRealChargingPoints] = useState<ApiChargingPoint[]>([]);
  const [userVehicles, setUserVehicles] = useState<Vehicle[]>([]);
  const [isLoadingPoints, setIsLoadingPoints] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<ApiChargingPoint | null>(null);

  // Fetch real charging points from backend
  useEffect(() => {
    loadChargingPoints();
    
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      loadChargingPoints(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [station.id]);

  // Load user vehicles if authenticated
  useEffect(() => {
    if (user) {
      loadUserVehicles();
    }
  }, [user]);

  const loadChargingPoints = async (isRefresh = false) => {
    try {
      if (!isRefresh) {
        setIsLoadingPoints(true);
      } else {
        setIsRefreshing(true);
      }
      
      const points = await getStationChargingPoints(station.id);
      setRealChargingPoints(points);
      console.log('✅ Loaded charging points with status:', points);
    } catch (error) {
      console.error('Error loading charging points:', error);
    } finally {
      setIsLoadingPoints(false);
      setIsRefreshing(false);
    }
  };

  const loadUserVehicles = async () => {
    if (!user) return;
    
    try {
      const userId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
      const vehicles = await vehicleApi.getUserVehicles(userId);
      setUserVehicles(vehicles);
    } catch (error) {
      console.error('Error loading user vehicles:', error);
    }
  };

  // Convert layout facilities to InteractiveStationLayout format
  const convertToInteractiveFacilities = (layoutFacilities: any[]) => {
    if (!layoutFacilities) return [];
    return layoutFacilities.map((f: any, index: number) => ({
      id: `facility-${f.type}-${f.x}-${f.y}-${index}`,
      type: f.type,
      name: `${f.type.charAt(0).toUpperCase() + f.type.slice(1)} ${index + 1}`,
      pos_x: f.x * 60 + 30,
      pos_y: f.y * 60 + 30,
    }));
  };

  // Handle charging point click
  const handleChargingPointClick = (point: ApiChargingPoint) => {
    setSelectedPoint(point);
    // Auto-scroll to selected point info
    const element = document.getElementById('selected-point-info');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  // Handle book selected point
  const handleBookSelectedPoint = () => {
    if (selectedPoint) {
      onBookChargingPoint(station, selectedPoint.point_id.toString());
      setSelectedPoint(null);
    }
  };

  // Calculate status counts from real data
  const availablePoints = realChargingPoints.filter(p => p.status === 'Available');
  const occupiedPoints = realChargingPoints.filter(p => p.status === 'Occupied' || p.status === 'AlmostDone');
  const reservedPoints = realChargingPoints.filter(p => p.status === 'Reserved');
  const maintenancePoints = realChargingPoints.filter(p => p.status === 'Maintenance');
  const faultedPoints = realChargingPoints.filter(p => p.status === 'Faulted');

  return (
    <div className="space-y-6">
      {/* Header with Image */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Map
        </Button>
      </div>

      {/* Station Image Banner */}
      <div className="w-full h-64 rounded-xl overflow-hidden shadow-lg">
        <img
          src={station.image}
          alt={station.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/1200x400?text=Charging+Station';
          }}
        />
      </div>

      {/* Station Title and Book Button */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{station.name}</h1>
          <p className="text-gray-600 flex items-center gap-2 mt-1">
            <MapPin className="w-4 h-4" />
            {station.address}
          </p>
          {selectedPoint && (
            <div className="mt-2">
              <Badge className="bg-green-100 text-green-800 text-sm">
                ✓ {selectedPoint.name} selected
              </Badge>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          {selectedPoint && selectedPoint.status === 'Available' && (
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={handleBookSelectedPoint}
            >
              <Zap className="w-4 h-4 mr-2" />
              Book {selectedPoint.name}
            </Button>
          )}
          <Button 
            variant={selectedPoint ? "outline" : "default"}
            className={!selectedPoint ? "bg-green-600 hover:bg-green-700" : ""}
            onClick={() => onBookChargingPoint(station)}
          >
            Book Any Available
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Station Layout */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Station Layout
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Click on a charging point to select it for booking
              </p>
            </CardHeader>
            <CardContent>
              {/* Use Interactive Station Layout (Read-Only) */}
              <div style={{ height: '800px' }}>
                <InteractiveStationLayout
                  stationId={station.id}
                  stationName={station.name}
                  isReadOnly={true}
                  facilities={convertToInteractiveFacilities(station.layout?.facilities || [])}
                  onChargingPointClick={handleChargingPointClick}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Station Info */}
        <div className="space-y-6">
          {/* Selected Charging Point Info */}
          {selectedPoint && (
            <Card id="selected-point-info" className="border-2 border-green-500 shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="w-5 h-5 text-green-600" />
                    Selected Charging Point
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedPoint(null)}
                  >
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Name:</span>
                    <span className="text-sm font-bold">{selectedPoint.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Power:</span>
                    <span className="text-sm">{selectedPoint.power_kw} kW</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Connector:</span>
                    <span className="text-sm">{selectedPoint.connector_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Status:</span>
                    <Badge 
                      className={
                        selectedPoint.status === 'Available' 
                          ? 'bg-green-100 text-green-800'
                          : selectedPoint.status === 'Reserved'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }
                    >
                      {selectedPoint.status}
                    </Badge>
                  </div>
                </div>
                {selectedPoint.status === 'Available' ? (
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={handleBookSelectedPoint}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Book This Point
                  </Button>
                ) : (
                  <div className="text-sm text-gray-600 text-center p-3 bg-gray-50 rounded">
                    This charging point is currently {selectedPoint.status.toLowerCase()}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Status Summary */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Trạng thái điểm sạc</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => loadChargingPoints(true)}
                disabled={isRefreshing}
                className="h-8 px-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingPoints ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Đang tải...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Sẵn sàng:</span>
                    <Badge className="bg-green-100 text-green-800">
                      {availablePoints.length} điểm
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Đang sử dụng:</span>
                    <Badge className="bg-red-100 text-red-800">
                      {occupiedPoints.length} điểm
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Đã đặt chỗ:</span>
                    <Badge className="bg-blue-100 text-blue-800">
                      {reservedPoints.length} điểm
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Bảo trì:</span>
                    <Badge className="bg-orange-100 text-orange-800">
                      {maintenancePoints.length} điểm
                    </Badge>
                  </div>
                  {faultedPoints.length > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Lỗi:</span>
                      <Badge className="bg-purple-100 text-purple-800">
                        {faultedPoints.length} điểm
                      </Badge>
                    </div>
                  )}
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Tổng số điểm:</span>
                      <span className="font-bold">{realChargingPoints.length || station.total}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Station Details */}
          <Card>
            <CardHeader>
              <CardTitle>Station Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-green-600" />
                  <span>Power: {station.power}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>Rating: {station.rating}/5</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>{station.operatingHours}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-purple-600" />
                  <span>{station.phone}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Amenities */}
          <Card>
            <CardHeader>
              <CardTitle>Amenities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {station.amenities.map((amenity, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {amenity}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => onBookChargingPoint(station)}
                >
                  Book Now
                </Button>
                <Button variant="outline" className="w-full">
                  Get Directions
                </Button>
                <Button variant="outline" className="w-full">
                  Call Station
                </Button>
                <Button variant="outline" className="w-full">
                  Report Issue
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}