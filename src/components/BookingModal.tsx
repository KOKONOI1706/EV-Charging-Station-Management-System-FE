import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Calendar } from "./ui/calendar";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import {
  CalendarIcon,
  Clock,
  Zap,
  MapPin,
  CreditCard,
  Check,
} from "lucide-react";
import { Station, Booking } from "../data/mockDatabase";

interface BookingModalProps {
  station: Station | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmBooking: (booking: Partial<Booking>) => void;
}

export function BookingModal({
  station,
  isOpen,
  onClose,
  onConfirmBooking,
}: BookingModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [selectedTime, setSelectedTime] = useState("");
  const [duration, setDuration] = useState("2");
  const [step, setStep] = useState(1);

  const timeSlots = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
  ];

  const handleBooking = () => {
    if (!station || !selectedDate || !selectedTime) return;

    const booking = {
      stationId: station.id,
      station: station,
      date: selectedDate,
      time: selectedTime,
      duration: duration,
      status: "confirmed" as const,
      price: calculatePrice(),
    };

    onConfirmBooking(booking);
    setStep(3);
  };

  const calculatePrice = () => {
    if (!station) return 0;
    const pricePerKwh = station.pricePerKwh || parseFloat(station.price.replace("$", "").replace("/kWh", ""));
    const estimatedKwh = parseInt(duration) * 25; // Assuming 25kWh per hour
    return (pricePerKwh * estimatedKwh).toFixed(2);
  };

  const resetModal = () => {
    setStep(1);
    setSelectedTime("");
    setDuration("2");
    onClose();
  };

  if (!station) return null;

  return (
    <Dialog open={isOpen} onOpenChange={resetModal}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-green-600" />
            Book Charging Session
          </DialogTitle>
          <DialogDescription>
            Select your preferred date, time, and duration for your EV charging session at {station.name}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Station Summary */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={station.image}
                    alt={station.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{station.name}</h3>
                  <div className="flex items-center text-gray-600 text-sm">
                    <MapPin className="w-4 h-4 mr-1" />
                    {station.address}
                  </div>
                  <div className="flex items-center gap-4 text-sm mt-2">
                    <span className="flex items-center">
                      <Zap className="w-4 h-4 mr-1 text-green-600" />
                      {station.power}
                    </span>
                    <span>{station.price}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <Label className="text-base font-medium mb-4 block">
                  Select Date
                </Label>
                <div className="border rounded-lg p-4">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date()}
                    className="rounded-md"
                  />
                </div>
              </div>

              <div>
                <Label className="text-base font-medium mb-4 block">
                  Select Time Slot
                </Label>
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.map((time) => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTime(time)}
                      className={
                        selectedTime === time
                          ? "bg-green-600 hover:bg-green-700"
                          : ""
                      }
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="duration" className="text-base font-medium">
                  Charging Duration (hours)
                </Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  max="8"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="mt-2"
                />
              </div>

              <Button
                onClick={() => setStep(2)}
                disabled={!selectedDate || !selectedTime}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Continue to Payment
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Booking Summary</h3>
                <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{selectedDate?.toDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time:</span>
                    <span>{selectedTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span>{duration} hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Usage:</span>
                    <span>{parseInt(duration) * 25} kWh</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total Cost:</span>
                    <span>${calculatePrice()}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
                <Card className="border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-8 h-8 text-green-600" />
                      <div>
                        <p className="font-medium">Credit Card ending in 1234</p>
                        <p className="text-sm text-gray-600">Expires 12/25</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleBooking}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Confirm Booking
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Booking Confirmed!</h3>
                <p className="text-gray-600">
                  Your charging session has been successfully booked. You'll
                  receive a confirmation email shortly.
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-left">
                <h4 className="font-medium mb-2">Booking Details:</h4>
                <p className="text-sm text-gray-600 mb-1">
                  Session ID: CS{Date.now().toString().slice(-6)}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  {selectedDate?.toDateString()} at {selectedTime}
                </p>
                <p className="text-sm text-gray-600">
                  Duration: {duration} hours
                </p>
              </div>
              <Button
                onClick={resetModal}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Done
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}