import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  ArrowLeft, 
  Zap, 
  Clock, 
  User, 
  Wrench, 
  MapPin,
  Phone,
  Star,
  Car,
  Coffee,
  // Restroom,
  ShoppingBag,
  Info,
  Navigation,
  RefreshCw
} from 'lucide-react';
import { Station, ChargingPoint } from '../data/mockDatabase';
import { ChargingPoint as ApiChargingPoint, getStationChargingPoints } from '../api/chargingPointsApi';
import { ChargingPointStatusBadge, getStatusColorClass, isStatusBookable } from './ChargingPointStatusBadge';
import { useAuth } from '../contexts/AuthContext';
import { vehicleApi, Vehicle } from '../api/vehicleApi';
import { BookingValidationService } from '../services/bookingValidationService';

interface StationDetailViewProps {
  station: Station;
  onBack: () => void;
  onBookChargingPoint: (station: Station, chargingPointId?: string) => void;
}

export function StationDetailView({ station, onBack, onBookChargingPoint }: StationDetailViewProps) {
  const { user } = useAuth();
  const [selectedChargingPoint, setSelectedChargingPoint] = useState<ChargingPoint | null>(null);
  const [realChargingPoints, setRealChargingPoints] = useState<ApiChargingPoint[]>([]);
  const [userVehicles, setUserVehicles] = useState<Vehicle[]>([]);
  const [isLoadingPoints, setIsLoadingPoints] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  // Merge real status data with layout data
  const getMergedChargingPoint = (layoutPoint: ChargingPoint): ChargingPoint & { realStatus?: string; realData?: ApiChargingPoint } => {
    const realPoint = realChargingPoints.find(
      rp => rp.point_id.toString() === layoutPoint.id.replace('cp-', '')
    );

    if (realPoint) {
      return {
        ...layoutPoint,
        status: realPoint.status as any,
        realStatus: realPoint.status,
        realData: realPoint
      };
    }

    return layoutPoint;
  };

  const handleBookPoint = (point: ChargingPoint) => {
    // Find real charging point data
    const realPoint = realChargingPoints.find(
      rp => rp.point_id.toString() === point.id.replace('cp-', '')
    );

    // Validate booking
    const validation = BookingValidationService.validateBooking(
      user,
      realPoint || null,
      userVehicles
    );

    if (!validation.isValid) {
      alert(validation.errors.join('\n'));
      return;
    }

    if (validation.warnings.length > 0) {
      const proceed = confirm(
        validation.warnings.join('\n') + '\n\nBạn có muốn tiếp tục không?'
      );
      if (!proceed) return;
    }

    // Proceed with booking
    onBookChargingPoint(station, point.id);
  };

  const getFacilityIcon = (type: string) => {
    switch (type) {
      case 'restroom':
        return <Info className="w-4 h-4" />;
      case 'cafe':
        return <Coffee className="w-4 h-4" />;
      case 'shop':
        return <ShoppingBag className="w-4 h-4" />;
      case 'parking':
        return <Car className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const renderStationLayout = () => {
    const { layout, chargingPoints } = station;
    const cellSize = 60; // Size of each grid cell in pixels
    
    // Create map of real point IDs to statuses for quick lookup
    const realPointStatusMap = new Map(
      realChargingPoints.map(rp => [rp.point_id, rp.status])
    );
    
    console.log('🗺️ Rendering layout with real status map:', {
      mapSize: realPointStatusMap.size,
      entries: Array.from(realPointStatusMap.entries()).slice(0, 5),
      allRealPoints: realChargingPoints.slice(0, 3).map(rp => ({
        point_id: rp.point_id,
        name: rp.name,
        status: rp.status
      }))
    });
    
    return (
      <div className="relative bg-gray-50 rounded-lg p-4 overflow-auto">
        <div 
          className="relative mx-auto"
          style={{ 
            width: layout.width * cellSize, 
            height: layout.height * cellSize,
            minWidth: layout.width * cellSize,
            minHeight: layout.height * cellSize
          }}
        >
          {/* Grid Background */}
          <div className="absolute inset-0 opacity-20">
            <svg width="100%" height="100%">
              <defs>
                <pattern id="layout-grid" width={cellSize} height={cellSize} patternUnits="userSpaceOnUse">
                  <path d={`M ${cellSize} 0 L 0 0 0 ${cellSize}`} fill="none" stroke="#gray" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#layout-grid)" />
            </svg>
          </div>

          {/* Facilities */}
          {layout.facilities.map((facility, index) => (
            <div
              key={index}
              className="absolute bg-blue-100 border-2 border-blue-300 rounded-lg flex items-center justify-center"
              style={{
                left: facility.x * cellSize,
                top: facility.y * cellSize,
                width: facility.width * cellSize,
                height: facility.height * cellSize
              }}
            >
              <div className="text-center">
                <div className="text-blue-600 mb-1">
                  {getFacilityIcon(facility.type)}
                </div>
                <span className="text-xs text-blue-700 capitalize">{facility.type}</span>
              </div>
            </div>
          ))}

          {/* Entrances */}
          {layout.entrances.map((entrance, index) => (
            <div
              key={index}
              className="absolute bg-green-200 border-2 border-green-400 rounded-lg flex items-center justify-center"
              style={{
                left: entrance.direction === 'west' ? -20 : entrance.direction === 'east' ? layout.width * cellSize : entrance.x * cellSize,
                top: entrance.direction === 'north' ? -20 : entrance.direction === 'south' ? layout.height * cellSize : entrance.y * cellSize,
                width: entrance.direction === 'north' || entrance.direction === 'south' ? 40 : 20,
                height: entrance.direction === 'east' || entrance.direction === 'west' ? 40 : 20
              }}
            >
              <Navigation className="w-4 h-4 text-green-600" />
            </div>
          ))}

          {/* Charging Points */}
          {chargingPoints.map((point) => {
            // Get real status from database by matching point number
            const pointNumber = point.number;
            const realStatus = realPointStatusMap.get(pointNumber);
            const statusStr = realStatus || String(point.status);
            const isBookable = isStatusBookable(statusStr);
            
            // Debug log - only for first 3 points to avoid spam
            if (pointNumber <= 11) {
              console.log(`📍 Point #${pointNumber}:`, {
                pointId: point.id,
                pointNumber,
                pointNumberType: typeof pointNumber,
                mockStatus: point.status,
                realStatus,
                realStatusType: typeof realStatus,
                finalStatus: statusStr,
                colorClass: getStatusColorClass(statusStr),
                mapHasKey: realPointStatusMap.has(pointNumber),
                mapKeys: Array.from(realPointStatusMap.keys()).slice(0, 5)
              });
            }
            
            return (
            <div
              key={point.id}
              className={`absolute rounded-lg border-2 cursor-pointer transition-all duration-200 transform hover:scale-105 ${
                selectedChargingPoint?.id === point.id 
                  ? 'border-blue-500 z-20 scale-105' 
                  : 'border-white z-10'
              } ${getStatusColorClass(statusStr)} ${
                isBookable ? 'hover:shadow-lg' : 'cursor-not-allowed opacity-75'
              }`}
              style={{
                left: point.position.x * cellSize + 5,
                top: point.position.y * cellSize + 5,
                width: cellSize - 10,
                height: cellSize - 10
              }}
              onClick={() => isBookable && setSelectedChargingPoint(point)}
            >
              {/* Charging Point Content */}
              <div className="w-full h-full flex flex-col items-center justify-center text-white text-xs font-medium">
                <Zap className="w-4 h-4 mb-1" />
                <span>#{point.number}</span>
                <span className="text-xs">{point.powerKw}kW</span>
              </div>

              {/* Status Indicator */}
              <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-white border-2 border-current flex items-center justify-center">
                {(statusStr === 'Available' || statusStr === 'available') && <div className="w-2 h-2 rounded-full bg-green-500" />}
                {(statusStr === 'Occupied' || statusStr === 'AlmostDone' || statusStr === 'in-use') && <User className="w-2 h-2 text-red-500" />}
                {(statusStr === 'Maintenance' || statusStr === 'maintenance') && <Wrench className="w-2 h-2 text-yellow-500" />}
                {(statusStr === 'Faulted' || statusStr === 'offline') && <div className="w-2 h-2 rounded-full bg-purple-500" />}
                {statusStr === 'Reserved' && <Clock className="w-2 h-2 text-blue-500" />}
              </div>

              {/* Selected Point Details */}
              {selectedChargingPoint?.id === point.id && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white rounded-lg shadow-lg p-3 min-w-48 z-30 border">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">Điểm sạc #{point.number}</h4>
                      <ChargingPointStatusBadge status={statusStr} size="sm" />
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex justify-between">
                        <span>Power:</span>
                        <span className="font-medium">{point.powerKw} kW</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Connector:</span>
                        <span className="font-medium">{point.connectorType}</span>
                      </div>
                      {point.currentUser && (
                        <div className="flex justify-between">
                          <span>Current User:</span>
                          <span className="font-medium">{point.currentUser}</span>
                        </div>
                      )}
                      {point.estimatedTimeRemaining && (
                        <div className="flex justify-between">
                          <span>Est. Time:</span>
                          <span className="font-medium">{point.estimatedTimeRemaining} min</span>
                        </div>
                      )}
                    </div>
                    {isBookable && (
                      <Button 
                        size="sm" 
                        className="w-full bg-green-600 hover:bg-green-700 mt-2"
                        onClick={() => handleBookPoint(point)}
                      >
                        Đặt điểm sạc này
                      </Button>
                    )}
                    {!isBookable && (
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        Điểm sạc không khả dụng
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
          })}
        </div>
      </div>
    );
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
        </div>
        <Button 
          className="bg-green-600 hover:bg-green-700"
          onClick={() => onBookChargingPoint(station)}
        >
          Book Any Available
        </Button>
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
            </CardHeader>
            <CardContent>
              {renderStationLayout()}
              
              {/* Legend */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-3">Chú thích màu sắc</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-500"></div>
                    <span>Sẵn sàng</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-red-500"></div>
                    <span>Đang sử dụng</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-blue-500"></div>
                    <span>Đã đặt chỗ</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-yellow-500"></div>
                    <span>Sắp xong</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-orange-500"></div>
                    <span>Bảo trì</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-purple-500"></div>
                    <span>Lỗi</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-blue-100 border border-blue-300"></div>
                    <span>Tiện ích (WC, Cafe, Shop)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Station Info */}
        <div className="space-y-6">
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