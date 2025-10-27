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
  Loader2,
} from "lucide-react";
import { SupabaseService, Station, Reservation } from "../services/supabaseService";
import { PaymentService } from "../services/paymentService";

interface BookingModalProps {
  station: Station | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmBooking: (reservation: Partial<Reservation>) => void;
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'stripe' | 'payos'>('stripe');

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

  const handleBooking = async () => {
    if (!station || !selectedDate || !selectedTime) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Get current user (you would implement proper auth)
      const userId = "user_001"; // This should come from auth context
      
      // Create reservation in Supabase
      const startDateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':').map(Number);
      startDateTime.setHours(hours, minutes, 0, 0);
      
      const endDateTime = new Date(startDateTime);
      endDateTime.setHours(startDateTime.getHours() + parseInt(duration));

      const reservation = await SupabaseService.reserveStation(
        station.id,
        userId,
        startDateTime.toISOString(),
        endDateTime.toISOString(),
        parseInt(duration)
      );

      if (!reservation) {
        throw new Error('Failed to create reservation');
      }

      // Process payment
      const paymentResult = await PaymentService.createPaymentSession(
        reservation.id,
        reservation.total_cost,
        selectedPaymentMethod
      );

      if (paymentResult.success) {
        // Update reservation with payment info
        await SupabaseService.processPayment(
          reservation.id,
          selectedPaymentMethod,
          paymentResult.paymentId || ''
        );

        onConfirmBooking(reservation);
        setStep(3);
      } else {
        throw new Error(paymentResult.error || 'Payment failed');
      }
    } catch (err) {
      console.error('Booking error:', err);
      setError(err instanceof Error ? err.message : 'Booking failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const calculatePrice = () => {
    if (!station) return "0.00";
    const pricePerKwh = station.price_per_kwh;
    const estimatedKwh = parseInt(duration) * 25; // Assuming 25kWh per hour
    const subtotal = pricePerKwh * estimatedKwh;
    const tax = subtotal * 0.0825; // 8.25% tax
    const total = subtotal + tax;
    return total.toFixed(2);
  };

  const calculateSubtotal = () => {
    if (!station) return "0.00";
    const pricePerKwh = station.price_per_kwh;
    const estimatedKwh = parseInt(duration) * 25;
    return (pricePerKwh * estimatedKwh).toFixed(2);
  };

  const calculateTax = () => {
    const subtotal = parseFloat(calculateSubtotal());
    return (subtotal * 0.0825).toFixed(2);
  };

  const resetModal = () => {
    setStep(1);
    setSelectedTime("");
    setDuration("2");
    setError(null);
    setIsProcessing(false);
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
                    src={station.image_url || 'https://images.unsplash.com/photo-1751355356724-7df0dda28b2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpYyUyMHZlaGljbGUlMjBjaGFyZ2luZyUyMHN0YXRpb24lMjBtb2Rlcm58ZW58MXx8fHwxNzU4Njc4NDg3fDA&ixlib=rb-4.1.0&q=80&w=1080'}
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
                      {station.power_kw}kW
                    </span>
                    <span>${station.price_per_kwh}/kWh</span>
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
                    disabled={(date: Date) => date < new Date()}
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
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

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
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${calculateSubtotal()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (8.25%):</span>
                    <span>${calculateTax()}</span>
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
                <div className="space-y-3">
                  {PaymentService.getSupportedMethods().includes('stripe') && (
                    <Card 
                      className={`border-2 cursor-pointer transition-colors ${
                        selectedPaymentMethod === 'stripe' ? 'border-green-500 bg-green-50' : 'border-gray-200'
                      }`}
                      onClick={() => setSelectedPaymentMethod('stripe')}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">Credit Card (Stripe)</p>
                            <p className="text-sm text-gray-600">Visa, Mastercard, American Express</p>
                          </div>
                          {selectedPaymentMethod === 'stripe' && (
                            <Check className="w-5 h-5 text-green-600 ml-auto" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {PaymentService.getSupportedMethods().includes('payos') && (
                    <Card 
                      className={`border-2 cursor-pointer transition-colors ${
                        selectedPaymentMethod === 'payos' ? 'border-green-500 bg-green-50' : 'border-gray-200'
                      }`}
                      onClick={() => setSelectedPaymentMethod('payos')}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium">PayOS</p>
                            <p className="text-sm text-gray-600">Vietnamese payment gateway</p>
                          </div>
                          {selectedPaymentMethod === 'payos' && (
                            <Check className="w-5 h-5 text-green-600 ml-auto" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                  disabled={isProcessing}
                >
                  Back
                </Button>
                <Button
                  onClick={handleBooking}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Confirm & Pay'
                  )}
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