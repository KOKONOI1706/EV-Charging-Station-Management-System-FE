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
  Activity
} from "lucide-react";
import { Station, Booking, User, MockDatabaseService } from "../data/mockDatabase";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../hooks/useLanguage";
import { LanguageSelector } from "./LanguageSelector";
import { toast } from "sonner";
import { ChargingSessionsManagement } from "./ChargingSessionsManagement";

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
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<SystemSettings>({
    maintenanceMode: false,
    autoBackup: true,
    emailNotifications: true,
    smsNotifications: false,
    debugMode: false
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [stationsData, bookingsData] = await Promise.all([
        MockDatabaseService.getStations(),
        MockDatabaseService.getUserBookings("user_001") // In real app, get all bookings
      ]);
      setStations(stationsData);
      setBookings(bookingsData);
      // Mock users data
      setUsers([
        {
          id: "user_001",
          name: "Alex Johnson",
          email: "alex.johnson@email.com",
          phone: "+1 (555) 123-4567",
          memberSince: "2023-01-15",
          totalSessions: 45,
          totalSpent: 1250.75,
          favoriteStations: ["1", "2"],
          role: "customer",
          vehicleInfo: {
            make: "Tesla",
            model: "Model 3",
            year: 2022,
            batteryCapacity: 75
          }
        }
      ]);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingChange = (key: keyof SystemSettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    toast.success(`${key} ${value ? 'enabled' : 'disabled'}`);
  };

  const totalRevenue = bookings.reduce((sum, booking) => sum + parseFloat(booking.price), 0);
  const activeUsers = users.length; // In real app, filter active users
  const totalSessions = bookings.length;

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
                <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
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
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">{t.overview}</TabsTrigger>
          <TabsTrigger value="chargingSessions">{t.chargingSessions}</TabsTrigger>
          <TabsTrigger value="users">{t.userManagement}</TabsTrigger>
          <TabsTrigger value="stations">{t.stationManagement}</TabsTrigger>
          <TabsTrigger value="reports">{t.reports}</TabsTrigger>
          <TabsTrigger value="settings">{t.systemSettings}</TabsTrigger>
        </TabsList>

        {/* Charging Sessions Management */}
        <TabsContent value="chargingSessions">
          <ChargingSessionsManagement userRole="admin" />
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
                    <span className="font-bold">$1,245.50</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>{t.thisWeek}</span>
                    <span className="font-bold">$8,734.20</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>{t.thisMonth}</span>
                    <span className="font-bold">$34,567.80</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>{t.yearToDate}</span>
                    <span className="font-bold">$412,345.60</span>
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
                  {stations.slice(0, 4).map((station, index) => (
                    <div key={station.id} className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-sm font-bold text-green-700">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{station.name}</p>
                          <p className="text-sm text-gray-600">{station.city}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">$2,456</p>
                        <p className="text-sm text-gray-600">{t.thisMonth}</p>
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
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    <div>
                      <p className="font-medium text-yellow-800">{t.station2MaintenanceDue}</p>
                      <p className="text-sm text-yellow-600">{t.scheduledMaintenance2Days}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-800">{t.highUsageAlert}</p>
                      <p className="text-sm text-blue-600">{t.downtownHub95Capacity}</p>
                    </div>
                  </div>
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
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-green-700">AJ</span>
                    </div>
                    <div>
                      <p className="font-medium">Alex Johnson</p>
                      <p className="text-sm text-gray-600">{t.completedChargingSession}</p>
                    </div>
                    <div className="ml-auto text-sm text-gray-500">2m {t.ago}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-700">MS</span>
                    </div>
                    <div>
                      <p className="font-medium">Maria Silva</p>
                      <p className="text-sm text-gray-600">{t.newUserRegistration}</p>
                    </div>
                    <div className="ml-auto text-sm text-gray-500">15m {t.ago}</div>
                  </div>
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
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-600">{user.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{new Date(user.memberSince).toLocaleDateString()}</TableCell>
                      <TableCell>{user.totalSessions}</TableCell>
                      <TableCell>${user.totalSpent.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Station Management */}
        <TabsContent value="stations">
          <Card>
            <CardHeader>
              <CardTitle>{t.stationManagement}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stations.map((station) => (
                  <Card key={station.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">{station.name}</h3>
                        <Badge className="bg-green-100 text-green-800">
                          {t.operational}
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
                        <Button variant="outline" size="sm" className="flex-1">
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
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
    </div>
  );
}