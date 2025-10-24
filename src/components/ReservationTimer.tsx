import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Clock, 
  MapPin, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Zap
} from 'lucide-react';
import { Reservation, reservationService } from '../services/reservationService';
import { Alert, AlertDescription } from './ui/alert';

interface ReservationTimerProps {
  reservation: Reservation;
  onCancel?: () => void;
  onComplete?: () => void;
  onExpired?: () => void;
}

export function ReservationTimer({ 
  reservation, 
  onCancel, 
  onComplete,
  onExpired 
}: ReservationTimerProps) {
  const [currentReservation, setCurrentReservation] = useState(reservation);
  const [showNotification, setShowNotification] = useState(false);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    console.log('🔵 ReservationTimer mounted for:', reservation.id);
    
    // Cập nhật state mỗi giây
    const interval = setInterval(() => {
      const updated = reservationService.getReservation(reservation.id);
      if (updated) {
        console.log('🔄 Updating reservation state:', updated.remainingTime, 'status:', updated.status);
        
        // Nếu status không còn active, gọi callback tương ứng và dừng
        if (updated.status === 'expired' && onExpired) {
          console.log('⏰ Reservation expired, calling onExpired');
          clearInterval(interval);
          onExpired();
          return;
        }
        
        if (updated.status === 'completed' && onComplete) {
          console.log('✅ Reservation completed, calling onComplete');
          clearInterval(interval);
          onComplete();
          return;
        }
        
        if (updated.status === 'cancelled' && onCancel) {
          console.log('❌ Reservation cancelled, calling onCancel');
          clearInterval(interval);
          onCancel();
          return;
        }
        
        setCurrentReservation({...updated}); // Tạo object mới để trigger re-render
        forceUpdate(prev => prev + 1); // Force re-render
      } else {
        console.log('⚠️ Reservation not found:', reservation.id);
        clearInterval(interval);
      }
    }, 1000);

    // Đăng ký nhận thông báo 5 phút cuối
    const handleNotification = (res: Reservation) => {
      if (res.id === reservation.id) {
        setShowNotification(true);
        // Tự động ẩn sau 10 giây
        setTimeout(() => setShowNotification(false), 10000);
      }
    };

    reservationService.onNotification(handleNotification);

    return () => {
      clearInterval(interval);
    };
  }, [reservation.id, onExpired]);

  const handleCancel = () => {
    const success = reservationService.cancelReservation(reservation.id);
    if (success && onCancel) {
      onCancel();
    }
  };

  const handleComplete = () => {
    console.log('🔵 handleComplete clicked');
    const success = reservationService.completeReservation(reservation.id);
    console.log('📊 Service complete result:', success);
    if (success) {
      console.log('✅ Calling onComplete callback');
      if (onComplete) {
        onComplete();
      }
    }
  };

  const isNearExpiration = reservationService.isNearExpiration(currentReservation);
  const timeString = reservationService.formatRemainingTime(currentReservation.remainingTime);

  // TEST MODE: Tính phần trăm thời gian còn lại (15 giây thay vì 15 phút)
  // Đổi lại thành (15 * 60) khi deploy production
  const percentage = (currentReservation.remainingTime / 15*60) * 100;

  return (
    <Card className="border-2 border-green-500 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Đang giữ chỗ
          </CardTitle>
          <Badge 
            className={`text-sm ${
              isNearExpiration 
                ? 'bg-red-100 text-red-800' 
                : 'bg-green-100 text-green-800'
            }`}
          >
            {currentReservation.status === 'active' ? 'Active' : currentReservation.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Notification 5 phút cuối */}
        {showNotification && isNearExpiration && (
          <Alert className="border-red-500 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 font-medium">
              ⚠️ Còn 5 phút trước khi hết thời gian giữ chỗ!
            </AlertDescription>
          </Alert>
        )}

        {/* Station Info */}
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
            <div>
              <p className="font-semibold">{currentReservation.stationName}</p>
              <p className="text-sm text-gray-600">ID: {currentReservation.stationId}</p>
            </div>
          </div>
        </div>

        {/* Countdown Timer */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Thời gian còn lại:
            </span>
            <span className={`text-2xl font-bold ${
              isNearExpiration ? 'text-red-600' : 'text-green-600'
            }`}>
              {timeString}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${
                isNearExpiration 
                  ? 'bg-gradient-to-r from-red-500 to-orange-500' 
                  : 'bg-gradient-to-r from-green-500 to-emerald-500'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>

          <p className="text-xs text-gray-500 text-center">
            {isNearExpiration 
              ? '⚠️ Vui lòng đến trạm sạc càng sớm càng tốt'
              : '✅ Hãy đến trạm sạc trong thời gian được giữ chỗ'
            }
          </p>
        </div>

        {/* Charging Point */}
        {currentReservation.chargingPointId && (
          <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
            <Zap className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-800">
              Điểm sạc: <strong>{currentReservation.chargingPointId}</strong>
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleCancel}
          >
            <XCircle className="w-4 h-4 mr-2" />
            Hủy đặt chỗ
          </Button>
          <Button
            className="flex-1 bg-green-600 hover:bg-green-700"
            onClick={handleComplete}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Đã đến trạm
          </Button>
        </div>

        {/* Warning Text */}
        <p className="text-xs text-gray-500 text-center pt-2 border-t">
          💡 Nếu quá 15 phút, bạn cần đặt chỗ lại từ đầu
        </p>
      </CardContent>
    </Card>
  );
}

// Component hiển thị trạng thái khi không có reservation
export function NoReservation() {
  return (
    <Card className="border-dashed border-2">
      <CardContent className="py-12 text-center">
        <Clock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Chưa có chỗ được giữ
        </h3>
        <p className="text-sm text-gray-500">
          Chọn một trạm sạc và nhấn "Đặt chỗ" để giữ chỗ trong 15 phút
        </p>
      </CardContent>
    </Card>
  );
}

// Component hiển thị khi reservation hết hạn
export function ExpiredReservation({ stationName }: { stationName: string }) {
  return (
    <Card className="border-red-500 border-2">
      <CardContent className="py-8 text-center">
        <XCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-red-700 mb-2">
          ⏰ Hết thời gian giữ chỗ
        </h3>
        <p className="text-sm text-gray-600 mb-1">
          Chỗ của bạn tại <strong>{stationName}</strong> đã hết hạn
        </p>
        <p className="text-sm text-gray-500">
          Vui lòng đặt chỗ lại nếu bạn vẫn muốn sử dụng trạm này
        </p>
      </CardContent>
    </Card>
  );
}
