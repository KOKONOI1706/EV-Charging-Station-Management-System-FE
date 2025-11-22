import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReservation } from '../contexts/ReservationContext';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Clock, 
  MapPin, 
  XCircle,
  CheckCircle,
  Zap,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { reservationService } from '../services/reservationService';
import { toast } from 'sonner';
import { Alert, AlertDescription } from './ui/alert';
import { AlertCircle } from 'lucide-react';

export function FloatingReservation() {
  const navigate = useNavigate();
  const { activeReservation, setActiveReservation } = useReservation();
  const [isExpanded, setIsExpanded] = useState(true);

  // Force update every second to ensure UI reflects current state
  useEffect(() => {
    if (!activeReservation) return;
    
    const interval = setInterval(() => {
      const updated = reservationService.getReservation(activeReservation.id);
      if (updated && updated.status === 'active') {
        // Force re-render with updated time
        setActiveReservation({ ...updated });
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [activeReservation, setActiveReservation]);

  console.log('🎨 FloatingReservation render:', { 
    hasReservation: !!activeReservation,
    reservationId: activeReservation?.id,
    status: activeReservation?.status,
    remainingTime: activeReservation?.remainingTime
  });

  if (!activeReservation) {
    console.log('❌ No active reservation - FloatingReservation hidden');
    return null;
  }

  const handleCancel = async () => {
    const success = await reservationService.cancelReservation(activeReservation.id);
    if (success) {
      toast.success('Đã hủy đặt chỗ thành công!', {
        duration: 3000
      });
      setActiveReservation(null);
    } else {
      toast.error('Không thể hủy đặt chỗ, vui lòng thử lại sau', {
        duration: 3000
      });
    }
  };

  const handleComplete = () => {
    const current = reservationService.getReservation(activeReservation.id);
    if (current && current.status !== 'active') {
      toast.warning('Reservation đã được xử lý', {
        duration: 3000
      });
      return;
    }
    
    const success = reservationService.completeReservation(activeReservation.id);
    if (success) {
      toast.success('🎉 Đã check-in thành công!', {
        duration: 4000
      });
      
      // Save reservation data to localStorage for Dashboard to pick up
      const chargingPointId = activeReservation.chargingPointId || 'any';
      const reservationData = {
        stationId: activeReservation.stationId,
        stationName: activeReservation.stationName,
        chargingPointId: chargingPointId,
        reservationId: activeReservation.id,
        autoStartCharging: true,
      };
      localStorage.setItem('pending-charging-session', JSON.stringify(reservationData));
      
      setActiveReservation(null);
      
      // Redirect to dashboard after 1 second
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } else {
      toast.error('❌ Không thể hoàn thành check-in', {
        description: 'Vui lòng thử lại sau',
        duration: 3000
      });
    }
  };

  const isNearExpiration = reservationService.isNearExpiration(activeReservation);
  const timeString = reservationService.formatRemainingTime(activeReservation.remainingTime);
  const percentage = Math.max(0, Math.min(100, (activeReservation.remainingTime / (15 * 60)) * 100));

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)]">
      <Card className={`shadow-2xl border-2 transition-all duration-300 ${
        isNearExpiration ? 'border-red-500 animate-pulse' : 'border-green-500'
      }`}>
        {/* Header - Always visible */}
        <div 
          className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-semibold">Đang giữ chỗ</span>
              <Badge 
                className={`text-xs ${
                  isNearExpiration 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {timeString}
              </Badge>
            </div>
            <button className="hover:bg-gray-200 rounded-full p-1">
              {isExpanded ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronUp className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Expanded content */}
        {isExpanded && (
          <CardContent className="space-y-3 pt-0 pb-4">
            {/* Warning if near expiration */}
            {isNearExpiration && (
              <Alert className="border-red-500 bg-red-50 py-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800 text-sm font-medium">
                  ⚠️ Còn ít thời gian! Hãy đến trạm ngay!
                </AlertDescription>
              </Alert>
            )}

            {/* Station Info */}
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{activeReservation.stationName}</p>
                <p className="text-xs text-gray-600">ID: {activeReservation.stationId}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Thời gian còn lại
                </span>
                <span className={`text-lg font-bold ${
                  isNearExpiration ? 'text-red-600' : 'text-green-600'
                }`}>
                  {timeString}
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full transition-[width] duration-500 ease-linear"
                  style={{ 
                    width: `${percentage}%`,
                    minWidth: percentage > 0 ? '2%' : '0%',
                    background: isNearExpiration 
                      ? 'linear-gradient(to right, #ef4444, #f97316)' 
                      : 'linear-gradient(to right, #22c55e, #10b981)'
                  }}
                />
              </div>
            </div>

            {/* Charging Point */}
            {activeReservation.chargingPointId && (
              <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                <Zap className="w-4 h-4 text-blue-600" />
                <span className="text-xs text-blue-800">
                  Điểm sạc: <strong>{activeReservation.chargingPointId}</strong>
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                onClick={handleCancel}
              >
                <XCircle className="w-3 h-3 mr-1" />
                Hủy
              </Button>
              <Button
                size="sm"
                className="flex-1 bg-green-600 hover:bg-green-700 text-xs"
                onClick={handleComplete}
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                Đã đến trạm
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
