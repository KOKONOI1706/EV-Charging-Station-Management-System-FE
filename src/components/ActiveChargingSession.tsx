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
        
        console.log('🔄 Active session response:', {
          hasSession: !!activeSession,
          sessionId: activeSession?.session_id,
          current_meter: activeSession?.current_meter,
          estimated_cost: activeSession?.estimated_cost,
          battery_progress: activeSession?.battery_progress,
          charging_rate_kw: activeSession?.charging_rate_kw,
          price_per_kwh: activeSession?.charging_points?.stations?.price_per_kwh,
          estimated_minutes_remaining: activeSession?.estimated_minutes_remaining,
          target_battery_percent: activeSession?.target_battery_percent,
        });
        
        // Only update if session exists
        if (activeSession) {
          setSession(activeSession);
          setError(null);
          setLoading(false); // Stop loading when session found
          
          // If backend provides current_meter, use it (for new session or sync)
          if (activeSession.current_meter !== undefined) {
            console.log('✅ Using backend current_meter:', activeSession.current_meter);
            setCurrentMeter(activeSession.current_meter);
          } else if (!activeSession.current_meter) {
            // Fallback: new session without backend calculation yet
            console.log('⚠️ No backend current_meter, using meter_start:', activeSession.meter_start);
            setCurrentMeter(activeSession.meter_start);
          }
        } else {
          // No active session - just stop loading, don't retry on polling
          console.log('ℹ️ No active session found');
          setSession(null);
          setError(null);
          setLoading(false);
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
        setLoading(false);
      }
    };

    // Fetch immediately
    fetchActiveSession();

    // Poll every 5 seconds for faster updates after payment
    const interval = setInterval(fetchActiveSession, 5000);
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

  // ✅ Sync with backend data every 5 seconds
  useEffect(() => {
    if (!session) return;

    // If backend provides calculated values, use them as authoritative
    if ('current_meter' in session && typeof session.current_meter === 'number') {
      setCurrentMeter(session.current_meter);
      setLastUpdate(new Date());
    }

    if ('estimated_cost' in session && typeof session.estimated_cost === 'number') {
      setEstimatedCost(session.estimated_cost);
    }

    if ('battery_progress' in session && typeof session.battery_progress === 'number') {
      console.log('🔋 Setting battery progress from backend:', {
        session_id: session.session_id,
        battery_progress: session.battery_progress,
        initial_battery_percent: session.initial_battery_percent,
        target_battery_percent: session.target_battery_percent,
        elapsed_hours: session.elapsed_hours
      });
      setBatteryProgress(session.battery_progress);
    }

    if ('charging_rate_kw' in session && typeof session.charging_rate_kw === 'number') {
      setChargingRate(session.charging_rate_kw);
    }
  }, [session]);

  // 🔄 Smooth UI interpolation between backend syncs (every 1 second)
  // This makes UI feel real-time while backend provides accurate values every 5s
  useEffect(() => {
    if (!session || !session.charging_points?.power_kw) {
      console.log('⏸️ Interpolation paused - no session or power data');
      return;
    }

    const chargingPowerKw = session.charging_points.power_kw;
    const pricePerKwh = session.charging_points?.stations?.price_per_kwh || 5000;
    const maxCapacity = session.vehicles?.battery_capacity_kwh || 100;

    console.log('▶️ Starting interpolation:', {
      sessionId: session.session_id,
      chargingPowerKw,
      pricePerKwh,
      maxCapacity,
      meterStart: session.meter_start,
    });

    let logCounter = 0; // Throttle logs (only every 5 seconds)

    const interpolateValues = () => {
      // Calculate time-based increment (energy per second)
      const energyPerSecond = chargingPowerKw / 3600; // kW to kWh per second
      
      setCurrentMeter(prev => {
        const newMeter = prev + energyPerSecond;
        const totalEnergy = newMeter - session.meter_start;
        
        // Check if already at backend-calculated capacity
        // If backend sent current_meter that's already capped, respect it
        if (session.current_meter && prev >= session.current_meter) {
          if (logCounter % 5 === 0) {
            console.log('⏸️ At backend capacity limit:', {
              currentMeter: prev.toFixed(2),
              backendMeter: session.current_meter.toFixed(2),
              totalEnergy: totalEnergy.toFixed(2),
            });
          }
          logCounter++;
          return prev; // Don't increment beyond backend calculation
        }
        
        // Safety cap: Allow 20% over capacity (for charging losses) or max 300 kWh
        const safetyLimit = Math.max(maxCapacity * 1.2, 300);
        if (totalEnergy >= safetyLimit) {
          if (logCounter % 5 === 0) {
            console.log('🛑 Reached safety limit', {
              totalEnergy: totalEnergy.toFixed(2),
              safetyLimit: safetyLimit.toFixed(2),
            });
          }
          logCounter++;
          return prev;
        }
        
        // Log every 5 seconds
        if (logCounter % 5 === 0) {
          console.log('⚡ Meter incrementing:', {
            prev: prev.toFixed(4),
            new: newMeter.toFixed(4),
            totalEnergy: totalEnergy.toFixed(2),
            energyPerSec: energyPerSecond.toFixed(6),
          });
        }
        logCounter++;
        
        return newMeter;
      });

      // Update cost in sync with meter
      setEstimatedCost(prev => {
        const costIncrement = energyPerSecond * pricePerKwh;
        return prev + costIncrement;
      });

      // Update battery progress (initial + added energy %)
      if (session.vehicles?.battery_capacity_kwh) {
        const batteryCapacity = session.vehicles.battery_capacity_kwh;
        
        setBatteryProgress(prev => {
          const progressIncrement = (energyPerSecond / batteryCapacity) * 100;
          const newProgress = prev + progressIncrement;
          
          // Cap at target if specified, otherwise cap at 100%
          const targetPercent = session.target_battery_percent || 100;
          return Math.min(newProgress, targetPercent, 100);
        });
      }

      setLastUpdate(new Date());
    };

    // Update every 1 second for smooth UI
    const interval = setInterval(interpolateValues, 1000);
    return () => clearInterval(interval);
  }, [session]);

  const getLastUpdateText = () => {
    const diffMs = new Date().getTime() - lastUpdate.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffSeconds = Math.floor(diffMs / 1000);
    
    if (diffSeconds < 60) return `${diffSeconds} giây trước`;
    if (diffMinutes === 0) return 'Vừa xong';
    return `${diffMinutes} phút trước`;
  };

  const formatCurrency = (amount: number) => {
    // VND should be whole numbers (no decimals)
    const roundedAmount = Math.round(amount);
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(roundedAmount);
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

  // Debug render state
  console.log('🎨 ActiveChargingSession render:', {
    loading,
    hasSession: !!session,
    sessionId: session?.session_id,
    hasError: !!error,
    hasPaymentData: !!paymentData,
    userId: user?.id,
  });

  // Show loading animation
  if (loading) {
    console.log('⏳ Rendering loading state...');
    return (
      <Card>
        <CardContent className="p-12">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative">
              {/* Animated charging bolt */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-green-600 animate-spin" />
              </div>
              <Zap className="w-12 h-12 text-green-600 animate-pulse" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-lg font-semibold text-gray-700">
                Đang tải phiên sạc...
              </p>
              <p className="text-sm text-gray-500">
                Vui lòng đợi trong giây lát
              </p>
            </div>
            {/* Animated progress dots */}
            <div className="flex gap-2">
              <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show error state
  if (error) {
    console.log('❌ Rendering error state:', error);
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
    console.log('ℹ️ Rendering "No active session" state');
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

  // ✅ Use backend-calculated values or fallback to simple calculation
  const energyConsumed = session.energy_consumed_kwh || (currentMeter - session.meter_start);
  const station = session.charging_points?.stations;

  // Check for charging warnings
  // Note: We can't determine actual battery fullness without knowing initial battery level
  // So instead, we warn based on:
  // 1. Energy consumed approaching battery capacity (may indicate full charge)
  // 2. Charging duration is unusually long (potential idle time)
  const batteryCapacity = session.vehicles?.battery_capacity_kwh || 100;
  const chargingPowerKw = session.charging_points?.power_kw || 7;
  
  // Calculate expected time to full charge (hours)
  const expectedFullChargeHours = batteryCapacity / chargingPowerKw;
  const sessionDurationMs = new Date().getTime() - new Date(session.start_time).getTime();
  const sessionDurationHours = sessionDurationMs / (1000 * 60 * 60);
  
  // Show warning if:
  // - Energy consumed >= 90% of battery capacity (likely near full)
  // - OR session duration > 1.5x expected full charge time (likely finished + idle)
  const isLikelyFull = energyConsumed >= batteryCapacity * 0.9;
  const isTakingTooLong = sessionDurationHours >= expectedFullChargeHours * 1.5;
  const shouldWarn = isLikelyFull || isTakingTooLong;

  return (
    <div className="space-y-6">
      {/* Charging Warning */}
      {shouldWarn && (
        <Alert className="border-yellow-500 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>⚠️ Lưu ý:</strong> {isLikelyFull 
              ? 'Đã sạc gần đến dung lượng pin. Vui lòng kiểm tra và dừng sạc nếu đã đầy.' 
              : 'Phiên sạc đã kéo dài. Vui lòng kiểm tra xe để tránh phí chờ không cần thiết.'}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Active Session Banner */}
      <Alert className={shouldWarn ? "border-yellow-500 bg-yellow-50" : "border-green-500 bg-green-50"}>
        <CheckCircle className={`h-4 w-4 ${shouldWarn ? 'text-yellow-600' : 'text-green-600'}`} />
        <AlertDescription className={`flex justify-between items-center ${shouldWarn ? 'text-yellow-800' : 'text-green-800'}`}>
          <span>
            <strong>{shouldWarn ? '⚠️ Kiểm tra xe' : 'Đang sạc điện'}</strong> - {shouldWarn ? 'Có thể đã sạc xong' : 'Xe của bạn đang được sạc'}
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
      <Card className="border-l-4 border-l-green-500 overflow-visible">
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
              <Badge className="bg-green-500 hover:bg-green-600 animate-pulse">
                <span className="mr-2">●</span> Real-time
              </Badge>
              <Badge variant="outline" className="text-xs">
                Auto-update
              </Badge>
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
                    {(session.initial_battery_percent !== undefined && session.initial_battery_percent !== null) && (
                      <span className="text-blue-600">
                        {session.initial_battery_percent.toFixed(0)}% → {session.target_battery_percent || 100}%
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <Progress 
                value={batteryProgress} 
                className="h-3"
              />
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="text-gray-600">
                  <span>Xe: {session.vehicles.plate_number}</span>
                </div>
                <div className="text-right text-gray-600 flex items-center justify-end gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {chargingRate.toFixed(1)} kW
                </div>
                {session.estimated_minutes_remaining !== null && session.estimated_minutes_remaining !== undefined && (
                  <>
                    <div className="text-gray-600">
                      Năng lượng: {energyConsumed.toFixed(1)} / {session.vehicles.battery_capacity_kwh} kWh
                    </div>
                    <div className="text-right">
                      {session.estimated_minutes_remaining > 0 ? (
                        <span className="text-blue-600 font-medium">
                          ⏱️ Còn ~{Math.ceil(session.estimated_minutes_remaining)} phút
                        </span>
                      ) : (
                        <span className="text-green-600 font-medium">
                          ✓ Đã đạt mục tiêu
                        </span>
                      )}
                    </div>
                  </>
                )}
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
            {/* Duration / Time Remaining */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center text-blue-600 mb-2">
                <Timer className="w-4 h-4 mr-2" />
                <span className="text-xs font-medium uppercase">
                  {session.estimated_minutes_remaining !== null && session.estimated_minutes_remaining !== undefined 
                    ? 'Còn lại' 
                    : 'Thời gian'}
                </span>
              </div>
              {session.estimated_minutes_remaining !== null && session.estimated_minutes_remaining !== undefined ? (
                <>
                  <p className="text-2xl font-bold text-blue-900">
                    {session.estimated_minutes_remaining > 0 
                      ? `${Math.ceil(session.estimated_minutes_remaining)} phút` 
                      : 'Hoàn tất'}
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    {session.estimated_minutes_remaining > 0 ? 'Ước tính' : '✓ Đã đạt mục tiêu'}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-2xl font-bold text-blue-900">{duration}</p>
                  <p className="text-xs text-blue-700 mt-1">Đang chạy</p>
                </>
              )}
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

          {/* Info Box */}
          <Alert className="bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-xs text-blue-800">
              <strong>Lưu ý:</strong> Xe của bạn sẽ tiếp tục sạc cho đến khi bạn nhấn "Dừng sạc". 
              Phí chờ có thể được áp dụng nếu bạn để xe kết nối sau khi sạc xong.
            </AlertDescription>
          </Alert>

          {/* Action Buttons - Enhanced */}
          <div className="pt-4 pb-2">
            <Button
              onClick={handleStopSession}
              style={{ backgroundColor: '#dc2626', color: 'white', borderColor: '#dc2626' }}
              className="w-full h-14 hover:opacity-90 text-lg font-semibold shadow-lg transition-opacity"
              disabled={stopping}
            >
              {stopping ? (
                <>
                  <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                  Đang dừng...
                </>
              ) : (
                <>
                  <StopCircle className="w-5 h-5 mr-3" />
                  Dừng sạc & Thanh toán
                </>
              )}
            </Button>
            <p className="text-xs text-gray-500 text-center mt-2">
              Số đo công tơ tự động cập nhật mỗi 5 giây
            </p>
          </div>
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
