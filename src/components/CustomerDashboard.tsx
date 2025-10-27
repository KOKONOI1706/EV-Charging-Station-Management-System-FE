import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Battery, 
  MapPin, 
  DollarSign, 
  Car,
  Zap,
  CreditCard,
  History,
  User,
  Settings,
  Bell,
  TrendingUp,
  Navigation
} from 'lucide-react';
import { StationMap } from './StationMap';
import { EnhancedBookingModal } from './EnhancedBookingModal';
import { ChargingSessionManager } from './ChargingSessionManager';
import { OnlinePaymentModal } from './OnlinePaymentModal';
import apiService, { Station, ChargingSession as APIChargingSession } from '@/services/api';

interface CustomerStats {
  totalSessions: number;
  totalEnergyConsumed: number;
  totalAmountSpent: number;
  currentMonthSessions: number;
  averageSessionDuration: string;
  carbonSaved: number;
}

interface ActiveSession {
  id: string;
  stationId: string;
  stationName: string;
  startTime: string;
  currentCharge: number;
  targetCharge: number;
  estimatedCompletion: string;
  currentCost: number;
  powerLevel: number;
}

export const CustomerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [customerStats, setCustomerStats] = useState<CustomerStats>({
    totalSessions: 0,
    totalEnergyConsumed: 0,
    totalAmountSpent: 0,
    currentMonthSessions: 0,
    averageSessionDuration: '0h 0m',
    carbonSaved: 0
  });
  const [recentSessions, setRecentSessions] = useState<APIChargingSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load user data on component mount
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      
      // Load user stats
      const stats = await apiService.getUserStats();
      setCustomerStats(stats);

      // Load recent sessions
      const sessions = await apiService.getUserSessions();
      setRecentSessions(sessions.slice(0, 5)); // Show last 5 sessions

      // Check for active session
      const activeSessionData = await apiService.getActiveSession();
      if (activeSessionData) {
        const mappedSession: ActiveSession = {
          id: activeSessionData.id,
          stationId: activeSessionData.station_id,
          stationName: activeSessionData.station?.name || 'Unknown Station',
          startTime: activeSessionData.start_time,
          currentCharge: Math.round(activeSessionData.energy_consumed || 0),
          targetCharge: 80, // Default target
          estimatedCompletion: new Date(Date.now() + 30 * 60000).toISOString(),
          currentCost: activeSessionData.cost,
          powerLevel: 50 // Default power level
        };
        setActiveSession(mappedSession);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      // Fallback to mock data if API fails
      loadMockData();
    } finally {
      setIsLoading(false);
    }
  };

  const loadMockData = () => {
    setCustomerStats({
      totalSessions: 47,
      totalEnergyConsumed: 1250.5,
      totalAmountSpent: 387.50,
      currentMonthSessions: 8,
      averageSessionDuration: '1h 23m',
      carbonSaved: 45.2
    });

    // Mock recent sessions
    const mockSessions: APIChargingSession[] = [
      {
        id: 'CS001',
        user_id: 'user1',
        station_id: 'station1',
        start_time: '2024-01-15T09:30:00Z',
        end_time: '2024-01-15T11:15:00Z',
        status: 'completed',
        energy_consumed: 45.2,
        cost: 18.50,
        payment_status: 'paid',
        created_at: '2024-01-15T09:30:00Z',
        updated_at: '2024-01-15T11:15:00Z',
        station: {
          id: 'station1',
          name: 'Downtown Plaza Station',
          address: '123 Main St',
          latitude: 40.7128,
          longitude: -74.0060,
          status: 'available',
          chargerType: 'fast',
          price: 0.35,
          amenities: [],
          totalSpots: 8,
          availableSpots: 5,
          rating: 4.5,
          reviews: 324
        }
      }
    ];
    setRecentSessions(mockSessions);
  };

  const handleStationBook = (station: Station) => {
    setSelectedStation(station);
    setIsBookingModalOpen(true);
  };

  const handleBookingSuccess = async (bookingDetails: any) => {
    try {
      console.log('Booking successful:', bookingDetails);
      setIsBookingModalOpen(false);
      
      // Create booking via API
      const booking = await apiService.createBooking({
        station_id: bookingDetails.stationId,
        start_time: bookingDetails.startTime,
        duration: bookingDetails.duration,
        charging_amount: bookingDetails.chargingAmount,
        payment_method: bookingDetails.paymentMethod
      });

      // Start charging session
      const session = await apiService.startSession(booking.id);
      
      // Convert to ActiveSession format
      const newActiveSession: ActiveSession = {
        id: session.id,
        stationId: session.station_id,
        stationName: session.station?.name || selectedStation?.name || 'Unknown Station',
        startTime: session.start_time,
        currentCharge: 20,
        targetCharge: bookingDetails.targetCharge || 80,
        estimatedCompletion: new Date(Date.now() + 60 * 60000).toISOString(),
        currentCost: 0,
        powerLevel: bookingDetails.chargingType === 'fast' ? 50 : 22
      };
      
      setActiveSession(newActiveSession);
      setActiveTab('charging');
    } catch (error) {
      console.error('Error creating booking:', error);
      // Fallback to mock behavior
      const newSession: ActiveSession = {
        id: `AS${Date.now()}`,
        stationId: bookingDetails.stationId,
        stationName: bookingDetails.stationName,
        startTime: new Date().toISOString(),
        currentCharge: 20,
        targetCharge: bookingDetails.targetCharge || 80,
        estimatedCompletion: new Date(Date.now() + 60 * 60000).toISOString(),
        currentCost: 0,
        powerLevel: bookingDetails.chargingType === 'fast' ? 50 : 22
      };
      
      setActiveSession(newSession);
      setActiveTab('charging');
    }
  };

  const handleSessionComplete = async (sessionData: any) => {
    try {
      if (activeSession) {
        // Update session status via API
        await apiService.updateSession(activeSession.id, {
          status: 'completed',
          energy_consumed: sessionData.energyConsumed || 45.2
        });

        const paymentData = {
          sessionId: activeSession.id,
          stationName: activeSession.stationName,
          chargingAmount: sessionData.energyConsumed || 45.2,
          pricePerKwh: 0.35,
          serviceFee: 2.50,
          tax: 1.85,
          totalAmount: sessionData.totalCost || 18.50,
          chargingDuration: sessionData.duration || '1h 23m',
          startTime: activeSession.startTime,
          endTime: new Date().toISOString()
        };
        
        setPaymentData(paymentData);
        setIsPaymentModalOpen(true);
      }
    } catch (error) {
      console.error('Error completing session:', error);
      // Fallback to mock behavior
      if (activeSession) {
        const paymentData = {
          sessionId: activeSession.id,
          stationName: activeSession.stationName,
          chargingAmount: sessionData.energyConsumed || 45.2,
          pricePerKwh: 0.35,
          serviceFee: 2.50,
          tax: 1.85,
          totalAmount: sessionData.totalCost || 18.50,
          chargingDuration: sessionData.duration || '1h 23m',
          startTime: activeSession.startTime,
          endTime: new Date().toISOString()
        };
        
        setPaymentData(paymentData);
        setIsPaymentModalOpen(true);
      }
    }
  };

  const handlePaymentSuccess = async (transactionId: string) => {
    try {
      console.log('Payment successful:', transactionId);
      
      // Process payment via API
      if (paymentData) {
        await apiService.processPayment({
          session_id: paymentData.sessionId,
          amount: paymentData.totalAmount,
          payment_method: 'credit_card'
        });
      }

      setActiveSession(null);
      setIsPaymentModalOpen(false);
      setActiveTab('overview');
      
      // Reload user data
      loadUserData();
    } catch (error) {
      console.error('Error processing payment:', error);
      // Still complete the flow even if API fails
      setActiveSession(null);
      setIsPaymentModalOpen(false);
      setActiveTab('overview');
    }
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment failed:', error);
  };

  const getStatusBadge = (status: string, paymentStatus?: string) => {
    if (status === 'active') {
      return <Badge className="bg-green-100 text-green-800">Active</Badge>;
    } else if (status === 'completed') {
      if (paymentStatus === 'paid') {
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      } else if (paymentStatus === 'pending') {
        return <Badge className="bg-yellow-100 text-yellow-800">Payment Pending</Badge>;
      }
    } else if (status === 'cancelled') {
      return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Customer Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome back, John Doe</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="find-stations">Find Stations</TabsTrigger>
            <TabsTrigger value="charging">
              {activeSession ? 'Active Session' : 'Charging'}
            </TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                      <p className="text-2xl font-bold text-gray-900">{customerStats.totalSessions}</p>
                    </div>
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Zap className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Energy Consumed</p>
                      <p className="text-2xl font-bold text-gray-900">{customerStats.totalEnergyConsumed} kWh</p>
                    </div>
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Battery className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Spent</p>
                      <p className="text-2xl font-bold text-gray-900">${customerStats.totalAmountSpent}</p>
                    </div>
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <DollarSign className="h-4 w-4 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Carbon Saved</p>
                      <p className="text-2xl font-bold text-gray-900">{customerStats.carbonSaved} kg</p>
                    </div>
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Active Session Alert */}
            {activeSession && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <Battery className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-green-900">Active Charging Session</h3>
                        <p className="text-green-700">{activeSession.stationName}</p>
                        <p className="text-sm text-green-600">
                          {activeSession.currentCharge}% → {activeSession.targetCharge}%
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-green-900">${activeSession.currentCost.toFixed(2)}</p>
                      <Button 
                        onClick={() => setActiveTab('charging')}
                        className="mt-2 bg-green-600 hover:bg-green-700"
                        size="sm"
                      >
                        View Session
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Charging Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentSessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Zap className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{session.station?.name || 'Unknown Station'}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(session.start_time).toLocaleDateString()} • {session.energy_consumed} kWh
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-medium">${session.cost.toFixed(2)}</p>
                          {getStatusBadge(session.status, session.payment_status)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Find Stations Tab */}
          <TabsContent value="find-stations">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Navigation className="h-5 w-5" />
                  <span>Find Charging Stations</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StationMap onStationBook={handleStationBook} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Charging Tab */}
          <TabsContent value="charging">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Battery className="h-5 w-5" />
                  <span>{activeSession ? 'Active Charging Session' : 'Charging Sessions'}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeSession ? (
                  <ChargingSessionManager
                    session={activeSession}
                    onSessionComplete={handleSessionComplete}
                    onSessionStop={() => handleSessionComplete({})}
                  />
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Battery className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Sessions</h3>
                    <p className="text-gray-600 mb-4">Start a new charging session by finding a station</p>
                    <Button onClick={() => setActiveTab('find-stations')}>
                      <MapPin className="h-4 w-4 mr-2" />
                      Find Stations
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <History className="h-5 w-5" />
                  <span>Charging History</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentSessions.map((session) => (
                    <div key={session.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold">{session.station?.name || 'Unknown Station'}</h4>
                          <p className="text-sm text-gray-600">Session ID: {session.id}</p>
                        </div>
                        {getStatusBadge(session.status, session.payment_status)}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Start Time</p>
                          <p className="font-medium">
                            {new Date(session.start_time).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">End Time</p>
                          <p className="font-medium">
                            {session.end_time ? new Date(session.end_time).toLocaleString() : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Energy</p>
                          <p className="font-medium">{session.energy_consumed} kWh</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Cost</p>
                          <p className="font-medium">${session.cost.toFixed(2)}</p>
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t flex justify-end space-x-2">
                        <Button variant="outline" size="sm">
                          <CreditCard className="h-4 w-4 mr-2" />
                          View Receipt
                        </Button>
                        <Button variant="outline" size="sm">
                          Report Issue
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Full Name</p>
                      <p className="font-medium">John Doe</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">john.doe@example.com</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium">+1 (555) 123-4567</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Member Since</p>
                      <p className="font-medium">January 2024</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Vehicle Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Car className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Tesla Model 3</p>
                      <p className="text-sm text-gray-600">License Plate: ABC-123</p>
                      <p className="text-sm text-gray-600">Battery Capacity: 75 kWh</p>
                    </div>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <EnhancedBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        station={selectedStation}
        onBookingSuccess={handleBookingSuccess}
      />

      <OnlinePaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        paymentData={paymentData}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentError={handlePaymentError}
      />
    </div>
  );
};