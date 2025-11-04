import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import {
  Zap,
  Battery,
  DollarSign,
  Gauge,
  StopCircle,
  MapPin,
  AlertCircle,
  CheckCircle,
  Loader2,
  Timer,
  RefreshCw,
  TrendingUp,
  Bolt,
} from 'lucide-react';
import { chargingSessionApi, ChargingSession } from '../api/chargingSessionApi';
import { useAuth } from '../contexts/AuthContext';
import { PaymentModal } from './PaymentModal';
import { toast } from 'sonner';

interface ActiveChargingSessionProps {
  onSessionEnd?: () => void;
}

export function ActiveChargingSession({ onSessionEnd }: ActiveChargingSessionProps) {
  const { user } = useAuth();
  const [session, setSession] = useState<ChargingSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [stopping, setStopping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentMeter, setCurrentMeter] = useState<number>(0);
  const [estimatedCost, setEstimatedCost] = useState<number>(0);
  const [duration, setDuration] = useState<string>('0m');
  const [batteryProgress, setBatteryProgress] = useState<number>(0);
  const [chargingRate, setChargingRate] = useState<number>(0);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  
  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState<{
    sessionId: number;
    stationName: string;
    pointName: string;
    startTime: string;
    endTime: string;
    energyConsumed: number;
    duration: string;
    amount: number;
    pricePerKwh: number;
    meterEnd?: number; // Add meter_end to complete session after payment
  } | null>(null);

  // Poll for active session
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchActiveSession = async () => {
      try {
        // Assuming user.id is the numeric user_id
        const userId = parseInt(user.id);
        const activeSession = await chargingSessionApi.getActiveSession(userId);
        
        // Only update if session exists
        if (activeSession) {
          setSession(activeSession);
          setCurrentMeter(activeSession.meter_start);
          setError(null);
        } else {
          // No active session
          setSession(null);
          setError(null);
        }
      } catch (err) {
        console.error('Error fetching active session:', err);
        // Only set error if it's not a 404 (no active session)
        if (err instanceof Error && !err.message.includes('404') && !err.message.includes('No active')) {
          setError(err.message);
        } else {
          setSession(null);
          setError(null);
        }
      } finally {
        setLoading(false);
      }
    };

    // Fetch immediately
    fetchActiveSession();

    // Poll every 15 seconds (reduced from 10 to improve performance)
    const interval = setInterval(fetchActiveSession, 15000);
    return () => clearInterval(interval);
  }, [user]);

  // Update duration timer
  useEffect(() => {
    if (!session) return;

    const updateDuration = () => {
      const formatted = chargingSessionApi.formatDuration(session.start_time);
      setDuration(formatted);
    };

    updateDuration();
    const interval = setInterval(updateDuration, 1000);
    return () => clearInterval(interval);
  }, [session]);

  // Calculate estimated cost and battery progress
  useEffect(() => {
    if (!session || !session.charging_points?.stations) return;

    const pricePerKwh = session.charging_points.stations.price_per_kwh;
    const idleFeePerMin = session.charging_points.idle_fee_per_min || 0;
    
    const cost = chargingSessionApi.calculateEstimatedCost(
      session.meter_start,
      currentMeter,
      pricePerKwh,
      0, // No idle time yet
      idleFeePerMin
    );
    
    setEstimatedCost(cost);

    // Calculate battery progress
    if (session.vehicles?.battery_capacity_kwh) {
      const energyConsumed = currentMeter - session.meter_start;
      const progress = (energyConsumed / session.vehicles.battery_capacity_kwh) * 100;
      setBatteryProgress(Math.min(Math.max(progress, 0), 100));
      
      // Calculate charging rate (kW)
      const durationMs = new Date().getTime() - new Date(session.start_time).getTime();
      const durationHours = durationMs / (1000 * 60 * 60);
      if (durationHours > 0) {
        const rate = energyConsumed / durationHours;
        setChargingRate(rate);
      }
    }
  }, [session, currentMeter]);

  const handleUpdateMeter = async () => {
    if (!session) return;

    try {
      // Simulate meter reading update (in real app, this would come from actual meter)
      const newMeter = currentMeter + Math.random() * 5; // Add random kWh
      const result = await chargingSessionApi.updateMeter(session.session_id, {
        current_meter: newMeter,
      });
      setCurrentMeter(result.current_meter);
      setLastUpdate(new Date());
      toast.success('Đã cập nhật công tơ điện');
    } catch (err) {
      console.error('Error updating meter:', err);
      toast.error('Không thể cập nhật công tơ');
    }
  };

  const getLastUpdateText = () => {
    const diffMs = new Date().getTime() - lastUpdate.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffSeconds = Math.floor(diffMs / 1000);
    
    if (diffSeconds < 60) return `${diffSeconds} giây trước`;
    if (diffMinutes === 0) return 'Vừa xong';
    return `${diffMinutes} phút trước`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const handleStopSession = async () => {
    if (!session) return;

    setStopping(true);
    setError(null);

    try {
      // Get final meter reading (in real app, this would come from actual meter)
      const finalMeter = currentMeter + Math.random() * 2;

      // ⚠️ IMPORTANT: Don't call stopSession API yet!
      // We only prepare the payment data and show payment modal
      // The session will be stopped AFTER successful payment

      // Calculate estimated cost
      const station = session.charging_points?.stations;
      const pricePerKwh = station?.price_per_kwh || 5000;
      const energyConsumed = finalMeter - session.meter_start;
      const estimatedCost = energyConsumed * pricePerKwh;
      
      // Ensure amount is in VND (integer) and meets MoMo minimum of 1000 VND
      const costInVND = Math.max(1000, Math.round(estimatedCost));
      
      const sessionPaymentData = {
        sessionId: session.session_id,
        stationName: station?.name || 'Unknown Station',
        pointName: session.charging_points?.name || `Point #${session.point_id}`,
        startTime: session.start_time,
        endTime: new Date().toISOString(),
        energyConsumed: energyConsumed,
        duration: chargingSessionApi.formatDuration(session.start_time),
        amount: costInVND,
        pricePerKwh: pricePerKwh,
        meterEnd: finalMeter, // Store meter_end for later
      };

      

      // Set payment data and show modal
      setPaymentData(sessionPaymentData);
      setShowPaymentModal(true);
      
      // Show toast notification
      toast.info('Vui lòng thanh toán để kết thúc phiên sạc');

      // Keep session visible but with payment modal open
      // Session will be cleared after successful payment
    } catch (err) {
      console.error('Error preparing payment:', err);
      setError(err instanceof Error ? err.message : 'Không thể chuẩn bị thanh toán');
      toast.error('Có lỗi xảy ra khi chuẩn bị thanh toán');
    } finally {
      setStopping(false);
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          <span className="ml-3 text-gray-600">Loading session...</span>
        </CardContent>
      </Card>
    );
  }

  // If we have payment data, render the payment modal even if session is null
  if (!session && !paymentData) {
    return (
      <Card className="w-full">
        <CardContent className="py-8">
          <div className="text-center">
            <Battery className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No active charging session</p>
            <p className="text-sm text-gray-400 mt-2">
              Start charging at a station to monitor your session here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If session ended but we have payment data, show payment modal
  if (!session && paymentData) {
    return (
      <div className="space-y-4">
        <Card className="w-full">
          <CardContent className="py-8">
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <p className="text-gray-700 font-medium">Phiên sạc đã kết thúc</p>
              <p className="text-sm text-gray-500 mt-2">
                Vui lòng hoàn tất thanh toán
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Payment Modal */}
        {(() => {
          console.log('🔍 Render check (no session):', {
            hasPaymentData: !!paymentData,
            showPaymentModal,
            paymentData
          });
          return (
            <PaymentModal
              open={showPaymentModal}
              onOpenChange={setShowPaymentModal}
              sessionId={paymentData.sessionId}
              sessionData={paymentData}
              onPaymentSuccess={async () => {
                console.log('💰 Payment successful! Now stopping session...');
                
                try {
                  // NOW we can stop the session on backend
                  if (paymentData.meterEnd) {
                    await chargingSessionApi.stopSession(paymentData.sessionId, {
                      meter_end: paymentData.meterEnd,
                      idle_minutes: 0,
                    });
                    console.log('✅ Session stopped successfully');
                    toast.success('Thanh toán thành công! Phiên sạc đã kết thúc.');
                  }
                } catch (err) {
                  console.error('Error stopping session after payment:', err);
                  toast.error('Thanh toán thành công nhưng có lỗi khi kết thúc phiên sạc');
                }
                
                // Close modal and clear state
                setShowPaymentModal(false);
                setPaymentData(null);
                
                // Refresh parent to show completed session
                if (onSessionEnd) {
                  onSessionEnd();
                }
              }}
            />
          );
        })()}
      </div>
    );
  }

  // At this point, session must exist (because of the checks above)
  if (!session) {
    return null; // TypeScript guard, should never reach here
  }

  const energyConsumed = currentMeter - session.meter_start;
  const station = session.charging_points?.stations;

  return (
    <div className="space-y-6">
      {/* Active Session Banner */}
      <Alert className="border-green-500 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800 flex justify-between items-center">
          <span>
            <strong>Đang sạc điện</strong> - Xe của bạn đang được sạc
          </span>
          <span className="text-xs">
            Cập nhật: {getLastUpdateText()}
          </span>
        </AlertDescription>
      </Alert>

      {error && (
        <Alert className="border-red-500 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Session Card */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 mb-2">
                <Zap className="w-6 h-6 text-green-600" />
                Phiên sạc đang hoạt động
              </CardTitle>
              <CardDescription>
                Phiên #{session.session_id} • {station?.name || 'Trạm sạc'}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge className="bg-green-500 hover:bg-green-600">
                <span className="animate-pulse mr-2">●</span> Live
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleUpdateMeter}
                disabled={stopping}
              >
                <RefreshCw className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Battery Progress (New Feature) */}
          {session.vehicles?.battery_capacity_kwh && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <Battery className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-gray-700">Mức pin</span>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-green-600">
                    {batteryProgress.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500">
                    {energyConsumed.toFixed(2)} / {session.vehicles.battery_capacity_kwh} kWh
                  </p>
                </div>
              </div>
              <Progress 
                value={batteryProgress} 
                className="h-3"
              />
              <div className="mt-3 flex justify-between text-xs text-gray-600">
                <span>Xe: {session.vehicles.plate_number}</span>
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {chargingRate.toFixed(1)} kW
                </span>
              </div>
            </div>
          )}

          {/* Station Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Địa điểm</p>
                    <p className="font-medium">{station?.address || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Bolt className="w-4 h-4 text-yellow-500" />
                  <div>
                    <p className="text-sm text-gray-600">Điểm sạc</p>
                    <p className="font-medium">
                      {session.charging_points?.name || `Point #${session.point_id}`} • {session.charging_points?.power_kw || 0} kW
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid - Improved */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Duration */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center text-blue-600 mb-2">
                <Timer className="w-4 h-4 mr-2" />
                <span className="text-xs font-medium uppercase">Thời gian</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">{duration}</p>
              <p className="text-xs text-blue-700 mt-1">Đang chạy</p>
            </div>

            {/* Energy Consumed */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
              <div className="flex items-center text-green-600 mb-2">
                <Battery className="w-4 h-4 mr-2" />
                <span className="text-xs font-medium uppercase">Điện năng</span>
              </div>
              <p className="text-2xl font-bold text-green-900">
                {energyConsumed.toFixed(1)} <span className="text-sm">kWh</span>
              </p>
              <p className="text-xs text-green-700 mt-1">Đã tiêu thụ</p>
            </div>

            {/* Current Cost */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center text-purple-600 mb-2">
                <DollarSign className="w-4 h-4 mr-2" />
                <span className="text-xs font-medium uppercase">Chi phí</span>
              </div>
              <p className="text-xl font-bold text-purple-900">
                {formatCurrency(estimatedCost)}
              </p>
              <p className="text-xs text-purple-700 mt-1">Tạm tính</p>
            </div>

            {/* Price Rate */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
              <div className="flex items-center text-orange-600 mb-2">
                <Gauge className="w-4 h-4 mr-2" />
                <span className="text-xs font-medium uppercase">Đơn giá</span>
              </div>
              <p className="text-lg font-bold text-orange-900">
                {formatCurrency(station?.price_per_kwh || 0)}
              </p>
              <p className="text-xs text-orange-700 mt-1">Mỗi kWh</p>
            </div>
          </div>

          {/* Meter Readings */}
          <div className="bg-white border-2 border-gray-200 rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                <Gauge className="w-4 h-4" />
                Số đo công tơ
              </h4>
              <Badge variant="outline" className="text-xs">
                Real-time
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1 uppercase">Bắt đầu</p>
                <p className="text-2xl font-bold text-gray-900">{session.meter_start.toFixed(2)}</p>
                <p className="text-xs text-gray-600 mt-1">kWh</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-xs text-green-600 mb-1 uppercase">Hiện tại</p>
                <p className="text-2xl font-bold text-green-600">
                  {currentMeter.toFixed(2)}
                </p>
                <p className="text-xs text-green-700 mt-1">kWh</p>
              </div>
            </div>
            <div className="text-center pt-3 border-t">
              <p className="text-sm text-gray-600">Chênh lệch</p>
              <p className="text-3xl font-bold text-blue-600">
                +{energyConsumed.toFixed(2)} kWh
              </p>
            </div>
          </div>

          {/* Session Details */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-sm">
            <h4 className="font-semibold text-gray-700 mb-3">Chi tiết phiên</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-white rounded">
                <span className="text-gray-600">Mã phiên</span>
                <span className="font-medium">#{session.session_id}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white rounded">
                <span className="text-gray-600">Bắt đầu lúc</span>
                <span className="font-medium">
                  {new Date(session.start_time).toLocaleString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </span>
              </div>
              {session.vehicles && (
                <div className="flex justify-between items-center p-2 bg-white rounded">
                  <span className="text-gray-600">Biển số xe</span>
                  <span className="font-medium">{session.vehicles.plate_number}</span>
                </div>
              )}
              <div className="flex justify-between items-center p-2 bg-white rounded">
                <span className="text-gray-600">Tốc độ sạc TB</span>
                <span className="font-medium text-green-600">
                  {chargingRate.toFixed(1)} kW
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons - Enhanced */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
            <Button
              onClick={handleUpdateMeter}
              variant="outline"
              className="w-full h-12"
              disabled={stopping}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${stopping ? '' : 'hover:rotate-180 transition-transform duration-500'}`} />
              Làm mới công tơ
            </Button>
            <Button
              onClick={handleStopSession}
              variant="destructive"
              className="w-full h-12 bg-red-600 hover:bg-red-700"
              disabled={stopping}
            >
              {stopping ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang dừng...
                </>
              ) : (
                <>
                  <StopCircle className="w-4 h-4 mr-2" />
                  Dừng sạc & Thanh toán
                </>
              )}
            </Button>
          </div>

          {/* Info Box */}
          <Alert className="bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-xs text-blue-800">
              <strong>Lưu ý:</strong> Xe của bạn sẽ tiếp tục sạc cho đến khi bạn nhấn "Dừng sạc". 
              Phí chờ có thể được áp dụng nếu bạn để xe kết nối sau khi sạc xong.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Payment Modal */}
      {(() => {
        console.log('🔍 Render check:', {
          hasPaymentData: !!paymentData,
          showPaymentModal,
          paymentData
        });
        return paymentData && (
          <PaymentModal
            open={showPaymentModal}
            onOpenChange={setShowPaymentModal}
            sessionId={paymentData.sessionId}
            sessionData={paymentData}
            onPaymentSuccess={async () => {
              console.log('💰 Payment successful! Now stopping session...');
              
              try {
                // NOW we can stop the session on backend
                if (paymentData.meterEnd) {
                  await chargingSessionApi.stopSession(paymentData.sessionId, {
                    meter_end: paymentData.meterEnd,
                    idle_minutes: 0,
                  });
                  console.log('✅ Session stopped successfully');
                  toast.success('Thanh toán thành công! Phiên sạc đã kết thúc.');
                }
              } catch (err) {
                console.error('Error stopping session after payment:', err);
                toast.error('Thanh toán thành công nhưng có lỗi khi kết thúc phiên sạc');
              }
              
              // Close modal and clear state
              setShowPaymentModal(false);
              setPaymentData(null);
              setSession(null);
              
              // Refresh parent to show completed session
              if (onSessionEnd) {
                onSessionEnd();
              }
            }}
          />
        );
      })()}
    </div>
  );
}
