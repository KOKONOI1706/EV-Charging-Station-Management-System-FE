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
  Battery
} from "lucide-react";
import { Booking } from "../data/mockDatabase";
import { toast } from "sonner";
import { ActiveChargingSession } from "./ActiveChargingSession";
import { ChargingHistory } from "./ChargingHistory";
import { StartChargingModal } from "./StartChargingModal";
import { useLanguage } from "../hooks/useLanguage";
import { ProfileModal } from "./ProfileModal";
import { ChangePasswordModal } from "./ChangePasswordModal";
import { AuthService } from "../services/authService";
import { VehicleManagement } from "./VehicleManagement";
import { userStatsApi, UserStats } from "../api/userStatsApi";
import * as chargingPointsApi from "../api/chargingPointsApi";

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
  const { t } = useLanguage();
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  
  console.log('🔄 UserDashboard render:', { loadingStats, hasStats: !!userStats, stats: userStats });
  
  // Get current user info
  const currentUser = AuthService.getCurrentUser();
  
  const [userProfile, setUserProfile] = useState({
    name: userName,
    email: currentUser?.email || "user@example.com",
    phone: currentUser?.phone || "+1 (555) 123-4567"
  });
  
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

  // Load user statistics from API
  useEffect(() => {
    const loadUserStats = async () => {
      if (!currentUser?.id) {
        console.log('❌ No current user');
        setLoadingStats(false);
        return;
      }
      
      try {
        console.log('🔄 Loading user stats for user:', currentUser.id);
        setLoadingStats(true);
        
        const stats = await userStatsApi.getUserStats(parseInt(currentUser.id));
        console.log('✅ Stats fetched:', stats);
        
        setUserStats(stats);
      } catch (error) {
        console.error('❌ Error loading user stats:', error);
        // Set default stats on error to avoid showing loading forever
        setUserStats({
          totalSessions: 0,
          sessionsThisMonth: 0,
          totalSpent: 0,
          averageRating: 4.8,
          totalEnergyConsumed: 0,
          activeSessions: 0
        });
        toast.error('Không thể tải thống kê. Hiển thị dữ liệu mặc định.');
      } finally {
        setLoadingStats(false);
      }
    };

    loadUserStats();
  }, [currentUser?.id]); // Only depend on user ID, not entire user object

  // Auto-open start charging modal if coming from check-in
  useEffect(() => {
    const loadStationDetailsAndOpenModal = async () => {
      if (!autoOpenStartCharging || !pendingChargingData) return;
      
      console.log('🚀 Auto-opening start charging modal from check-in:', pendingChargingData);
      
      try {
        // Fetch charging points immediately (parallel, don't wait)
        const chargingPointsPromise = chargingPointsApi.getStationChargingPoints(pendingChargingData.stationId);
        
        // Use default price if we have it in pendingChargingData, otherwise fetch
        const defaultPrice = 0.42; // Default VND per kWh
        
        const chargingPoints = await chargingPointsPromise;
        console.log('✅ Fetched charging points:', chargingPoints.length, 'points');
        
        if (!chargingPoints || chargingPoints.length === 0) {
          console.error('❌ No charging points found');
          toast.error('Không tìm thấy điểm sạc tại trạm này');
          return;
        }
        
        // Find the specific charging point if provided, otherwise get first available
        let targetPoint = chargingPoints[0]; // Default to first
        
        if (pendingChargingData.chargingPointId && pendingChargingData.chargingPointId !== 'any') {
          const requestedPointId = parseInt(pendingChargingData.chargingPointId);
          const foundPoint = chargingPoints.find(cp => cp.point_id === requestedPointId);
          if (foundPoint) {
            targetPoint = foundPoint;
          }
        } else {
          // Find first available
          const availablePoint = chargingPoints.find(cp => cp.status === 'Available');
          if (availablePoint) {
            targetPoint = availablePoint;
          }
        }
        
        console.log('✅ Selected charging point:', targetPoint.point_id, targetPoint.name);
        
        // Open modal immediately with available data
        setStartChargingModal({
          isOpen: true,
          stationName: pendingChargingData.stationName,
          pointName: targetPoint.name,
          pointId: targetPoint.point_id,
          powerKw: targetPoint.power_kw,
          pricePerKwh: defaultPrice, // Use default, can fetch later if needed
        });
        
        console.log('✅ Modal opened successfully');
      } catch (error) {
        console.error('❌ Error loading charging point details:', error);
        toast.error('Không thể tải thông tin điểm sạc');
      }
    };
    
    loadStationDetailsAndOpenModal();
  }, [autoOpenStartCharging, pendingChargingData]);

  const handleProfileUpdate = async (name: string, email: string, phone: string) => {
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser) {
      throw new Error("No user logged in");
    }
    
    // Call API to update profile
    await AuthService.updateProfile(currentUser.id, { name, email, phone });
    
    // Update local state
    setUserProfile({ name, email, phone });
  };

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
        <h1 className="text-3xl font-bold mb-2">{t.welcomeBack}, {userName}!</h1>
        <p className="text-gray-600">
          {t.manageYourCharging}
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="w-full">
                <p className="text-sm text-gray-600">{t.totalSessions}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {userStats ? userStats.totalSessions : (loadingStats ? "..." : "0")}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  +{userStats ? userStats.sessionsThisMonth : (loadingStats ? "..." : "0")} {t.thisMonth}
                </p>
              </div>
              <Zap className="w-8 h-8 text-green-600 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="w-full">
                <p className="text-sm text-gray-600">{t.thisMonth}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {userStats ? userStats.sessionsThisMonth : (loadingStats ? "..." : "0")}
                </p>
                <p className="text-xs text-gray-500 mt-1">Phiên sạc</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="w-full">
                <p className="text-sm text-gray-600">{t.totalSpent}</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${userStats ? userStats.totalSpent.toFixed(2) : (loadingStats ? "..." : "0.00")}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {userStats ? userStats.totalEnergyConsumed.toFixed(1) : (loadingStats ? "..." : "0.0")} kWh
                </p>
              </div>
              <CreditCard className="w-8 h-8 text-purple-600 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="w-full">
                <p className="text-sm text-gray-600">{t.avgRating}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {userStats ? userStats.averageRating.toFixed(1) : (loadingStats ? "..." : "4.8")}
                </p>
                <p className="text-xs text-gray-500 mt-1">Đánh giá TB</p>
              </div>
              <Star className="w-8 h-8 text-yellow-500 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="current" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="current">{t.current}</TabsTrigger>
          <TabsTrigger value="upcoming">{t.upcoming}</TabsTrigger>
          <TabsTrigger value="history">{t.history}</TabsTrigger>
          <TabsTrigger value="vehicles">{t.myVehicles}</TabsTrigger>
          <TabsTrigger value="settings">{t.settings}</TabsTrigger>
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
                {t.upcomingSessions}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingBookings.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">{t.noUpcomingBookings}</p>
                  <p className="text-sm text-gray-400">
                    {t.bookChargingToGetStarted}
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
                          {t.startCharging}
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

        <TabsContent value="vehicles">
          <VehicleManagement />
        </TabsContent>

        <TabsContent value="settings">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  {t.accountSettings}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">{t.fullName}</label>
                  <p className="text-gray-600">{userProfile.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">{t.email}</label>
                  <p className="text-gray-600">{userProfile.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">{t.phone}</label>
                  <p className="text-gray-600">{userProfile.phone}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setProfileModalOpen(true)}>{t.editProfile}</Button>
                  <Button variant="outline" onClick={() => setPasswordModalOpen(true)}>{t.changePassword}</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  {t.paymentMethods}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{t.visaEndingIn} 1234</p>
                      <p className="text-sm text-gray-600">{t.expires} 12/25</p>
                    </div>
                    <Badge variant="outline">{t.primary}</Badge>
                  </div>
                </div>
                <Button variant="outline">{t.addPaymentMethod}</Button>
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

      {/* Profile Edit Modal */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        userName={userProfile.name}
        userEmail={userProfile.email}
        userPhone={userProfile.phone}
        onUpdate={(name: string, email: string, phone: string) => {
          handleProfileUpdate(name, email, phone);
        }}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        userId={AuthService.getCurrentUser()?.id || ""}
      />
    </div>
  );
}