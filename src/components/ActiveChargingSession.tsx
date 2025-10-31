import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import {
  Zap,
  Battery,
  Clock,
  DollarSign,
  Gauge,
  StopCircle,
  MapPin,
  AlertCircle,
  CheckCircle,
  Loader2,
  Timer,
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
  } | null>(null);

  // Poll for active session
  useEffect(() => {
    if (!user) return;

    const fetchActiveSession = async () => {
      try {
        // Assuming user.id is the numeric user_id
        const userId = parseInt(user.id);
        const activeSession = await chargingSessionApi.getActiveSession(userId);
        setSession(activeSession);
        if (activeSession) {
          setCurrentMeter(activeSession.meter_start);
        }
      } catch (err) {
        console.error('Error fetching active session:', err);
        setError(err instanceof Error ? err.message : 'Failed to load session');
      } finally {
        setLoading(false);
      }
    };

    fetchActiveSession();

    // Poll every 10 seconds
    const interval = setInterval(fetchActiveSession, 10000);
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

  // Calculate estimated cost
  useEffect(() => {
    if (!session || !session.charging_points?.stations) return;

    const pricePerKwh = session.charging_points.stations.price_rate;
    const idleFeePerMin = session.charging_points.idle_fee_per_min || 0;
    
    const cost = chargingSessionApi.calculateEstimatedCost(
      session.meter_start,
      currentMeter,
      pricePerKwh,
      0, // No idle time yet
      idleFeePerMin
    );
    
    setEstimatedCost(cost);
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
    } catch (err) {
      console.error('Error updating meter:', err);
    }
  };

  const handleStopSession = async () => {
    if (!session) return;

    setStopping(true);
    setError(null);

    try {
      // Get final meter reading (in real app, this would come from actual meter)
      const finalMeter = currentMeter + Math.random() * 2;

      const result = await chargingSessionApi.stopSession(session.session_id, {
        meter_end: finalMeter,
        idle_minutes: 0, // Could be calculated based on last charge vs current time
      });

      // Prepare payment data
      // Ensure amount is in VND (integer) and meets MoMo minimum of 1000 VND
      const costInVND = Math.max(1000, Math.round(result.cost || 0));
      
      const sessionPaymentData = {
        sessionId: session.session_id,
        stationName: session.charging_points?.stations?.name || 'Unknown Station',
        pointName: session.charging_points?.name || `Point #${session.point_id}`,
        startTime: session.start_time,
        endTime: new Date().toISOString(),
        energyConsumed: result.energy_consumed_kwh || 0,
        duration: chargingSessionApi.formatDuration(session.start_time),
        amount: costInVND,
        pricePerKwh: session.charging_points?.stations?.price_rate || 5000,
      };

      console.log('💳 Opening payment modal:', {
        amount: sessionPaymentData.amount,
        energy: sessionPaymentData.energyConsumed,
        fullData: sessionPaymentData
      });

      // Set payment data and show modal
      setPaymentData(sessionPaymentData);
      setShowPaymentModal(true);
      
      console.log('✅ Payment modal state set:', {
        paymentData: sessionPaymentData,
        showPaymentModal: true
      });
      
      // Show toast notification
      toast.success('Phiên sạc đã kết thúc! Vui lòng thanh toán.');

      // DON'T call onSessionEnd here - it will refresh the parent and clear our state
      // We'll call it after payment is complete
      // Clear session from state but keep payment modal open
      setSession(null);
    } catch (err) {
      console.error('Error stopping session:', err);
      setError(err instanceof Error ? err.message : 'Failed to stop session');
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
              onPaymentSuccess={() => {
                setShowPaymentModal(false);
                setPaymentData(null);
                // Now it's safe to call onSessionEnd after payment is complete
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
    <div className="space-y-4">
      {/* Active Session Banner */}
      <Alert className="border-green-500 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <strong>Charging in progress</strong> - Your vehicle is currently charging
        </AlertDescription>
      </Alert>

      {error && (
        <Alert className="border-red-500 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Session Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-green-600" />
              Active Charging Session
            </CardTitle>
            <Badge className="bg-green-500 hover:bg-green-600">
              <span className="animate-pulse mr-2">●</span> Live
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Station Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">{station?.name || 'Unknown Station'}</h3>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  {station?.address || 'N/A'}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Gauge className="w-4 h-4 mr-2" />
                  {session.charging_points?.name || `Point #${session.point_id}`} • {session.charging_points?.power_kw || 0} kW
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Duration */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center text-blue-600 mb-2">
                <Timer className="w-4 h-4 mr-2" />
                <span className="text-xs font-medium">Duration</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">{duration}</p>
            </div>

            {/* Energy Consumed */}
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center text-green-600 mb-2">
                <Battery className="w-4 h-4 mr-2" />
                <span className="text-xs font-medium">Energy</span>
              </div>
              <p className="text-2xl font-bold text-green-900">
                {energyConsumed.toFixed(1)} <span className="text-sm">kWh</span>
              </p>
            </div>

            {/* Current Cost */}
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center text-purple-600 mb-2">
                <DollarSign className="w-4 h-4 mr-2" />
                <span className="text-xs font-medium">Est. Cost</span>
              </div>
              <p className="text-xl font-bold text-purple-900">
                {chargingSessionApi.formatCost(estimatedCost)}
              </p>
            </div>

            {/* Price Rate */}
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center text-orange-600 mb-2">
                <Gauge className="w-4 h-4 mr-2" />
                <span className="text-xs font-medium">Rate</span>
              </div>
              <p className="text-lg font-bold text-orange-900">
                {chargingSessionApi.formatCost(station?.price_rate || 0)}/kWh
              </p>
            </div>
          </div>

          {/* Meter Readings */}
          <div className="border rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-sm text-gray-700">Meter Readings</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Start</p>
                <p className="text-lg font-semibold">{session.meter_start.toFixed(2)} kWh</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Current</p>
                <p className="text-lg font-semibold text-green-600">
                  {currentMeter.toFixed(2)} kWh
                </p>
              </div>
            </div>
          </div>

          {/* Session Details */}
          <div className="border-t pt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Session ID</span>
              <span className="font-medium">#{session.session_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Started at</span>
              <span className="font-medium">
                {new Date(session.start_time).toLocaleTimeString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  day: '2-digit',
                  month: '2-digit',
                })}
              </span>
            </div>
            {session.vehicles && (
              <div className="flex justify-between">
                <span className="text-gray-600">Vehicle</span>
                <span className="font-medium">{session.vehicles.plate_number}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleUpdateMeter}
              variant="outline"
              className="flex-1"
              disabled={stopping}
            >
              <Clock className="w-4 h-4 mr-2" />
              Refresh Meter
            </Button>
            <Button
              onClick={handleStopSession}
              variant="destructive"
              className="flex-1"
              disabled={stopping}
            >
              {stopping ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Stopping...
                </>
              ) : (
                <>
                  <StopCircle className="w-4 h-4 mr-2" />
                  Stop Charging
                </>
              )}
            </Button>
          </div>

          {/* Info Box */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Your vehicle will continue charging until you press "Stop Charging". 
              Idle fees may apply if you stay connected after charging completes.
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
            onPaymentSuccess={() => {
              setShowPaymentModal(false);
              setPaymentData(null);
              // Could refresh the dashboard or show success message
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
