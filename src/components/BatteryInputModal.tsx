import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Slider } from './ui/slider';
import { Alert, AlertDescription } from './ui/alert';
import { Battery, Zap, Clock, Info } from 'lucide-react';

interface BatteryInputModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicleBatteryCapacity: number;  // kWh
  chargingPowerKw: number;         // kW
  onConfirm: (batteryPercent: number, targetPercent: number) => void;
}

export function BatteryInputModal({
  open,
  onOpenChange,
  vehicleBatteryCapacity,
  chargingPowerKw,
  onConfirm,
}: BatteryInputModalProps) {
  const [currentBattery, setCurrentBattery] = useState<number>(50);
  const [targetBattery, setTargetBattery] = useState<number>(100);
  const [inputValue, setInputValue] = useState<string>('50');

  // Calculate estimates
  const percentToCharge = Math.max(0, targetBattery - currentBattery);
  const energyNeeded = (percentToCharge / 100) * vehicleBatteryCapacity;
  const hoursNeeded = energyNeeded / chargingPowerKw;
  const minutesNeeded = Math.ceil(hoursNeeded * 60);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0 && num <= 100) {
      setCurrentBattery(num);
    }
  };

  const handleSliderChange = (values: number[]) => {
    const value = values[0];
    setCurrentBattery(value);
    setInputValue(value.toString());
  };

  const handleConfirm = () => {
    if (currentBattery >= targetBattery) {
      return; // Invalid: current already at or above target
    }
    onConfirm(currentBattery, targetBattery);
    onOpenChange(false);
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} phút`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}phút`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Battery className="w-5 h-5 text-green-600" />
            Thông tin pin hiện tại
          </DialogTitle>
          <DialogDescription>
            Vui lòng nhập mức pin hiện tại của xe để chúng tôi ước tính thời gian sạc và cảnh báo khi pin đầy.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Battery Input */}
          <div className="space-y-3">
            <Label htmlFor="battery-input" className="text-base font-medium">
              Mức pin hiện tại
            </Label>
            
            {/* Slider */}
            <div className="px-2">
              <Slider
                id="battery-slider"
                min={0}
                max={100}
                step={1}
                value={[currentBattery]}
                onValueChange={handleSliderChange}
                className="w-full"
              />
            </div>

            {/* Number Input */}
            <div className="flex items-center gap-3">
              <Input
                id="battery-input"
                type="number"
                min="0"
                max="100"
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                className="text-lg text-center font-semibold"
              />
              <span className="text-2xl font-bold text-green-600">%</span>
            </div>

            {/* Visual Battery Indicator */}
            <div className="flex items-center gap-2 justify-center">
              <Battery 
                className={`w-8 h-8 ${
                  currentBattery > 60 ? 'text-green-500' : 
                  currentBattery > 30 ? 'text-yellow-500' : 
                  'text-red-500'
                }`} 
              />
              <span className="text-sm text-gray-600">
                {currentBattery > 80 ? 'Pin cao' : 
                 currentBattery > 50 ? 'Pin trung bình' : 
                 currentBattery > 20 ? 'Pin thấp' : 
                 'Pin rất thấp'}
              </span>
            </div>
          </div>

          {/* Target Battery */}
          <div className="space-y-3">
            <Label htmlFor="target-battery" className="text-base font-medium">
              Sạc đến mức
            </Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={targetBattery === 80 ? 'default' : 'outline'}
                onClick={() => setTargetBattery(80)}
                className="flex-1"
              >
                80% (Khuyến nghị)
              </Button>
              <Button
                type="button"
                variant={targetBattery === 100 ? 'default' : 'outline'}
                onClick={() => setTargetBattery(100)}
                className="flex-1"
              >
                100% (Đầy)
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              💡 Sạc đến 80% giúp bảo vệ pin và nhanh hơn
            </p>
          </div>

          {/* Estimate Info */}
          {percentToCharge > 0 && (
            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Năng lượng cần sạc:
                    </span>
                    <span className="font-semibold">
                      {energyNeeded.toFixed(1)} kWh
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Thời gian ước tính:
                    </span>
                    <span className="font-semibold">
                      {formatTime(minutesNeeded)}
                    </span>
                  </div>
                  <div className="text-xs pt-1 border-t border-blue-300">
                    Công suất sạc: {chargingPowerKw} kW
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Warning if current >= target */}
          {currentBattery >= targetBattery && (
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertDescription className="text-yellow-800 text-sm">
                ⚠️ Mức pin hiện tại đã đạt hoặc vượt mục tiêu. Vui lòng kiểm tra lại.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={currentBattery >= targetBattery}
            className="bg-green-600 hover:bg-green-700"
          >
            Xác nhận & Bắt đầu sạc
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
