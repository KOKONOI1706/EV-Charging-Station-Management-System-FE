import { useState, useEffect } from 'react';
import { Station } from '../data/mockDatabase';
import { reservationService, Reservation, ReservationResult } from '../services/reservationService';
import { ReservationTimer, NoReservation, ExpiredReservation } from '../components/ReservationTimer';
import { ReservationConfirmModal } from '../components/ReservationConfirmModal';
import { StationMapView } from '../components/StationMapView';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Bell, MapPin } from 'lucide-react';

export function ReservationTestPage() {
  const [activeReservation, setActiveReservation] = useState<Reservation | null>(null);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [showExpired, setShowExpired] = useState(false);
  const [expiredStationName, setExpiredStationName] = useState('');

  // Mock user ID
  const userId = 'user-123';

  useEffect(() => {
    // Check if user already has active reservation
    const existing = reservationService.getActiveReservationByUser(userId);
    if (existing) {
      setActiveReservation(existing);
    }

    // Subscribe to notifications
    reservationService.onNotification((reservation) => {
      const message = `⚠️ Còn 5 phút trước khi hết thời gian giữ chỗ tại ${reservation.stationName}!`;
      setNotifications(prev => [message, ...prev]);
      
      // Show browser notification if supported
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('⚠️ Cảnh báo giữ chỗ', {
          body: message,
          icon: '/favicon.ico'
        });
      }
    });

    // Subscribe to expiration
    reservationService.onExpiration((reservation) => {
      setExpiredStationName(reservation.stationName);
      setShowExpired(true);
      setActiveReservation(null);
      
      const message = `❌ Chỗ của bạn tại ${reservation.stationName} đã hết hạn`;
      setNotifications(prev => [message, ...prev]);
    });

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [userId]);

  const handleStationSelect = (station: Station) => {
    // Check if already has active reservation
    if (activeReservation) {
      alert('Bạn đã có một chỗ đang được giữ. Vui lòng hoàn thành hoặc hủy reservation hiện tại.');
      return;
    }

    setSelectedStation(station);
    setShowConfirmModal(true);
  };

  const handleReservationSuccess = (result: ReservationResult) => {
    if (result.success && result.reservation) {
      setActiveReservation(result.reservation);
      setShowConfirmModal(false);
      setSelectedStation(null);
      setShowExpired(false);
      
      const message = `✅ Đã giữ chỗ thành công tại ${result.reservation.stationName}`;
      setNotifications(prev => [message, ...prev]);
    }
  };

  const handleCancel = () => {
    if (activeReservation) {
      const success = reservationService.cancelReservation(activeReservation.id);
      if (success) {
        setActiveReservation(null);
        setNotifications(prev => [`❌ Đã hủy đặt chỗ`, ...prev]);
      }
    }
  };

  const handleComplete = () => {
    if (activeReservation) {
      const success = reservationService.completeReservation(activeReservation.id);
      if (success) {
        setNotifications(prev => [`✅ Check-in thành công! Bắt đầu sạc xe`, ...prev]);
        setActiveReservation(null);
      }
    }
  };

  const handleExpiredRetry = () => {
    setShowExpired(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔋 Hệ thống Đặt chỗ & Giữ chỗ
          </h1>
          <p className="text-gray-600">
            Giữ chỗ trong 15 phút - Thông báo sau 10 phút
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Reservation Status */}
          <div className="lg:col-span-1 space-y-4">
            {/* Active Reservation or Empty State */}
            {showExpired ? (
              <div>
                <ExpiredReservation stationName={expiredStationName} />
                <Button
                  className="w-full mt-4 bg-green-600 hover:bg-green-700"
                  onClick={handleExpiredRetry}
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Đặt chỗ mới
                </Button>
              </div>
            ) : activeReservation ? (
              <ReservationTimer
                reservation={activeReservation}
                onCancel={handleCancel}
                onComplete={handleComplete}
                onExpired={() => {
                  setExpiredStationName(activeReservation.stationName);
                  setShowExpired(true);
                }}
              />
            ) : (
              <NoReservation />
            )}

            {/* Notifications */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  Thông báo ({notifications.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {notifications.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Chưa có thông báo
                  </p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {notifications.map((notif, index) => (
                      <div
                        key={index}
                        className="text-sm p-2 bg-gray-50 rounded border border-gray-200"
                      >
                        {notif}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Station Map */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  Chọn trạm sạc để đặt chỗ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StationMapView
                  onStationSelect={handleStationSelect}
                  onViewDetails={(station) => {
                    console.log('View details:', station);
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Instructions */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="py-4">
            <h3 className="font-semibold text-blue-900 mb-2">
              📖 Hướng dẫn sử dụng:
            </h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Chọn một trạm sạc trên bản đồ và click "Đặt chỗ"</li>
              <li>Hệ thống sẽ giữ chỗ cho bạn trong <strong>15 phút</strong></li>
              <li>Sau <strong>10 phút</strong>, bạn sẽ nhận thông báo còn 5 phút</li>
              <li>Nếu quá 15 phút, bạn phải đặt chỗ lại từ đầu</li>
              <li>Click "Đã đến trạm" khi bạn đến nơi để check-in</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Confirm Modal */}
      {showConfirmModal && selectedStation && (
        <ReservationConfirmModal
          station={selectedStation}
          userId={userId}
          onSuccess={handleReservationSuccess}
          onCancel={() => {
            setShowConfirmModal(false);
            setSelectedStation(null);
          }}
        />
      )}
    </div>
  );
}
