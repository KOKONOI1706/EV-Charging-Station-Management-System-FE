import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Zap,
  Clock,
  Calendar,
  Star,
  Target,
  MapPin,
  Activity,
  Award,
  Leaf
} from 'lucide-react';
import { Booking } from '../data/mockDatabase';
import { useLanguage } from '../hooks/useLanguage';

interface CustomerAnalyticsProps {
  bookings: Booking[];
  userName: string;
}

interface CustomerStats {
  totalSessions: number;
  totalSpent: number;
  totalKwh: number;
  averageSessionCost: number;
  averageSessionDuration: number;
  favoriteStation: string;
  carbonSaved: number;
  monthlySpending: { month: string; spent: number; sessions: number }[];
  weeklyPattern: { day: string; sessions: number; hours: number }[];
  stationUsage: { station: string; sessions: number; spent: number }[];
  timeOfDayUsage: { hour: number; sessions: number }[];
  efficiencyTrend: { month: string; kwhPerSession: number; costPerKwh: number }[];
}

const COLORS = ['#16a34a', '#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0'];

export function CustomerAnalyticsDashboard({ bookings, userName }: CustomerAnalyticsProps) {
  const { t } = useLanguage();
  const [timeRange, setTimeRange] = useState('6months');
  const [stats, setStats] = useState<CustomerStats | null>(null);

  useEffect(() => {
    calculateStats();
  }, [bookings, timeRange]);

  const calculateStats = () => {
    if (!bookings.length) return;

    // Filter bookings by time range
    const now = new Date();
    let filteredBookings = bookings;
    
    switch (timeRange) {
      case '1month':
        filteredBookings = bookings.filter(b => {
          const bookingDate = new Date(b.date);
          return (now.getTime() - bookingDate.getTime()) <= (30 * 24 * 60 * 60 * 1000);
        });
        break;
      case '3months':
        filteredBookings = bookings.filter(b => {
          const bookingDate = new Date(b.date);
          return (now.getTime() - bookingDate.getTime()) <= (90 * 24 * 60 * 60 * 1000);
        });
        break;
      case '6months':
        filteredBookings = bookings.filter(b => {
          const bookingDate = new Date(b.date);
          return (now.getTime() - bookingDate.getTime()) <= (180 * 24 * 60 * 60 * 1000);
        });
        break;
    }

    const totalSessions = filteredBookings.length;
    const totalSpent = filteredBookings.reduce((sum, b) => sum + parseFloat(b.price), 0);
    const totalKwh = filteredBookings.reduce((sum, b) => sum + (b.actualKwh || 0), 0);
    
    // Calculate monthly spending
    const monthlySpending: { [key: string]: { spent: number; sessions: number } } = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    filteredBookings.forEach(booking => {
      const monthKey = months[new Date(booking.date).getMonth()];
      if (!monthlySpending[monthKey]) {
        monthlySpending[monthKey] = { spent: 0, sessions: 0 };
      }
      monthlySpending[monthKey].spent += parseFloat(booking.price);
      monthlySpending[monthKey].sessions += 1;
    });

    const monthlySpendingArray = Object.entries(monthlySpending).map(([month, data]) => ({
      month,
      spent: data.spent,
      sessions: data.sessions
    }));

    // Calculate weekly pattern
    const weeklyPattern: { [key: string]: { sessions: number; hours: number } } = {};
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    filteredBookings.forEach(booking => {
      const dayKey = days[new Date(booking.date).getDay()];
      if (!weeklyPattern[dayKey]) {
        weeklyPattern[dayKey] = { sessions: 0, hours: 0 };
      }
      weeklyPattern[dayKey].sessions += 1;
      weeklyPattern[dayKey].hours += parseFloat(booking.duration);
    });

    const weeklyPatternArray = days.map(day => ({
      day,
      sessions: weeklyPattern[day]?.sessions || 0,
      hours: weeklyPattern[day]?.hours || 0
    }));

    // Calculate station usage
    const stationUsage: { [key: string]: { sessions: number; spent: number } } = {};
    
    filteredBookings.forEach(booking => {
      const stationName = booking.station.name;
      if (!stationUsage[stationName]) {
        stationUsage[stationName] = { sessions: 0, spent: 0 };
      }
      stationUsage[stationName].sessions += 1;
      stationUsage[stationName].spent += parseFloat(booking.price);
    });

    const stationUsageArray = Object.entries(stationUsage).map(([station, data]) => ({
      station,
      sessions: data.sessions,
      spent: data.spent
    })).sort((a, b) => b.sessions - a.sessions);

    // Calculate time of day usage
    const timeOfDayUsage: { [key: number]: number } = {};
    
    filteredBookings.forEach(booking => {
      const hour = parseInt(booking.time.split(':')[0]);
      timeOfDayUsage[hour] = (timeOfDayUsage[hour] || 0) + 1;
    });

    const timeOfDayUsageArray = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      sessions: timeOfDayUsage[hour] || 0
    }));

    // Calculate efficiency trend (mock data for demonstration)
    const efficiencyTrend = monthlySpendingArray.map(month => ({
      month: month.month,
      kwhPerSession: month.sessions > 0 ? (totalKwh / totalSessions) : 0,
      costPerKwh: month.spent > 0 && totalKwh > 0 ? (month.spent / (totalKwh / totalSessions)) : 0
    }));

    const favoriteStation = stationUsageArray[0]?.station || 'N/A';
    const carbonSaved = totalKwh * 0.4; // Estimate: 0.4kg CO2 saved per kWh vs gasoline

    setStats({
      totalSessions,
      totalSpent,
      totalKwh,
      averageSessionCost: totalSessions > 0 ? totalSpent / totalSessions : 0,
      averageSessionDuration: totalSessions > 0 ? 
        filteredBookings.reduce((sum, b) => sum + parseFloat(b.duration), 0) / totalSessions : 0,
      favoriteStation,
      carbonSaved,
      monthlySpending: monthlySpendingArray,
      weeklyPattern: weeklyPatternArray,
      stationUsage: stationUsageArray,
      timeOfDayUsage: timeOfDayUsageArray,
      efficiencyTrend
    });
  };

  if (!stats) {
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
          <h1 className="text-3xl font-bold mb-2">Your Charging Analytics</h1>
          <p className="text-gray-600">Personal insights and patterns for {userName}</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1month">Last Month</SelectItem>
            <SelectItem value="3months">Last 3 Months</SelectItem>
            <SelectItem value="6months">Last 6 Months</SelectItem>
            <SelectItem value="1year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sessions</p>
                <p className="text-2xl font-bold">{stats.totalSessions}</p>
                <p className="text-xs text-gray-500">charging sessions</p>
              </div>
              <Zap className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold">${stats.totalSpent.toFixed(2)}</p>
                <p className="text-xs text-gray-500">on charging</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Energy Used</p>
                <p className="text-2xl font-bold">{stats.totalKwh.toFixed(1)}</p>
                <p className="text-xs text-gray-500">kWh total</p>
              </div>
              <Activity className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Carbon Saved</p>
                <p className="text-2xl font-bold">{stats.carbonSaved.toFixed(1)}</p>
                <p className="text-xs text-gray-500">kg CO₂</p>
              </div>
              <Leaf className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="spending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="spending">Spending</TabsTrigger>
          <TabsTrigger value="usage">Usage Patterns</TabsTrigger>
          <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Spending Analysis */}
        <TabsContent value="spending">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Monthly Spending Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={stats.monthlySpending}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'Spent']} />
                    <Area 
                      type="monotone" 
                      dataKey="spent" 
                      stroke="#16a34a" 
                      fill="#16a34a" 
                      fillOpacity={0.3} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Spending by Station</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.stationUsage.slice(0, 5)}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="spent"
                      nameKey="station"
                    >
                      {stats.stationUsage.slice(0, 5).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`$${value}`, 'Spent']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Target className="w-5 h-5 text-blue-600" />
                      <span>Average per Session</span>
                    </div>
                    <span className="font-bold">${stats.averageSessionCost.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <span>Cost per kWh</span>
                    </div>
                    <span className="font-bold">
                      ${stats.totalKwh > 0 ? (stats.totalSpent / stats.totalKwh).toFixed(3) : '0.000'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-purple-600" />
                      <span>Monthly Average</span>
                    </div>
                    <span className="font-bold">
                      ${(stats.monthlySpending.reduce((sum, m) => sum + m.spent, 0) / Math.max(stats.monthlySpending.length, 1)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Spending Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.averageSessionCost > 20 && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <Award className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-blue-800">Consider Premium Plan</span>
                      </div>
                      <p className="text-sm text-blue-600">
                        With your usage pattern, a Premium plan could save you 20% on charging costs.
                      </p>
                    </div>
                  )}
                  
                  {stats.stationUsage[0] && stats.stationUsage[0].sessions >= 5 && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <Star className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-green-800">Loyalty Opportunity</span>
                      </div>
                      <p className="text-sm text-green-600">
                        You frequently use {stats.favoriteStation}. Check if they offer loyalty discounts!
                      </p>
                    </div>
                  )}

                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <Clock className="w-5 h-5 text-yellow-600" />
                      <span className="font-medium text-yellow-800">Off-Peak Charging</span>
                    </div>
                    <p className="text-sm text-yellow-600">
                      Try charging during off-peak hours (10 PM - 6 AM) for potential savings.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Usage Patterns */}
        <TabsContent value="usage">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Weekly Usage Pattern
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.weeklyPattern}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sessions" fill="#16a34a" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Time of Day Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.timeOfDayUsage}>
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
                <CardTitle>Favorite Stations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.stationUsage.slice(0, 5).map((station, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-green-700">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium">{station.station}</p>
                          <p className="text-sm text-gray-600">{station.sessions} sessions</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${station.spent.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">total spent</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usage Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{stats.averageSessionDuration.toFixed(1)}h</p>
                    <p className="text-sm text-gray-600">Avg Duration</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <MapPin className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{stats.stationUsage.length}</p>
                    <p className="text-sm text-gray-600">Stations Used</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Zap className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold">
                      {stats.totalSessions > 0 ? (stats.totalKwh / stats.totalSessions).toFixed(1) : '0'}
                    </p>
                    <p className="text-sm text-gray-600">kWh per Session</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Star className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{stats.favoriteStation.split(' ')[0]}</p>
                    <p className="text-sm text-gray-600">Top Station</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Efficiency */}
        <TabsContent value="efficiency">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Energy Efficiency Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.efficiencyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="kwhPerSession" stroke="#16a34a" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Efficiency</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.efficiencyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'Cost per kWh']} />
                    <Line type="monotone" dataKey="costPerKwh" stroke="#059669" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Environmental Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center p-6 bg-green-50 border border-green-200 rounded-lg">
                    <Leaf className="w-12 h-12 text-green-600 mx-auto mb-4" />
                    <p className="text-3xl font-bold text-green-700">{stats.carbonSaved.toFixed(1)} kg</p>
                    <p className="text-green-600">CO₂ emissions saved</p>
                    <p className="text-sm text-gray-600 mt-2">
                      Equivalent to planting {Math.floor(stats.carbonSaved / 22)} trees
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-xl font-bold">{(stats.totalKwh / 100).toFixed(1)}x</p>
                      <p className="text-sm text-gray-600">Less than gas car</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-xl font-bold">{stats.totalKwh.toFixed(0)}</p>
                      <p className="text-sm text-gray-600">Clean energy used</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Efficiency Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <Target className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-blue-800">Optimal Charging</span>
                    </div>
                    <p className="text-sm text-blue-600">
                      Your average session uses {(stats.totalKwh / stats.totalSessions).toFixed(1)} kWh. 
                      Consider charging to 80% for optimal battery health.
                    </p>
                  </div>

                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <Zap className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-800">Smart Charging</span>
                    </div>
                    <p className="text-sm text-green-600">
                      Schedule charging during off-peak hours to reduce costs and grid strain.
                    </p>
                  </div>

                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <Activity className="w-5 h-5 text-purple-600" />
                      <span className="font-medium text-purple-800">Route Planning</span>
                    </div>
                    <p className="text-sm text-purple-600">
                      Pre-plan charging stops for longer trips to minimize charging time.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Insights */}
        <TabsContent value="insights">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Your Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.totalSessions >= 10 && (
                    <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                        <Star className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">Frequent Charger</p>
                        <p className="text-sm text-gray-600">Completed {stats.totalSessions} charging sessions</p>
                      </div>
                    </div>
                  )}

                  {stats.carbonSaved > 50 && (
                    <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <Leaf className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">Eco Warrior</p>
                        <p className="text-sm text-gray-600">Saved {stats.carbonSaved.toFixed(0)}kg of CO₂ emissions</p>
                      </div>
                    </div>
                  )}

                  {stats.stationUsage.length >= 3 && (
                    <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">Explorer</p>
                        <p className="text-sm text-gray-600">Used {stats.stationUsage.length} different charging stations</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">Energy User</p>
                      <p className="text-sm text-gray-600">Consumed {stats.totalKwh.toFixed(0)} kWh of clean energy</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Personal Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Your Charging Personality</h4>
                    <p className="text-sm text-gray-600">
                      {stats.averageSessionDuration > 3 
                        ? "You prefer longer, complete charging sessions. This is great for battery health!"
                        : "You tend to top up frequently with shorter sessions. Consider longer sessions occasionally."
                      }
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Cost Consciousness</h4>
                    <p className="text-sm text-gray-600">
                      {stats.averageSessionCost < 15
                        ? "You're a budget-conscious charger, finding good deals on charging."
                        : "You prioritize convenience over cost, often using premium charging stations."
                      }
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Station Loyalty</h4>
                    <p className="text-sm text-gray-600">
                      {stats.stationUsage[0] && stats.stationUsage[0].sessions > stats.totalSessions * 0.4
                        ? `You're loyal to ${stats.favoriteStation}, using it for ${Math.round((stats.stationUsage[0].sessions / stats.totalSessions) * 100)}% of sessions.`
                        : "You explore different stations, which helps you find the best options."
                      }
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Environmental Impact</h4>
                    <p className="text-sm text-gray-600">
                      Your EV charging has prevented approximately {stats.carbonSaved.toFixed(1)} kg of CO₂ emissions
                      compared to driving a gasoline vehicle the same distance.
                    </p>
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