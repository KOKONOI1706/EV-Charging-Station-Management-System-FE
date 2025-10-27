import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Zap,
  Star,
  Settings,
  CreditCard,
  Battery,
} from "lucide-react";
import { Booking } from "../data/mockDatabase";
import { MockDatabaseService } from "../data/mockDatabase";
import { toast } from "sonner";
import { ActiveChargingSession } from "./ActiveChargingSession";
import { ChargingHistory } from "./ChargingHistory";
import { StartChargingModal } from "./StartChargingModal";

interface UserDashboardProps {
  bookings: Booking[];
  userName: string;
  autoOpenStartCharging?: boolean;
  pendingChargingData?: {
    stationId: string;
    stationName: string;
    chargingPointId: string;
    reservationId: string;
    autoStartCharging: boolean;
  };
}

export function UserDashboard({ 
  bookings, 
  userName,
  autoOpenStartCharging = false,
  pendingChargingData
}: UserDashboardProps) {
  const [startChargingModal, setStartChargingModal] = useState<{
    isOpen: boolean;
    pointId?: number;
    pointName?: string;
    stationName?: string;
    powerKw?: number;
    pricePerKwh?: number;
    bookingId?: number;
  }>({
    isOpen: false,
  });

  // Auto-open start charging modal if coming from check-in
  useEffect(() => {
    const loadStationDetailsAndOpenModal = async () => {
      if (autoOpenStartCharging && pendingChargingData) {
        console.log('🚀 Auto-opening start charging modal from check-in:', pendingChargingData);
        
        try {
          // Fetch station details to get charging point info
          const stations = await MockDatabaseService.getStations();
          const station = stations.find(s => s.id === pendingChargingData.stationId);
          
          if (!station) {
            console.error('❌ Station not found:', pendingChargingData.stationId);
            return;
          }
          
          // Find an available charging point
          let targetPoint = station.chargingPoints?.find(
            cp => pendingChargingData.chargingPointId !== 'any' 
              ? cp.id === pendingChargingData.chargingPointId 
              : cp.status === 'available'
          );
          
          // If no point found or chargingPointId is "any", use first available
          if (!targetPoint) {
            targetPoint = station.chargingPoints?.find(cp => cp.status === 'available');
          }
          
          if (!targetPoint) {
            console.error('❌ No available charging point found');
            return;
          }
          
          console.log('✅ Found charging point:', targetPoint);
          
          // Extract numeric ID from string ID (e.g., 'cp-1' -> 1)
          const numericPointId = parseInt(targetPoint.id.replace(/\D/g, '')) || targetPoint.number;
          
          setStartChargingModal({
            isOpen: true,
            stationName: pendingChargingData.stationName,
            pointName: `Point ${targetPoint.number}`,
            pointId: numericPointId,
            powerKw: targetPoint.powerKw,
            pricePerKwh: station.pricePerKwh, // Use station's price
          });
        } catch (error) {
          console.error('❌ Error loading station details:', error);
        }
      }
    };
    
    loadStationDetailsAndOpenModal();
  }, [autoOpenStartCharging, pendingChargingData]);

  const upcomingBookings = bookings.filter((booking) => {
    const bookingDate = new Date(booking.date);
    return bookingDate >= new Date() && booking.status === "confirmed";
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {userName}!</h1>
        <p className="text-gray-600">
          Manage your charging sessions and account settings.
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sessions</p>
                <p className="text-2xl font-bold">{bookings.length}</p>
              </div>
              <Zap className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold">
                  {
                    bookings.filter((b) => {
                      const bookingDate = new Date(b.date);
                      const now = new Date();
                      return (
                        bookingDate.getMonth() === now.getMonth() &&
                        bookingDate.getFullYear() === now.getFullYear()
                      );
                    }).length
                  }
                </p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold">
                  $
                  {bookings
                    .reduce((sum, b) => sum + parseFloat(b.price), 0)
                    .toFixed(2)}
                </p>
              </div>
              <CreditCard className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Rating</p>
                <p className="text-2xl font-bold">4.8</p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="current" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="current">Current</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="current">
          <div className="space-y-6">
            <ActiveChargingSession />
          </div>
        </TabsContent>

        <TabsContent value="upcoming">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Upcoming Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingBookings.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No upcoming bookings</p>
                  <p className="text-sm text-gray-400">
                    Book a charging session to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">
                          {booking.station.name}
                        </h3>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          {booking.date.toDateString()}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          {booking.time}
                        </div>
                        <div className="flex items-center">
                          <Zap className="w-4 h-4 mr-2" />
                          {booking.duration} hours
                        </div>
                        <div className="flex items-center">
                          <CreditCard className="w-4 h-4 mr-2" />
                          ${booking.price}
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mt-2">
                        <MapPin className="w-4 h-4 mr-2" />
                        {booking.station.address}
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm">
                          Modify
                        </Button>
                        <Button variant="outline" size="sm">
                          Cancel
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-green-600 text-green-600 hover:bg-green-50"
                          onClick={() => {
                            // For demo purposes, using mock data
                            // In real app, get from booking object
                            setStartChargingModal({
                              isOpen: true,
                              pointId: 1, // Mock point ID
                              pointName: "Point #1",
                              stationName: booking.station.name,
                              powerKw: booking.station.powerKw || 150,
                              pricePerKwh: booking.station.pricePerKwh || 5000,
                              bookingId: parseInt(booking.id),
                            });
                          }}
                        >
                          <Battery className="w-4 h-4 mr-2" />
                          Start Charging
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <ChargingHistory limit={20} />
        </TabsContent>

        <TabsContent value="settings">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Account Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Full Name</label>
                  <p className="text-gray-600">{userName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-gray-600">user@example.com</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <p className="text-gray-600">+1 (555) 123-4567</p>
                </div>
                <Button variant="outline">Edit Profile</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Methods
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Visa ending in 1234</p>
                      <p className="text-sm text-gray-600">Expires 12/25</p>
                    </div>
                    <Badge variant="outline">Primary</Badge>
                  </div>
                </div>
                <Button variant="outline">Add Payment Method</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Start Charging Modal */}
      {startChargingModal.isOpen && (
        <StartChargingModal
          isOpen={startChargingModal.isOpen}
          onClose={() => setStartChargingModal(prev => ({ ...prev, isOpen: false }))}
          pointId={startChargingModal.pointId!}
          pointName={startChargingModal.pointName!}
          stationName={startChargingModal.stationName!}
          powerKw={startChargingModal.powerKw!}
          pricePerKwh={startChargingModal.pricePerKwh!}
          bookingId={startChargingModal.bookingId}
          onSuccess={() => {
            // Clear pending session data
            localStorage.removeItem('pending-charging-session');
            // Close modal and let the dashboard refresh naturally
            setStartChargingModal(prev => ({ ...prev, isOpen: false }));
            // Show success message
            toast.success('Charging session started successfully! 🔋⚡');
          }}
        />
      )}
    </div>
  );
}