import { useState, useEffect } from 'react';
import { Station } from '../data/mockDatabase';
import { reservationService, ReservationResult } from '../services/reservationService';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import {
  MapPin,
  Zap,
  Clock,
  AlertCircle,
  CheckCircle,
  DollarSign
} from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { useAuth } from '../contexts/AuthContext';
import { vehicleApi, Vehicle } from '../api/vehicleApi';
import { getStationChargingPoints, ChargingPoint } from '../api/chargingPointsApi';
import { BookingValidationService } from '../services/bookingValidationService';

interface ReservationConfirmModalProps {
  station: Station;
  userId: string;
  chargingPointId?: string;
  onSuccess: (result: ReservationResult) => void;
  onCancel: () => void;
}

export function ReservationConfirmModal({
  station,
  userId,
  chargingPointId,
  onSuccess,
  onCancel
}: ReservationConfirmModalProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [userVehicles, setUserVehicles] = useState<Vehicle[]>([]);
  const [isValidating, setIsValidating] = useState(true);

  // Load data for validation
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsValidating(true);
      
      let loadedVehicles: Vehicle[] = [];
      
      // Load user vehicles
      if (user) {
        const userIdNum = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
        loadedVehicles = await vehicleApi.getUserVehicles(userIdNum);
        setUserVehicles(loadedVehicles);
        console.log('✅ Loaded user vehicles:', loadedVehicles.length);
      }

      // Load charging points for this station
      const points = await getStationChargingPoints(station.id);
      console.log('✅ Loaded charging points:', points.length);

      // Run validation with the loaded data
      validateBooking(points, loadedVehicles);
    } catch (error) {
      console.error('❌ Error loading data:', error);
      setError('Không thể tải thông tin. Vui lòng thử lại.');
    } finally {
      setIsValidating(false);
    }
  };

  const validateBooking = (points: ChargingPoint[], vehicles: Vehicle[]) => {
    console.log('🔍 Validating booking...', {
      user: !!user,
      vehiclesCount: vehicles.length,
      pointsCount: points.length,
      chargingPointId
    });

    if (!user) {
      setError('Bạn cần đăng nhập để đặt chỗ');
      return;
    }

    if (vehicles.length === 0) {
      setError('Bạn cần thêm xe vào tài khoản trước khi đặt chỗ');
      return;
    }

    // If specific charging point selected, validate it
    if (chargingPointId) {
      const selectedPoint = points.find(p => `cp-${p.point_id}` === chargingPointId);
      if (selectedPoint) {
        console.log('🔍 Validating specific point:', selectedPoint.point_id, selectedPoint.status);
        const validation = BookingValidationService.validateBooking(
          user,
          selectedPoint,
          vehicles
        );
        
        if (!validation.isValid) {
          console.log('❌ Validation failed:', validation.errors);
          setError(validation.errors.join('\n'));
          return;
        }
        
        if (validation.warnings.length > 0) {
          console.log('⚠️ Validation warnings:', validation.warnings);
          setWarnings(validation.warnings);
        }
        
        console.log('✅ Validation passed for specific point');
      }
    } else {
      // Validate station booking (any available point)
      const availablePoints = points.filter(p => p.status === 'Available');
      console.log('🔍 Validating station booking, available points:', availablePoints.length);
      const validation = BookingValidationService.validateStationBooking(
        user,
        availablePoints.length > 0,
        vehicles
      );
      
      if (!validation.isValid) {
        console.log('❌ Validation failed:', validation.errors);
        setError(validation.errors.join('\n'));
        return;
      }
      
      if (validation.warnings.length > 0) {
        console.log('⚠️ Validation warnings:', validation.warnings);
        setWarnings(validation.warnings);
      }
      
      console.log('✅ Validation passed for station booking');
    }
  };

  const handleConfirm = () => {
    console.log('🔵 handleConfirm called');
    console.log('📍 Station:', station);
    console.log('👤 User ID:', userId);
    console.log('🔌 Charging Point ID:', chargingPointId);
    
    setIsLoading(true);
    setError(null);

    // Giả lập API call (có thể thay thế bằng actual API)
    setTimeout(() => {
      console.log('⏰ Timeout executed, creating reservation...');
      const result = reservationService.createReservation(
        userId,
        station,
        chargingPointId
      );
      
      console.log('📊 Reservation result:', result);

      if (result.success) {
        console.log('✅ Reservation successful, calling onSuccess');
        onSuccess(result);
      } else {
        console.log('❌ Reservation failed:', result.error);
        setError(result.error || 'Có lỗi xảy ra khi đặt chỗ');
        setIsLoading(false);
      }
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]" style={{ zIndex: 9999 }}>
      <Card className="max-w-md w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Xác nhận đặt chỗ
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4 pt-6">
          {/* Validation Loading */}
          {isValidating && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Đang kiểm tra...</p>
            </div>
          )}

          {/* Error Alert */}
          {error && !isValidating && (
            <Alert className="border-red-500 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800 whitespace-pre-line">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Warning Alerts */}
          {warnings.length > 0 && !error && !isValidating && (
            <Alert className="border-yellow-500 bg-yellow-50">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <div className="space-y-1">
                  {warnings.map((warning, idx) => (
                    <p key={idx}>{warning}</p>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {!isValidating && (
            <>

          {/* Station Info */}
          <div className="space-y-3">
            {/* Station Image */}
            <div className="w-full h-48 rounded-lg overflow-hidden">
              <img
                src={station.image}
                alt={station.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x400?text=Charging+Station';
                }}
              />
            </div>

            <div>
              <h3 className="font-semibold text-lg">{station.name}</h3>
              <p className="text-sm text-gray-600 flex items-start gap-1 mt-1">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                {station.address}
              </p>
            </div>

            {/* Charging Point Info (if specific point selected) */}
            {chargingPointId && (
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <span className="text-sm font-medium text-gray-700">
                  🔌 Điểm sạc đã chọn:
                </span>
                <Badge className="bg-blue-600 text-white text-base">
                  #{chargingPointId.replace('cp-', '')}
                </Badge>
              </div>
            )}

            {/* Availability Badge */}
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">
                {chargingPointId ? 'Tổng chỗ trống tại trạm:' : 'Chỗ trống:'}
              </span>
              <Badge className="bg-green-100 text-green-800 text-base">
                {station.available}/{station.total}
              </Badge>
            </div>

            {/* Station Details */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <Zap className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-gray-500 text-xs">Công suất</p>
                  <p className="font-semibold">{station.power}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <DollarSign className="w-4 h-4 text-green-600" />
                <div>
                  <p className="text-gray-500 text-xs">Giá</p>
                  <p className="font-semibold">{station.price}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Reservation Info */}
          <div className="border-t pt-4 space-y-3">
            <h4 className="font-semibold text-sm text-gray-700">
              📋 Thông tin giữ chỗ:
            </h4>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
              <div className="flex items-start gap-2">
                <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">Thời gian giữ chỗ: 15 phút</p>
                  <p className="text-xs text-blue-700 mt-1">
                    Bạn cần đến trạm sạc trong vòng 15 phút
                  </p>
                </div>
              </div>
            </div>

            <Alert className="border-yellow-500 bg-yellow-50">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800 text-xs space-y-1">
                <p className="font-semibold">⚠️ Lưu ý quan trọng:</p>
                <ul className="list-disc list-inside space-y-0.5 ml-2">
                  <li>Sau <strong>10 phút</strong>, hệ thống sẽ thông báo còn 5 phút</li>
                  <li>Sau <strong>15 phút</strong>, chỗ của bạn sẽ bị hủy tự động</li>
                  <li>Nếu hết hạn, bạn cần đặt chỗ lại từ đầu</li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onCancel}
              disabled={isLoading || isValidating}
            >
              {error ? 'Đóng' : 'Hủy'}
            </Button>
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={handleConfirm}
              disabled={isLoading || isValidating || !!error}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Xác nhận đặt chỗ
                </>
              )}
            </Button>
          </div>
          </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
