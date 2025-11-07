import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import {
  Zap,
  Battery,
  AlertCircle,
  Loader2,
  Gauge,
  Car,
  Plus,
} from 'lucide-react';
import { chargingSessionApi, StartSessionRequest } from '../api/chargingSessionApi';
import { vehicleApi, Vehicle } from '../api/vehicleApi';
import { useAuth } from '../contexts/AuthContext';
import { BatteryInputModal } from './BatteryInputModal';

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
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meterStart, setMeterStart] = useState<string>('');
  
  // Vehicle selection state
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  
  // Battery modal state
  const [showBatteryModal, setShowBatteryModal] = useState(false);

  // Load user vehicles when modal opens
  useEffect(() => {
    if (isOpen && user) {
      loadUserVehicles();
      // Reset form when modal opens
      setMeterStart('');
      setError(null);
      setSelectedVehicle(null);
    }
  }, [isOpen, user]);

  const loadUserVehicles = async () => {
    if (!user) return;
    
    setLoadingVehicles(true);
    try {
      const userId = parseInt(user.id);
      const userVehicles = await vehicleApi.getUserVehicles(userId);
      setVehicles(userVehicles);
      
      // Auto-select if only one vehicle
      if (userVehicles.length === 1) {
        setSelectedVehicle(userVehicles[0]);
      }
    } catch (err) {
      console.error('Error loading vehicles:', err);
      setError('Không thể tải danh sách xe. Vui lòng thử lại.');
    } finally {
      setLoadingVehicles(false);
    }
  };

  const handleProceedToStart = () => {
    // Validate meter reading
    const parsedValue = parseFloat(meterStart);
    if (!meterStart || isNaN(parsedValue) || parsedValue < 0 || parsedValue > 10000) {
      setError('Vui lòng nhập chỉ số đồng hồ hợp lệ (0-10,000 kWh)');
      return;
    }

    // If vehicle selected and has battery capacity, show battery modal
    if (selectedVehicle && selectedVehicle.battery_capacity_kwh) {
      setShowBatteryModal(true);
    } else {
      // No vehicle or no battery info, start directly without battery tracking
      handleStartCharging();
    }
  };

  const handleBatteryConfirm = (initialPercent: number, targetPercent: number) => {
    setShowBatteryModal(false);
    // Start charging with battery data
    handleStartCharging(initialPercent, targetPercent);
  };

  const handleStartCharging = async (initialBattery?: number, targetBattery?: number) => {
    if (!user) {
      setError('Vui lòng đăng nhập để bắt đầu sạc');
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

      // Add vehicle info if selected
      if (selectedVehicle) {
        requestData.vehicle_id = selectedVehicle.vehicle_id;
      }

      // Add battery tracking info if provided
      if (initialBattery !== undefined && targetBattery !== undefined) {
        requestData.initial_battery_percent = initialBattery;
        requestData.target_battery_percent = targetBattery;
      }

      console.log('🚀 Starting session with data:', requestData);

      await chargingSessionApi.startSession(requestData);

      // Success! Close modal IMMEDIATELY to prevent multiple clicks
      onClose();
      
      // Then trigger callbacks
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error starting session:', err);
      setError(err instanceof Error ? err.message : 'Không thể bắt đầu phiên sạc');
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
          <DialogDescription className="sr-only">
            Bắt đầu phiên sạc xe điện của bạn
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Station Info */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Trạm sạc</span>
              <span className="font-semibold">{stationName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Điểm sạc</span>
              <span className="font-semibold">{pointName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Công suất</span>
              <span className="font-semibold flex items-center">
                <Gauge className="w-4 h-4 mr-1" />
                {powerKw} kW
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Giá</span>
              <span className="font-semibold">
                {chargingSessionApi.formatCost(pricePerKwh)}/kWh
              </span>
            </div>
          </div>

          {/* Vehicle Selection */}
          <div className="space-y-2">
            <Label htmlFor="vehicle-select" className="flex items-center gap-2">
              <Car className="w-4 h-4" />
              Chọn xe <span className="text-gray-400 text-xs font-normal">(Tùy chọn)</span>
            </Label>
            
            {loadingVehicles ? (
              <div className="flex items-center justify-center p-4 border rounded-lg">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                <span className="text-sm text-gray-600">Đang tải danh sách xe...</span>
              </div>
            ) : vehicles.length > 0 ? (
              <div className="grid grid-cols-1 gap-2">
                {vehicles.map((vehicle) => (
                  <button
                    key={vehicle.vehicle_id}
                    type="button"
                    onClick={() => setSelectedVehicle(vehicle)}
                    disabled={loading}
                    className={`p-3 border-2 rounded-lg text-left transition-all ${
                      selectedVehicle?.vehicle_id === vehicle.vehicle_id
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-sm">
                          {vehicleApi.formatVehicleName(vehicle)}
                        </div>
                        <div className="text-xs text-gray-600">
                          Biển số: {vehicle.plate_number}
                        </div>
                        {vehicle.battery_capacity_kwh && (
                          <div className="text-xs text-green-600 mt-1">
                            <Battery className="w-3 h-3 inline mr-1" />
                            {vehicle.battery_capacity_kwh} kWh
                          </div>
                        )}
                      </div>
                      {selectedVehicle?.vehicle_id === vehicle.vehicle_id && (
                        <div className="text-green-600">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setSelectedVehicle(null)}
                  disabled={loading}
                  className="p-2 border-2 border-dashed border-gray-300 rounded-lg text-center text-sm text-gray-600 hover:border-gray-400 hover:bg-gray-50 transition-all"
                >
                  <Plus className="w-4 h-4 inline mr-1" />
                  Không chọn xe (Sạc nhanh)
                </button>
              </div>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Bạn chưa có xe nào. Bạn vẫn có thể bắt đầu sạc mà không cần chọn xe.
                </AlertDescription>
              </Alert>
            )}
            
            {selectedVehicle && selectedVehicle.battery_capacity_kwh && (
              <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                💡 Hệ thống sẽ ước tính thời gian sạc và cảnh báo khi pin đầy
              </p>
            )}
          </div>

          {/* Meter Start Reading */}
          <div className="space-y-2">
            <Label htmlFor="meter-start" className="flex items-center gap-2">
              <Gauge className="w-4 h-4" />
              Chỉ số đồng hồ ban đầu (kWh) *
            </Label>
            <Input
              id="meter-start"
              type="number"
              step="0.01"
              min="0"
              max="10000"
              placeholder="Ví dụ: 0 hoặc 150.5"
              value={meterStart}
              onChange={(e) => setMeterStart(e.target.value)}
              disabled={loading}
              required
            />
            <p className="text-xs text-gray-500">
              Nhập chỉ số đồng hồ hiển thị trên điểm sạc (thường là 0 để bắt đầu mới)
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
              <strong>Lưu ý:</strong> Đảm bảo xe của bạn đã được kết nối đúng cách với điểm sạc trước khi bắt đầu.
              Bạn sẽ được tính phí dựa trên năng lượng tiêu thụ (kWh).
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button
            onClick={handleProceedToStart}
            disabled={loading || !meterStart}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang khởi động...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Bắt đầu sạc
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Battery Input Modal */}
      {selectedVehicle && selectedVehicle.battery_capacity_kwh && (
        <BatteryInputModal
          open={showBatteryModal}
          onOpenChange={setShowBatteryModal}
          vehicleBatteryCapacity={selectedVehicle.battery_capacity_kwh}
          chargingPowerKw={powerKw}
          onConfirm={handleBatteryConfirm}
        />
      )}
    </Dialog>
  );
}
