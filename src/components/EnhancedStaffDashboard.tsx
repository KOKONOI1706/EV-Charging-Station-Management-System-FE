import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import {
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  DollarSign,
  Activity,
  Settings,
  MapPin,
  Phone,
  Wrench,
  TrendingUp,
  BarChart3,
  Calendar
} from 'lucide-react';
import { Station, MockDatabaseService } from '../data/mockDatabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface StationMetrics {
  todaysSessions: number;
  todaysRevenue: number;
  currentUtilization: number;
  averageSessionDuration: number;
  customerSatisfaction: number;
  maintenanceAlerts: number;
}

interface StaffAnalytics {
  dailyUsage: { date: string; sessions: number; revenue: number }[];
  hourlyPattern: { hour: number; sessions: number; utilization: number }[];
  weeklyTrend: { day: string; sessions: number; revenue: number }[];
  recentSessions: { id: string; customer: string; duration: string; amount: number; status: string }[];
}

export function EnhancedStaffDashboard() {
  const { t } = useLanguage();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStation, setSelectedStation] = useState<string>('all');
  const [metrics, setMetrics] = useState<StationMetrics | null>(null);
  const [analytics, setAnalytics] = useState<StaffAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [selectedStation]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const stationsData = await MockDatabaseService.getStations();
      setStations(stationsData);
      
      // Mock staff metrics
      setMetrics({
        todaysSessions: 23,
        todaysRevenue: 567.80,
        currentUtilization: 68.5,
        averageSessionDuration: 2.3,
        customerSatisfaction: 4.7,
        maintenanceAlerts: 2
      });

      // Mock analytics data
      const dailyUsage = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return {
          date: date.toISOString().split('T')[0],
          sessions: Math.floor(Math.random() * 30) + 15,
          revenue: Math.floor(Math.random() * 500) + 200
        };
      }).reverse();

      const hourlyPattern = Array.from({ length: 24 }, (_, hour) => ({
        hour,
        sessions: Math.floor(Math.random() * 8) + 2,
        utilization: Math.floor(Math.random() * 80) + 20
      }));

      const weeklyTrend = [
        { day: 'Mon', sessions: 145, revenue: 3250 },
        { day: 'Tue', sessions: 132, revenue: 2980 },
        { day: 'Wed', sessions: 156, revenue: 3420 },
        { day: 'Thu', sessions: 148, revenue: 3180 },
        { day: 'Fri', sessions: 167, revenue: 3650 },
        { day: 'Sat', sessions: 189, revenue: 4120 },
        { day: 'Sun', sessions: 134, revenue: 2890 }
      ];

      const recentSessions = [
        { id: '1', customer: 'John Doe', duration: '2.5h', amount: 45.60, status: 'completed' },
        { id: '2', customer: 'Jane Smith', duration: '1.8h', amount: 32.40, status: 'completed' },
        { id: '3', customer: 'Mike Johnson', duration: '3.2h', amount: 58.80, status: 'in-progress' },
        { id: '4', customer: 'Sarah Wilson', duration: '2.1h', amount: 38.20, status: 'completed' },
        { id: '5', customer: 'Tom Brown', duration: '1.5h', amount: 27.50, status: 'completed' }
      ];

      setAnalytics({
        dailyUsage,
        hourlyPattern,
        weeklyTrend,
        recentSessions
      });

    } catch (error) {
      console.error('Failed to load staff data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading || !metrics || !analytics) {
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t.staffDashboard}</h1>
          <p className="text-gray-600">Station operations and analytics</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedStation} onValueChange={setSelectedStation}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stations</SelectItem>
              {stations.map((station) => (
                <SelectItem key={station.id} value={station.id}>
                  {station.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={async () => {
              try {
                await logout();
                toast.success(t.signOut || 'Logged out');
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

      {/* Real-time Metrics */}
      <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Sessions</p>
                <p className="text-2xl font-bold">{metrics.todaysSessions}</p>
                <p className="text-xs text-green-600">+15% vs yesterday</p>
              </div>
              <Zap className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Revenue</p>
                <p className="text-2xl font-bold">${metrics.todaysRevenue}</p>
                <p className="text-xs text-green-600">+8% vs yesterday</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Utilization</p>
                <p className="text-2xl font-bold">{metrics.currentUtilization}%</p>
                <p className="text-xs text-gray-500">current load</p>
              </div>
              <Activity className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Duration</p>
                <p className="text-2xl font-bold">{metrics.averageSessionDuration}h</p>
                <p className="text-xs text-gray-500">per session</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Satisfaction</p>
                <p className="text-2xl font-bold">{metrics.customerSatisfaction}</p>
                <p className="text-xs text-green-600">customer rating</p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Alerts</p>
                <p className="text-2xl font-bold">{metrics.maintenanceAlerts}</p>
                <p className="text-xs text-yellow-600">maintenance</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="stations">Stations</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Analytics */}
        <TabsContent value="analytics">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Daily Usage Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.dailyUsage}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sessions" fill="#16a34a" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hourly Usage Pattern</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.hourlyPattern}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="sessions" stroke="#16a34a" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Weekly Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.weeklyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#059669" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <span>Weekly Revenue</span>
                    </div>
                    <span className="font-bold">
                      ${analytics.weeklyTrend.reduce((sum, day) => sum + day.revenue, 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-blue-600" />
                      <span>Total Sessions</span>
                    </div>
                    <span className="font-bold">
                      {analytics.weeklyTrend.reduce((sum, day) => sum + day.sessions, 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Activity className="w-5 h-5 text-purple-600" />
                      <span>Peak Hour</span>
                    </div>
                    <span className="font-bold">
                      {analytics.hourlyPattern.reduce((max, curr) => 
                        curr.sessions > max.sessions ? curr : max
                      ).hour}:00
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <span>Avg Revenue/Day</span>
                    </div>
                    <span className="font-bold">
                      ${(analytics.weeklyTrend.reduce((sum, day) => sum + day.revenue, 0) / 7).toFixed(0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sessions */}
        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Charging Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics.recentSessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell className="font-medium">{session.customer}</TableCell>
                      <TableCell>{session.duration}</TableCell>
                      <TableCell>${session.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(session.status)}>
                          {session.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                          {session.status === 'in-progress' && (
                            <Button variant="outline" size="sm">
                              Stop
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stations */}
        <TabsContent value="stations">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stations.map((station) => (
              <Card key={station.id} className="border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">{station.name}</h3>
                    <Badge className="bg-green-100 text-green-800">
                      Online
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{station.address}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                    <div>
                      <span className="text-gray-600">Available:</span>
                      <span className="font-medium ml-1">{station.available}/{station.total}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Power:</span>
                      <span className="font-medium ml-1">{station.power}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Utilization:</span>
                      <span className="font-medium ml-1">
                        {Math.floor(((station.total - station.available) / station.total) * 100)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Rating:</span>
                      <span className="font-medium ml-1">{station.rating}/5</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Monitor
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      Control
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Maintenance */}
        <TabsContent value="maintenance">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="w-5 h-5" />
                  Maintenance Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50">
                    <div>
                      <p className="font-medium">Downtown Hub - Connector 3</p>
                      <p className="text-sm text-gray-600">Scheduled maintenance due tomorrow</p>
                    </div>
                    <Badge variant="secondary">Pending</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Mall Center - Connector 1</p>
                      <p className="text-sm text-gray-600">Maintenance completed 2 days ago</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Completed</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Airport Station - All Connectors</p>
                      <p className="text-sm text-gray-600">Quarterly inspection next week</p>
                    </div>
                    <Badge variant="outline">Scheduled</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Report Incident</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="h-20 flex-col">
                      <AlertTriangle className="w-6 h-6 mb-2 text-red-600" />
                      <span>Emergency</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col">
                      <Wrench className="w-6 h-6 mb-2 text-orange-600" />
                      <span>Maintenance</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col">
                      <Settings className="w-6 h-6 mb-2 text-blue-600" />
                      <span>Technical</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col">
                      <Users className="w-6 h-6 mb-2 text-green-600" />
                      <span>Customer</span>
                    </Button>
                  </div>
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Create Incident Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Reports */}
        <TabsContent value="reports">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Station Reports</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Daily Usage Summary
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Revenue Report
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Wrench className="w-4 h-4 mr-2" />
                  Maintenance Log
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Customer Feedback
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Start New Session
                </Button>
                <Button variant="outline" className="w-full">
                  Manual Payment Processing
                </Button>
                <Button variant="outline" className="w-full">
                  Station Emergency Stop
                </Button>
                <Button variant="outline" className="w-full">
                  Contact Technical Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}