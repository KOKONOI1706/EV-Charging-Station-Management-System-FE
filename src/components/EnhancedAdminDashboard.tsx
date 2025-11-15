import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import {
  Users,
  Calendar,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  MapPin,
  Settings,
  BarChart,
  DollarSign,
  TrendingUp,
  UserCheck,
  Shield,
  Activity,
  Plus,
  Trash2
} from "lucide-react";
import { Station, Booking, MockDatabaseService } from "../data/mockDatabase";
import { usersApi, type User } from "../api/usersApi";
import { adminStatsApi, type RevenueStats, type TopStation, type SystemAlert, type RecentActivity } from "../api/adminStatsApi";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../hooks/useLanguage";
import { LanguageSelector } from "./LanguageSelector";
import { toast } from "sonner";
import { ChargingSessionsManagement } from "./ChargingSessionsManagement";
import { ChargingPointsManagement } from "./ChargingPointsManagement";
import { StationCRUDModal } from "./StationCRUDModal";
import { fetchStations, deleteStation } from "../api/stationApi";

interface SystemSettings {
  maintenanceMode: boolean;
  autoBackup: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  debugMode: boolean;
}

export function EnhancedAdminDashboard() {
  const { t } = useLanguage();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [stations, setStations] = useState<Station[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // Real data states
  const [revenueStats, setRevenueStats] = useState<RevenueStats>({ today: 0, thisWeek: 0, thisMonth: 0, yearToDate: 0 });
  const [topStations, setTopStations] = useState<TopStation[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [stationsPerPage] = useState(6);
  const [stationCurrentPage, setStationCurrentPage] = useState(1);
  
  const [settings, setSettings] = useState<SystemSettings>({
    maintenanceMode: false,
    autoBackup: true,
    emailNotifications: true,
    smsNotifications: false,
    debugMode: false
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('view');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log('🔄 loadData() called - fetching fresh data from API...');
      setIsLoading(true);
      const [stationsData, bookingsData] = await Promise.all([
        fetchStations(), // Use API instead of mock data
        MockDatabaseService.getUserBookings("user_001") // In real app, get all bookings
      ]);
      console.log('✅ Fetched stations:', stationsData.length);
      setStations(stationsData);
      setBookings(bookingsData);
      setUsers(usersData.users);
      setTotalUsers(usersData.total);
      
      // Set real dashboard stats
      console.log('📊 Dashboard Stats:', dashboardStats);
      console.log('🏢 Top Stations:', dashboardStats.topStations);
      setRevenueStats(dashboardStats.revenue);
      setTopStations(dashboardStats.topStations);
      setSystemAlerts(dashboardStats.systemAlerts);
      setRecentActivities(dashboardStats.recentActivities);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Không thể tải dữ liệu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateStation = () => {
    setSelectedStation(null);
    setModalMode('create');
    setModalOpen(true);
  };

  const handleEditStation = (station: Station) => {
    setSelectedStation(station);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleViewStation = (station: Station) => {
    setSelectedStation(station);
    setModalMode('view');
    setModalOpen(true);
  };

  const handleDeleteStation = async (stationId: string) => {
    if (!confirm('Are you sure you want to delete this station?')) {
      return;
    }

    try {
      await deleteStation(stationId);
      toast.success('Station deleted successfully');
      loadData(); // Reload data
    } catch (error) {
      console.error('Error deleting station:', error);
      toast.error('Failed to delete station');
    }
  };

  const handleSaveStation = () => {
    // Reload data to get fresh station list from backend
    loadData();
  };

  const handleSettingChange = (key: keyof SystemSettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    toast.success(`${key} ${value ? 'enabled' : 'disabled'}`);
  };

  const totalRevenue = bookings.reduce((sum, booking) => sum + parseFloat(booking.price), 0);
  const activeUsers = users.length; // In real app, filter active users
  const totalSessions = bookings.length;

  // Pagination calculations for Users
  // Users are already paginated from API, so we don't slice them
  const currentUsers = users;
  const totalUserPages = Math.ceil(totalUsers / usersPerPage);

  // Pagination calculations for Stations
  const indexOfLastStation = stationCurrentPage * stationsPerPage;
  const indexOfFirstStation = indexOfLastStation - stationsPerPage;
  const currentStations = stations.slice(indexOfFirstStation, indexOfLastStation);
  const totalStationPages = Math.ceil(stations.length / stationsPerPage);

  const handleUserPageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleStationPageChange = (pageNumber: number) => {
    setStationCurrentPage(pageNumber);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t.adminDashboard}</h1>
          <p className="text-gray-600">{t.completeSystemOverview}</p>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSelector />
          <Button
            variant="outline"
            onClick={async () => {
              try {
                await logout();
                toast.success(t.signOut || "Logged out");
                navigate('/');
              } catch (err) {
                console.error('Logout failed:', err);
                toast.error('Logout failed');
              }
            }}
          >
            {t.signOut}
          </Button>
        </div>
      </div>

      {/* Enhanced Executive Summary */}
      <div className="grid md:grid-cols-6 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.totalUsers}</p>
                <p className="text-2xl font-bold">{activeUsers}</p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +12% this month
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.revenue}</p>
                <p className="text-2xl font-bold">{new Intl.NumberFormat('vi-VN').format(totalRevenue)}₫</p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +8% this month
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.totalStations}</p>
                <p className="text-2xl font-bold">{stations.length}</p>
                <p className="text-xs text-green-600">+2 {t.new}</p>
              </div>
              <Zap className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.activeBookings}</p>
                <p className="text-2xl font-bold">{totalSessions}</p>
                <p className="text-xs text-green-600">98% {t.uptime}</p>
              </div>
              <Calendar className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.currentLoad}</p>
                <p className="text-2xl font-bold">67.5%</p>
                <p className="text-xs text-green-600">{t.normalLevels}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.systemHealth}</p>
                <p className="text-2xl font-bold">99.5%</p>
                <p className="text-xs text-green-600">{t.allSystemsOperational}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="inline-flex w-full justify-start overflow-x-auto flex-wrap gap-1">
          <TabsTrigger value="overview">{t.overview}</TabsTrigger>
          <TabsTrigger value="chargingSessions">{t.chargingSessions}</TabsTrigger>
          <TabsTrigger value="chargingPoints">{t.chargingPointsTab}</TabsTrigger>
          <TabsTrigger value="users">{t.userManagement}</TabsTrigger>
          <TabsTrigger value="stations">{t.stationManagement}</TabsTrigger>
          <TabsTrigger value="reports">{t.reports}</TabsTrigger>
          <TabsTrigger value="settings">{t.systemSettings}</TabsTrigger>
        </TabsList>

        {/* Charging Sessions Management */}
        <TabsContent value="chargingSessions">
          <ChargingSessionsManagement userRole="admin" />
        </TabsContent>

        {/* Charging Points Management */}
        <TabsContent value="chargingPoints">
          <ChargingPointsManagement userRole="admin" />
        </TabsContent>

        {/* Overview */}
        <TabsContent value="overview">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  {t.revenueTrends}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>{t.today}</span>
                    <span className="font-bold">{new Intl.NumberFormat('vi-VN').format(revenueStats.today)}₫</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>{t.thisWeek}</span>
                    <span className="font-bold">{new Intl.NumberFormat('vi-VN').format(revenueStats.thisWeek)}₫</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>{t.thisMonth}</span>
                    <span className="font-bold">{new Intl.NumberFormat('vi-VN').format(revenueStats.thisMonth)}₫</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>{t.yearToDate}</span>
                    <span className="font-bold">{new Intl.NumberFormat('vi-VN').format(revenueStats.yearToDate)}₫</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="w-5 h-5" />
                  {t.topPerformingStations}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(topStations.length > 0 ? topStations : stations.slice(0, 4).map((s) => ({
                    id: s.id,
                    name: s.name,
                    location: s.city,
                    revenue: 1189271 / 2, // Mock revenue based on actual total
                    period: '30 ngày qua'
                  }))).map((station, index) => (
                    <div key={station.id} className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-sm font-bold text-green-700">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{station.name}</p>
                          <p className="text-sm text-gray-600">{station.location}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{new Intl.NumberFormat('vi-VN').format(station.revenue)}₫</p>
                        <p className="text-sm text-gray-600">{station.period}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  {t.systemAlerts}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {systemAlerts.length > 0 ? systemAlerts.map((alert) => (
                    <div key={alert.id} className={`flex items-center gap-3 p-3 rounded-lg ${
                      alert.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                      alert.type === 'error' ? 'bg-red-50 border border-red-200' :
                      'bg-blue-50 border border-blue-200'
                    }`}>
                      {alert.type === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-600" />}
                      {alert.type === 'error' && <AlertTriangle className="w-4 h-4 text-red-600" />}
                      {alert.type === 'info' && <Clock className="w-4 h-4 text-blue-600" />}
                      <div>
                        <p className={`font-medium ${
                          alert.type === 'warning' ? 'text-yellow-800' :
                          alert.type === 'error' ? 'text-red-800' :
                          'text-blue-800'
                        }`}>{alert.title}</p>
                        <p className={`text-sm ${
                          alert.type === 'warning' ? 'text-yellow-600' :
                          alert.type === 'error' ? 'text-red-600' :
                          'text-blue-600'
                        }`}>{alert.message}</p>
                      </div>
                    </div>
                  )) : (
                    <p className="text-gray-500 text-center py-4">Không có cảnh báo</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5" />
                  {t.recentUserActivity}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivities.length > 0 ? recentActivities.slice(0, 5).map((activity) => {
                    const userName = activity.user || activity.userName || 'Unknown';
                    const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase();
                    const timeDiff = Math.floor((new Date().getTime() - new Date(activity.timestamp).getTime()) / 1000 / 60);
                    const timeAgo = timeDiff < 60 ? `${timeDiff}m` : timeDiff < 1440 ? `${Math.floor(timeDiff / 60)}h` : `${Math.floor(timeDiff / 1440)}d`;
                    
                    return (
                      <div key={activity.id} className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-green-700">{initials.substring(0, 2)}</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{activity.userName}</p>
                          <p className="text-sm text-gray-600">{activity.action}</p>
                        </div>
                        <div className="text-sm text-gray-500">{timeAgo} {t.ago}</div>
                      </div>
                    );
                  }) : (
                    <p className="text-gray-500 text-center py-4">Chưa có hoạt động</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* User Management */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{t.userManagement}</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export Users
                  </Button>
                  <Button className="bg-green-600 hover:bg-green-700">
                    Add User
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Member Since</TableHead>
                    <TableHead>Total Sessions</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-600">{user.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{new Date(user.memberSince).toLocaleDateString()}</TableCell>
                      <TableCell>{user.totalSessions || 0}</TableCell>
                      <TableCell>{new Intl.NumberFormat('vi-VN').format(user.totalSpent || 0)}₫</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">{user.status || 'Active'}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {/* Pagination for Users */}
              {totalUserPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-600">
                    Showing {(currentPage - 1) * usersPerPage + 1} to {Math.min(currentPage * usersPerPage, totalUsers)} of {totalUsers} users
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUserPageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    {Array.from({ length: totalUserPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleUserPageChange(page)}
                        className={currentPage === page ? "bg-green-600 hover:bg-green-700" : ""}
                      >
                        {page}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUserPageChange(currentPage + 1)}
                      disabled={currentPage === totalUserPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Station Management */}
        <TabsContent value="stations">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{t.stationManagement}</CardTitle>
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={handleCreateStation}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Station
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentStations.map((station) => (
                  <Card key={station.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">{station.name}</h3>
                        <Badge className="bg-green-100 text-green-800">
                          {station.status === 'active' ? t.operational : station.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{station.address}</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Available:</span>
                          <span className="font-medium ml-1">{station.available}/{station.total}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Power:</span>
                          <span className="font-medium ml-1">{station.power}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Rating:</span>
                          <span className="font-medium ml-1">{station.rating}/5</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Network:</span>
                          <span className="font-medium ml-1">{station.network}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleEditStation(station)}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleViewStation(station)}
                        >
                          View Details
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeleteStation(station.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* Pagination for Stations */}
              {totalStationPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-600">
                    Showing {indexOfFirstStation + 1} to {Math.min(indexOfLastStation, stations.length)} of {stations.length} stations
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStationPageChange(stationCurrentPage - 1)}
                      disabled={stationCurrentPage === 1}
                    >
                      Previous
                    </Button>
                    {Array.from({ length: totalStationPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={stationCurrentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleStationPageChange(page)}
                        className={stationCurrentPage === page ? "bg-green-600 hover:bg-green-700" : ""}
                      >
                        {page}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStationPageChange(stationCurrentPage + 1)}
                      disabled={stationCurrentPage === totalStationPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports */}
        <TabsContent value="reports">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Generate Reports</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="h-20 flex-col">
                    <BarChart className="w-6 h-6 mb-2" />
                    <span>Revenue Report</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Users className="w-6 h-6 mb-2" />
                    <span>User Report</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Zap className="w-6 h-6 mb-2" />
                    <span>Usage Report</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <MapPin className="w-6 h-6 mb-2" />
                    <span>Station Report</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Scheduled Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Weekly Revenue Summary</p>
                      <p className="text-sm text-gray-600">Every Monday 9:00 AM</p>
                    </div>
                    <Badge>Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Monthly Usage Analytics</p>
                      <p className="text-sm text-gray-600">1st of every month</p>
                    </div>
                    <Badge>Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Station Health Check</p>
                      <p className="text-sm text-gray-600">Daily 6:00 AM</p>
                    </div>
                    <Badge>Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="settings">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  {t.systemSettings}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="maintenance">Maintenance Mode</Label>
                      <p className="text-sm text-gray-600">Temporarily disable system access</p>
                    </div>
                    <Switch
                      id="maintenance"
                      checked={settings.maintenanceMode}
                      onCheckedChange={(checked: boolean) => handleSettingChange('maintenanceMode', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="backup">Auto Backup</Label>
                      <p className="text-sm text-gray-600">Automatically backup data daily</p>
                    </div>
                    <Switch
                      id="backup"
                      checked={settings.autoBackup}
                      onCheckedChange={(checked: boolean) => handleSettingChange('autoBackup', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email">Email Notifications</Label>
                      <p className="text-sm text-gray-600">Send system alerts via email</p>
                    </div>
                    <Switch
                      id="email"
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked: boolean) => handleSettingChange('emailNotifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="sms">SMS Notifications</Label>
                      <p className="text-sm text-gray-600">Send critical alerts via SMS</p>
                    </div>
                    <Switch
                      id="sms"
                      checked={settings.smsNotifications}
                      onCheckedChange={(checked: boolean) => handleSettingChange('smsNotifications', checked)}
                    />
                  </div>

                    <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="debug">Debug Mode</Label>
                      <p className="text-sm text-gray-600">Enable detailed logging</p>
                    </div>
                    <Switch
                      id="debug"
                      checked={settings.debugMode}
                      onCheckedChange={(checked: boolean) => handleSettingChange('debugMode', checked)}
                    />
                    </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security & Backup
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Last Backup</Label>
                    <p className="text-sm text-gray-600">Today, 3:00 AM</p>
                  </div>
                  <div>
                    <Label>Database Size</Label>
                    <p className="text-sm text-gray-600">2.4 GB</p>
                  </div>
                  <div>
                    <Label>System Uptime</Label>
                    <p className="text-sm text-gray-600">99.8% (30 days)</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Force Backup
                    </Button>
                    <Button variant="outline" size="sm">
                      View Logs
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Station CRUD Modal */}
      <StationCRUDModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        station={selectedStation}
        mode={modalMode}
        onSave={handleSaveStation}
      />
    </div>
  );
}