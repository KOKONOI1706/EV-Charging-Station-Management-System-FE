import { useState, useEffect } from 'react';
import { Station } from '../data/mockDatabase';
import { reservationService, ReservationResult } from '../services/reservationService';
import { StationFinder } from './StationFinder';
import { ReservationConfirmModal } from './ReservationConfirmModal';
import { Alert, AlertDescription } from './ui/alert';
import { Bell } from 'lucide-react';
import { useReservation } from '../contexts/ReservationContext';

interface StationFinderWithReservationProps {
  userId: string; // ID của user đang đăng nhập
}

export function StationFinderWithReservation({ userId }: StationFinderWithReservationProps) {
  const { activeReservation, setActiveReservation } = useReservation();
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [selectedChargingPointId, setSelectedChargingPointId] = useState<string | undefined>(undefined);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    // Subscribe to notifications (5 phút cuối)
    reservationService.onNotification((reservation) => {
      if (reservation.userId === userId) {
        const message = `⚠️ Còn 5 phút trước khi hết thời gian giữ chỗ tại ${reservation.stationName}!`;
        setNotification(message);
        
        // Auto-hide after 10 seconds
        setTimeout(() => setNotification(null), 10000);
        
        // Browser notification if supported
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('⚠️ Cảnh báo giữ chỗ', {
            body: message,
            icon: '/favicon.ico'
          });
        }
      }
    });

    // Subscribe to expiration
    reservationService.onExpiration((reservation) => {
      if (reservation.userId === userId) {
        setNotification(`❌ Chỗ của bạn tại ${reservation.stationName} đã hết hạn`);
        setTimeout(() => setNotification(null), 10000);
      }
    });

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [userId]);

  const handleBookStation = (station: Station, chargingPointId?: string) => {
    console.log('📍 handleBookStation called with chargingPointId:', chargingPointId);
    
    // Prevent multiple calls if modal is already open
    if (showConfirmModal) {
      console.log('⚠️ Modal already open, ignoring duplicate call');
      return;
    }
    
    // Check if already has ACTIVE reservation (not cancelled/expired)
    if (activeReservation && activeReservation.status === 'active') {
      setNotification('⚠️ Bạn đã có một chỗ đang được giữ. Vui lòng hoàn thành hoặc hủy reservation hiện tại.');
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    setSelectedStation(station);
    setSelectedChargingPointId(chargingPointId);
    setShowConfirmModal(true);
  };

  const handleReservationSuccess = (result: ReservationResult) => {
    if (result.success && result.reservation) {
      setActiveReservation(result.reservation);
      setShowConfirmModal(false);
      setSelectedStation(null);
      setTimeout(() => setNotification(null), 5000);
    }
  };

  return (
    <>
      {/* Floating Notification */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 max-w-md animate-in slide-in-from-top-5">
          <Alert className={`border-2 ${
            notification.includes('✅') 
              ? 'border-green-500 bg-green-50' 
              : notification.includes('❌')
              ? 'border-red-500 bg-red-50'
              : 'border-yellow-500 bg-yellow-50'
          }`}>
            <Bell className="h-4 w-4" />
            <AlertDescription className="font-medium">
              {notification}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Main Station Finder */}
      <StationFinder onBookStation={handleBookStation} />

      {/* Reservation Confirm Modal */}
      {showConfirmModal && selectedStation && (
        <ReservationConfirmModal
          station={selectedStation}
          userId={userId}
          chargingPointId={selectedChargingPointId}
          onSuccess={handleReservationSuccess}
          onCancel={() => {
            setShowConfirmModal(false);
            setSelectedStation(null);
            setSelectedChargingPointId(undefined);
          }}
        />
      )}
    </>
  );
}
