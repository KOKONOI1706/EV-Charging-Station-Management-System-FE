import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  BarChart3, 
  Download, 
  TrendingUp, 
  Zap, 
  Calendar, 
  DollarSign, 
  MapPin,
  Leaf,
  Clock,
  Battery
} from 'lucide-react';

interface PersonalReport {
  id: number;
  userId: number;
  reportType: string;
  createdAt: string;
  details: string;
  status: 'generating' | 'completed' | 'failed';
  downloadUrl?: string;
}

interface ChargingStats {
  totalSessions: number;
  totalEnergy: number; // kWh
  totalCost: number;
  averageSessionTime: number; // minutes
  favoriteStation: string;
  carbonSaved: number; // kg CO2
}

interface MonthlyData {
  month: string;
  sessions: number;
  energy: number;
  cost: number;
}

// Mock data cho demo
const mockReports: PersonalReport[] = [
  {
    id: 1,
    userId: 1,
    reportType: 'MONTHLY_USAGE',
    createdAt: '2024-11-01T00:00:00Z',
    details: JSON.stringify({
      period: 'October 2024',
      totalSessions: 15,
      totalEnergy: 120.5,
      totalCost: 450000
    }),
    status: 'completed',
    downloadUrl: '/reports/monthly-oct-2024.pdf'
  },
  {
    id: 2,
    userId: 1,
    reportType: 'CHARGING_SUMMARY',
    createdAt: '2024-10-28T00:00:00Z',
    details: JSON.stringify({
      period: 'Last 30 days',
      sessions: 12,
      averageTime: 45
    }),
    status: 'completed'
  },
  {
    id: 3,
    userId: 1,
    reportType: 'COST_ANALYSIS',
    createdAt: '2024-10-25T00:00:00Z',
    details: JSON.stringify({
      totalSpent: 1250000,
      averagePerSession: 83333,
      savings: 15
    }),
    status: 'generating'
  }
];

const mockStats: ChargingStats = {
  totalSessions: 48,
  totalEnergy: 385.2,
  totalCost: 1450000,
  averageSessionTime: 42,
  favoriteStation: 'Central Mall Charging Hub',
  carbonSaved: 92.4
};

const mockMonthlyData: MonthlyData[] = [
  { month: 'Jul', sessions: 8, energy: 65.2, cost: 245000 },
  { month: 'Aug', sessions: 12, energy: 98.5, cost: 370000 },
  { month: 'Sep', sessions: 13, energy: 105.8, cost: 398000 },
  { month: 'Oct', sessions: 15, energy: 115.7, cost: 437000 },
];

const getReportTypeLabel = (type: string) => {
  const labels: { [key: string]: string } = {
    'MONTHLY_USAGE': 'Báo cáo sử dụng hàng tháng',
    'CHARGING_SUMMARY': 'Tổng hợp phiên sạc',
    'COST_ANALYSIS': 'Phân tích chi phí',
    'CARBON_FOOTPRINT': 'Dấu chân carbon',
    'YEARLY_SUMMARY': 'Tổng kết năm'
  };
  return labels[type] || type;
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'completed':
      return <Badge className="bg-green-100 text-green-800">Hoàn thành</Badge>;
    case 'generating':
      return <Badge className="bg-yellow-100 text-yellow-800">Đang tạo</Badge>;
    case 'failed':
      return <Badge className="bg-red-100 text-red-800">Lỗi</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const PersonalReportPage: React.FC = () => {
  const [reports, setReports] = useState<PersonalReport[]>([]);
  const [stats, setStats] = useState<ChargingStats | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportTypeFilter, setReportTypeFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // In real app, replace with API calls
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
        setReports(mockReports);
        setStats(mockStats);
        setMonthlyData(mockMonthlyData);
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const generateNewReport = async (type: string) => {
    // Simulate report generation
    const newReport: PersonalReport = {
      id: Date.now(),
      userId: 1,
      reportType: type,
      createdAt: new Date().toISOString(),
      details: JSON.stringify({ generating: true }),
      status: 'generating'
    };
    
    setReports(prev => [newReport, ...prev]);
    
    // Simulate completion after 3 seconds
    setTimeout(() => {
      setReports(prev => prev.map(r => 
        r.id === newReport.id 
          ? { ...r, status: 'completed' as const, details: JSON.stringify({ period: 'Current', completed: true }) }
          : r
      ));
    }, 3000);
  };

  const filteredReports = reportTypeFilter === 'all' 
    ? reports 
    : reports.filter(r => r.reportType === reportTypeFilter);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-6 text-center">
            <p className="text-red-600">Error: {error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Báo Cáo Cá Nhân</h1>
        <p className="text-gray-600">Theo dõi thống kê và báo cáo sử dụng của bạn</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="reports">Báo cáo</TabsTrigger>
          <TabsTrigger value="analytics">Phân tích</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {stats && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Tổng phiên sạc</p>
                        <p className="text-2xl font-bold">{stats.totalSessions}</p>
                        <p className="text-xs text-green-600 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          +12% tháng này
                        </p>
                      </div>
                      <Zap className="w-8 h-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Tổng năng lượng</p>
                        <p className="text-2xl font-bold">{stats.totalEnergy} kWh</p>
                        <p className="text-xs text-green-600">+8% tháng này</p>
                      </div>
                      <Battery className="w-8 h-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Tổng chi phí</p>
                        <p className="text-2xl font-bold">{stats.totalCost.toLocaleString('vi-VN')} ₫</p>
                        <p className="text-xs text-red-600">+5% tháng này</p>
                      </div>
                      <DollarSign className="w-8 h-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Carbon tiết kiệm</p>
                        <p className="text-2xl font-bold">{stats.carbonSaved} kg</p>
                        <p className="text-xs text-green-600">CO₂ không thải ra</p>
                      </div>
                      <Leaf className="w-8 h-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Thông tin sử dụng
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Thời gian sạc TB:</span>
                      <span className="font-medium">{stats.averageSessionTime} phút</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Chi phí TB/phiên:</span>
                      <span className="font-medium">{Math.round(stats.totalCost / stats.totalSessions).toLocaleString('vi-VN')} ₫</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Năng lượng TB/phiên:</span>
                      <span className="font-medium">{(stats.totalEnergy / stats.totalSessions).toFixed(1)} kWh</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Trạm yêu thích
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-4">
                      <h3 className="font-semibold text-lg">{stats.favoriteStation}</h3>
                      <p className="text-gray-600">Được sử dụng nhiều nhất</p>
                      <Button variant="outline" className="mt-3">
                        Xem chi tiết
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          {/* Generate New Report */}
          <Card>
            <CardHeader>
              <CardTitle>Tạo báo cáo mới</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => generateNewReport('MONTHLY_USAGE')} variant="outline">
                  Báo cáo tháng
                </Button>
                <Button onClick={() => generateNewReport('CHARGING_SUMMARY')} variant="outline">
                  Tổng hợp sạc
                </Button>
                <Button onClick={() => generateNewReport('COST_ANALYSIS')} variant="outline">
                  Phân tích chi phí
                </Button>
                <Button onClick={() => generateNewReport('CARBON_FOOTPRINT')} variant="outline">
                  Dấu chân carbon
                </Button>
                <Button onClick={() => generateNewReport('YEARLY_SUMMARY')} variant="outline">
                  Tổng kết năm
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Filter */}
          <div className="flex items-center gap-4">
            <label className="font-medium">Lọc theo loại:</label>
            <Select value={reportTypeFilter} onValueChange={setReportTypeFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả báo cáo</SelectItem>
                <SelectItem value="MONTHLY_USAGE">Báo cáo tháng</SelectItem>
                <SelectItem value="CHARGING_SUMMARY">Tổng hợp sạc</SelectItem>
                <SelectItem value="COST_ANALYSIS">Phân tích chi phí</SelectItem>
                <SelectItem value="CARBON_FOOTPRINT">Dấu chân carbon</SelectItem>
                <SelectItem value="YEARLY_SUMMARY">Tổng kết năm</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reports List */}
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <Card key={report.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="p-2 rounded-full bg-blue-100">
                        <BarChart3 className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{getReportTypeLabel(report.reportType)}</h3>
                        <p className="text-sm text-gray-600">
                          Tạo ngày: {new Date(report.createdAt).toLocaleDateString('vi-VN')}
                        </p>
                        {report.details && (
                          <div className="mt-2 text-sm">
                            {JSON.parse(report.details).period && (
                              <span className="text-gray-700">
                                Kỳ: {JSON.parse(report.details).period}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(report.status)}
                      {report.status === 'completed' && (
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          Tải xuống
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredReports.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Chưa có báo cáo nào
                  </h3>
                  <p className="text-gray-600">
                    Tạo báo cáo đầu tiên để theo dõi hoạt động của bạn.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Xu hướng 4 tháng gần đây</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Simple Bar Chart Representation */}
                <div>
                  <h4 className="font-medium mb-3">Số phiên sạc theo tháng</h4>
                  <div className="space-y-2">
                    {mockMonthlyData.map((data, index) => (
                      <div key={data.month} className="flex items-center">
                        <div className="w-12 text-sm">{data.month}</div>
                        <div className="flex-1 bg-gray-200 rounded-full h-6 mx-3">
                          <div 
                            className="bg-blue-600 h-6 rounded-full flex items-center justify-end pr-2"
                            style={{ width: `${(data.sessions / 20) * 100}%` }}
                          >
                            <span className="text-white text-xs font-medium">{data.sessions}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Năng lượng tiêu thụ (kWh)</h4>
                  <div className="space-y-2">
                    {mockMonthlyData.map((data, index) => (
                      <div key={data.month} className="flex items-center">
                        <div className="w-12 text-sm">{data.month}</div>
                        <div className="flex-1 bg-gray-200 rounded-full h-6 mx-3">
                          <div 
                            className="bg-green-600 h-6 rounded-full flex items-center justify-end pr-2"
                            style={{ width: `${(data.energy / 150) * 100}%` }}
                          >
                            <span className="text-white text-xs font-medium">{data.energy}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Chi phí (VNĐ)</h4>
                  <div className="space-y-2">
                    {mockMonthlyData.map((data, index) => (
                      <div key={data.month} className="flex items-center">
                        <div className="w-12 text-sm">{data.month}</div>
                        <div className="flex-1 bg-gray-200 rounded-full h-6 mx-3">
                          <div 
                            className="bg-purple-600 h-6 rounded-full flex items-center justify-end pr-2"
                            style={{ width: `${(data.cost / 500000) * 100}%` }}
                          >
                            <span className="text-white text-xs font-medium">
                              {Math.round(data.cost / 1000)}k
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PersonalReportPage;
