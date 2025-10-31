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
  Clock,
  Users,
  DollarSign,
  Activity,
  Settings,
  Wrench,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { Station, MockDatabaseService } from '../data/mockDatabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { LanguageSelector } from './LanguageSelector';
import { toast } from 'sonner';
import { ChargingSessionsManagement } from './ChargingSessionsManagement';
import * as staffStatsApi from '../api/staffStatsApi';

interface StationMetrics {
  todaysSessions: number;
  todaysRevenue: number;
  currentUtilization: number;
  averageSessionDuration: number;
  customerSatisfaction: number;
  maintenanceAlerts: number;
  yesterdaysSessions?: number;
  yesterdaysRevenue?: number;
}

interface StaffAnalytics {
  dailyUsage: { date: string; sessions: number; revenue: number }[];
  hourlyPattern: { hour: number; sessions: number; utilization: number }[];
  weeklyTrend: { day: string; sessions: number; revenue: number }[];
  recentSessions: { id: string; customer: string; duration: string; amount: number; status: string; station?: string }[];
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
      
      // Fetch REAL staff metrics from database
      const metricsData = await staffStatsApi.getStaffMetrics(
        selectedStation === 'all' ? undefined : selectedStation
      );
      setMetrics(metricsData);

      // Fetch REAL analytics data from database
      const analyticsData = await staffStatsApi.getStaffAnalytics(
        selectedStation === 'all' ? undefined : selectedStation
      );
      setAnalytics(analyticsData);

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
          <p className="text-gray-600">{t.stationOperations}</p>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSelector />
          <Select value={selectedStation} onValueChange={setSelectedStation}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.allStations}</SelectItem>
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
                <p className="text-sm text-gray-600">{t.todaysSessions}</p>
                <p className="text-2xl font-bold">{metrics.todaysSessions}</p>
                <p className="text-xs text-green-600">
                  {metrics.yesterdaysSessions !== undefined
                    ? staffStatsApi.calculatePercentageChange(metrics.todaysSessions, metrics.yesterdaysSessions)
                    : '+0%'}{' '}
                  {t.vsYesterday}
                </p>
              </div>
              <Zap className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.todaysRevenue}</p>
                <p className="text-2xl font-bold">${metrics.todaysRevenue.toFixed(2)}</p>
                <p className="text-xs text-green-600">
                  {metrics.yesterdaysRevenue !== undefined
                    ? staffStatsApi.calculatePercentageChange(metrics.todaysRevenue, metrics.yesterdaysRevenue)
                    : '+0%'}{' '}
                  {t.vsYesterday}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.utilization}</p>
                <p className="text-2xl font-bold">{metrics.currentUtilization.toFixed(1)}%</p>
                <p className="text-xs text-gray-500">{t.currentLoad}</p>
              </div>
              <Activity className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.avgDuration}</p>
                <p className="text-2xl font-bold">{metrics.averageSessionDuration.toFixed(1)}h</p>
                <p className="text-xs text-gray-500">{t.perSession}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.satisfaction}</p>
                <p className="text-2xl font-bold">{metrics.customerSatisfaction}</p>
                <p className="text-xs text-green-600">{t.customerRating}</p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.alerts}</p>
                <p className="text-2xl font-bold">{metrics.maintenanceAlerts}</p>
                <p className="text-xs text-yellow-600">{t.maintenanceLabel}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="analytics">{t.analytics}</TabsTrigger>
          <TabsTrigger value="chargingSessions">{t.chargingSessions}</TabsTrigger>
          <TabsTrigger value="sessions">{t.sessions}</TabsTrigger>
          <TabsTrigger value="stations">{t.stations}</TabsTrigger>
          <TabsTrigger value="maintenance">{t.maintenance}</TabsTrigger>
          <TabsTrigger value="reports">{t.reports}</TabsTrigger>
        </TabsList>

        {/* Charging Sessions Management */}
        <TabsContent value="chargingSessions">
          <ChargingSessionsManagement 
            userRole="staff" 
            stationId={selectedStation !== 'all' ? parseInt(selectedStation) : undefined}
          />
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  {t.dailyUsageTrend}
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
                <CardTitle>{t.hourlyUsagePattern}</CardTitle>
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
                <CardTitle>{t.weeklyPerformance}</CardTitle>
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
                <CardTitle>{t.performanceSummary}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <span>{t.weeklyRevenue}</span>
                    </div>
                    <span className="font-bold">
                      ${analytics.weeklyTrend.reduce((sum, day) => sum + day.revenue, 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-blue-600" />
                      <span>{t.totalSessions}</span>
                    </div>
                    <span className="font-bold">
                      {analytics.weeklyTrend.reduce((sum, day) => sum + day.sessions, 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Activity className="w-5 h-5 text-purple-600" />
                      <span>{t.peakHour}</span>
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
                      <span>{t.avgRevenuePerDay}</span>
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
                {t.recentChargingSessions}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.customer}</TableHead>
                    <TableHead>{t.duration}</TableHead>
                    <TableHead>{t.amount}</TableHead>
                    <TableHead>{t.status}</TableHead>
                    <TableHead>{t.actions}</TableHead>
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
                            {t.view}
                          </Button>
                          {session.status === 'in-progress' && (
                            <Button variant="outline" size="sm">
                              {t.stop}
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
                      {t.online}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{station.address}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                    <div>
                      <span className="text-gray-600">{t.available}:</span>
                      <span className="font-medium ml-1">{station.available}/{station.total}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">{t.power}:</span>
                      <span className="font-medium ml-1">{station.power}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">{t.utilization}:</span>
                      <span className="font-medium ml-1">
                        {Math.floor(((station.total - station.available) / station.total) * 100)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">{t.rating}:</span>
                      <span className="font-medium ml-1">{station.rating}/5</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      {t.monitor}
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      {t.control}
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
                  {t.maintenanceSchedule}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50">
                    <div>
                      <p className="font-medium">Downtown Hub - Connector 3</p>
                      <p className="text-sm text-gray-600">{t.scheduledMaintenanceDueTomorrow}</p>
                    </div>
                    <Badge variant="secondary">{t.pending}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Mall Center - Connector 1</p>
                      <p className="text-sm text-gray-600">{t.maintenanceCompleted2DaysAgo}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">{t.completed}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Airport Station - All Connectors</p>
                      <p className="text-sm text-gray-600">{t.quarterlyInspectionNextWeek}</p>
                    </div>
                    <Badge variant="outline">{t.scheduled}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t.reportIncident}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="h-20 flex-col">
                      <AlertTriangle className="w-6 h-6 mb-2 text-red-600" />
                      <span>{t.emergency}</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col">
                      <Wrench className="w-6 h-6 mb-2 text-orange-600" />
                      <span>{t.maintenance}</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col">
                      <Settings className="w-6 h-6 mb-2 text-blue-600" />
                      <span>{t.technical}</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col">
                      <Users className="w-6 h-6 mb-2 text-green-600" />
                      <span>{t.customer}</span>
                    </Button>
                  </div>
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    {t.createIncidentReport}
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
                <CardTitle>{t.stationReports}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  {t.dailyUsageSummary}
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <DollarSign className="w-4 h-4 mr-2" />
                  {t.revenueReport}
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Wrench className="w-4 h-4 mr-2" />
                  {t.maintenanceLog}
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  {t.customerFeedback}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t.quickActions}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  {t.startNewSession}
                </Button>
                <Button variant="outline" className="w-full">
                  {t.manualPaymentProcessing}
                </Button>
                <Button variant="outline" className="w-full">
                  {t.stationEmergencyStop}
                </Button>
                <Button variant="outline" className="w-full">
                  {t.contactTechnicalSupport}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}