import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import {
  Zap,
  Battery,
  AlertCircle,
  Loader2,
  Car,
  Gauge,
} from 'lucide-react';
import { chargingSessionApi, StartSessionRequest } from '../api/chargingSessionApi';
import { useAuth } from '../contexts/AuthContext';

interface StartChargingModalProps {
  isOpen: boolean;
  onClose: () => void;
  pointId: number;
  pointName: string;
  stationName: string;
  powerKw: number;
  pricePerKwh: number;
  bookingId?: number;
  onSuccess?: () => void;
}

export function StartChargingModal({
  isOpen,
  onClose,
  pointId,
  pointName,
  stationName,
  powerKw,
  pricePerKwh,
  bookingId,
  onSuccess,
}: StartChargingModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meterStart, setMeterStart] = useState<string>('');
  const [vehiclePlate, setVehiclePlate] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setMeterStart('');
      setVehiclePlate('');
      setError(null);
    }
  }, [isOpen]);

  const handleStartCharging = async () => {
    if (!user) {
      setError('Please login to start charging');
      return;
    }

    if (!meterStart || parseFloat(meterStart) <= 0) {
      setError('Please enter a valid meter reading');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const userId = parseInt(user.id);
      
      const requestData: StartSessionRequest = {
        user_id: userId,
        point_id: pointId,
        meter_start: parseFloat(meterStart),
      };

      // Add booking_id if provided
      if (bookingId) {
        requestData.booking_id = bookingId;
      }

      // Add vehicle info if provided (would need vehicle_id from backend)
      // For now, we'll skip vehicle_id

      await chargingSessionApi.startSession(requestData);

      // Success!
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err) {
      console.error('Error starting session:', err);
      setError(err instanceof Error ? err.message : 'Failed to start charging session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-green-600" />
            Start Charging Session
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Station Info */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Station</span>
              <span className="font-semibold">{stationName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Charging Point</span>
              <span className="font-semibold">{pointName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Power</span>
              <span className="font-semibold flex items-center">
                <Gauge className="w-4 h-4 mr-1" />
                {powerKw} kW
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Price</span>
              <span className="font-semibold">
                {chargingSessionApi.formatCost(pricePerKwh)}/kWh
              </span>
            </div>
          </div>

          {/* Vehicle Plate (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="vehicle-plate" className="flex items-center gap-2">
              <Car className="w-4 h-4" />
              Vehicle Plate Number (Optional)
            </Label>
            <Input
              id="vehicle-plate"
              placeholder="e.g., 30A-12345"
              value={vehiclePlate}
              onChange={(e) => setVehiclePlate(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Meter Start Reading */}
          <div className="space-y-2">
            <Label htmlFor="meter-start" className="flex items-center gap-2">
              <Battery className="w-4 h-4" />
              Initial Meter Reading (kWh) *
            </Label>
            <Input
              id="meter-start"
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g., 12500.5"
              value={meterStart}
              onChange={(e) => setMeterStart(e.target.value)}
              disabled={loading}
              required
            />
            <p className="text-xs text-gray-500">
              Enter the meter reading shown on the charging point display
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <Alert className="border-red-500 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {/* Info Box */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>Important:</strong> Make sure your vehicle is properly connected to the charging point before starting the session.
              You will be charged based on the energy consumed (kWh).
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleStartCharging}
            disabled={loading || !meterStart}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Start Charging
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
