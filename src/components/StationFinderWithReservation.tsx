import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Station } from '../data/mockDatabase';
import { reservationService, Reservation, ReservationResult } from '../services/reservationService';
import { StationFinder } from './StationFinder';
import { ReservationConfirmModal } from './ReservationConfirmModal';
import { ReservationTimer } from './ReservationTimer';
import { Alert, AlertDescription } from './ui/alert';
import { Bell } from 'lucide-react';

interface StationFinderWithReservationProps {
  userId: string; // ID của user đang đăng nhập
}

export function StationFinderWithReservation({ userId }: StationFinderWithReservationProps) {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [selectedChargingPointId, setSelectedChargingPointId] = useState<string | undefined>(undefined);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [activeReservation, setActiveReservation] = useState<Reservation | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    // Check if user already has active reservation
    const existing = reservationService.getActiveReservationByUser(userId);
    if (existing) {
      setActiveReservation(existing);
    }

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
        setActiveReservation(null);
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
    // Only authenticated customers may book
    if (!isAuthenticated || user?.role !== 'customer') {
      setNotification('⚠️ Vui lòng đăng nhập bằng tài khoản khách hàng để đặt chỗ');
      setTimeout(() => setNotification(null), 5000);
      // redirect to auth page after short delay
      setTimeout(() => navigate('/auth'), 600);
      return;
    }
    
    // Check if already has active reservation
    if (activeReservation) {
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
      
      setNotification(`✅ Đã giữ chỗ thành công tại ${result.reservation.stationName}`);
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleCancelReservation = () => {
    if (activeReservation) {
      const success = reservationService.cancelReservation(activeReservation.id);
      if (success) {
        setActiveReservation(null);
        setNotification('❌ Đã hủy đặt chỗ');
        setTimeout(() => setNotification(null), 5000);
      }
    }
  };

  const handleCompleteReservation = () => {
    console.log('🎯 handleCompleteReservation called, activeReservation:', activeReservation?.id);
    if (activeReservation) {
      const success = reservationService.completeReservation(activeReservation.id);
      console.log('📊 Complete result:', success);
      if (success) {
        console.log('✅ Check-in successful, clearing activeReservation');
        
        // If no specific charging point was reserved, assign "any"
        const chargingPointId = activeReservation.chargingPointId || 'any';
        
        // Save reservation data to localStorage for Dashboard to pick up
        const reservationData = {
          stationId: activeReservation.stationId,
          stationName: activeReservation.stationName,
          chargingPointId: chargingPointId,
          reservationId: activeReservation.id,
          autoStartCharging: true, // Flag to auto-open start charging modal
        };
        localStorage.setItem('pending-charging-session', JSON.stringify(reservationData));
        
        setActiveReservation(null);
        setNotification('✅ Check-in thành công! Đang chuyển đến trang bắt đầu sạc...');
        
        // Redirect to dashboard after 1 second
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        // Nếu complete thất bại (đã completed/expired/cancelled)
        console.log('⚠️ Complete returned false - reservation may already be processed');
        
        // Kiểm tra status thực tế
        const currentRes = reservationService.getReservation(activeReservation.id);
        if (currentRes) {
          console.log('📋 Current status:', currentRes.status);
          
          if (currentRes.status === 'expired') {
            setNotification('⏰ Reservation đã hết hạn. Vui lòng đặt chỗ lại.');
          } else if (currentRes.status === 'completed') {
            setNotification('✅ Đã check-in rồi! Đang chuyển đến trang bắt đầu sạc...');
            
            // If no specific charging point was reserved, assign "any"
            const chargingPointId = currentRes.chargingPointId || 'any';
            
            // Save reservation data even if already completed
            const reservationData = {
              stationId: currentRes.stationId,
              stationName: currentRes.stationName,
              chargingPointId: chargingPointId,
              reservationId: currentRes.id,
              autoStartCharging: true,
            };
            localStorage.setItem('pending-charging-session', JSON.stringify(reservationData));
            
            // Vẫn redirect nếu đã completed
            setTimeout(() => {
              navigate('/dashboard');
            }, 1000);
          } else if (currentRes.status === 'cancelled') {
            setNotification('❌ Reservation đã bị hủy.');
          } else {
            setNotification('⚠️ Không thể check-in. Vui lòng thử lại.');
          }
        } else {
          setNotification('❌ Không tìm thấy reservation.');
        }
        
        // Clear activeReservation sau khi xử lý
        setActiveReservation(null);
        setTimeout(() => setNotification(null), 5000);
      }
    } else {
      console.log('⚠️ No active reservation to complete');
    }
  };

  const handleReservationExpired = () => {
    setActiveReservation(null);
  };

  return (
    <>
      {/* Floating Reservation Status */}
      {activeReservation && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm">
          <ReservationTimer
            reservation={activeReservation}
            onCancel={handleCancelReservation}
            onComplete={handleCompleteReservation}
            onExpired={handleReservationExpired}
          />
        </div>
      )}

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
