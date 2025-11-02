import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Calendar, Clock, MapPin, Zap, DollarSign, Search, Filter } from 'lucide-react';

interface UserHistory {
  id: number;
  userId: number;
  action: string;
  timestamp: string;
  details?: {
    stationName?: string;
    amount?: number;
    duration?: string;
    location?: string;
    status?: string;
  };
}

// Mock data cho demo
const mockHistoryData: UserHistory[] = [
  {
    id: 1,
    userId: 1,
    action: 'CHARGING_COMPLETED',
    timestamp: '2024-11-02T14:30:00Z',
    details: {
      stationName: 'Central Mall Charging Hub',
      amount: 25.50,
      duration: '45 minutes',
      location: 'Ho Chi Minh City'
    }
  },
  {
    id: 2,
    userId: 1,
    action: 'BOOKING_CREATED',
    timestamp: '2024-11-01T09:15:00Z',
    details: {
      stationName: 'Airport Express Station',
      location: 'Tan Son Nhat Airport'
    }
  },
  {
    id: 3,
    userId: 1,
    action: 'PAYMENT_MADE',
    timestamp: '2024-10-30T16:45:00Z',
    details: {
      amount: 18.75,
      stationName: 'Downtown Quick Charge'
    }
  },
  {
    id: 4,
    userId: 1,
    action: 'PROFILE_UPDATED',
    timestamp: '2024-10-28T11:20:00Z',
    details: {}
  },
  {
    id: 5,
    userId: 1,
    action: 'LOGIN',
    timestamp: '2024-10-28T08:00:00Z',
    details: {}
  }
];

const getActionIcon = (action: string) => {
  switch (action) {
    case 'CHARGING_COMPLETED':
    case 'CHARGING_STARTED':
      return <Zap className="w-4 h-4" />;
    case 'PAYMENT_MADE':
      return <DollarSign className="w-4 h-4" />;
    case 'BOOKING_CREATED':
    case 'BOOKING_CANCELLED':
      return <Calendar className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
};

const getActionColor = (action: string) => {
  switch (action) {
    case 'CHARGING_COMPLETED':
      return 'bg-green-100 text-green-800';
    case 'CHARGING_STARTED':
      return 'bg-blue-100 text-blue-800';
    case 'PAYMENT_MADE':
      return 'bg-purple-100 text-purple-800';
    case 'BOOKING_CREATED':
      return 'bg-orange-100 text-orange-800';
    case 'BOOKING_CANCELLED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const formatAction = (action: string) => {
  return action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};

const UserHistoryPage: React.FC = () => {
  const [data, setData] = useState<UserHistory[]>([]);
  const [filteredData, setFilteredData] = useState<UserHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    // Simulate API call
    const fetchData = async () => {
      try {
        // In real app, replace with: fetch('/api/user-history')
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
        setData(mockHistoryData);
        setFilteredData(mockHistoryData);
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter logic
  useEffect(() => {
    let filtered = data;

    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.details?.stationName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.details?.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (actionFilter !== 'all') {
      filtered = filtered.filter(item => item.action === actionFilter);
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          filterDate.setDate(now.getDate());
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      filtered = filtered.filter(item => new Date(item.timestamp) >= filterDate);
    }

    setFilteredData(filtered);
  }, [data, searchTerm, actionFilter, dateFilter]);

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
        <h1 className="text-3xl font-bold mb-2">Lịch Sử Hoạt Động</h1>
        <p className="text-gray-600">Theo dõi tất cả hoạt động của bạn trong hệ thống</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Loại hoạt động" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả hoạt động</SelectItem>
                <SelectItem value="CHARGING_COMPLETED">Hoàn thành sạc</SelectItem>
                <SelectItem value="CHARGING_STARTED">Bắt đầu sạc</SelectItem>
                <SelectItem value="BOOKING_CREATED">Tạo đặt chỗ</SelectItem>
                <SelectItem value="PAYMENT_MADE">Thanh toán</SelectItem>
                <SelectItem value="LOGIN">Đăng nhập</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Thời gian" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="today">Hôm nay</SelectItem>
                <SelectItem value="week">7 ngày qua</SelectItem>
                <SelectItem value="month">30 ngày qua</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setActionFilter('all');
              setDateFilter('all');
            }}>
              <Filter className="w-4 h-4 mr-2" />
              Xóa bộ lọc
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* History List */}
      <div className="space-y-4">
        {filteredData.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className={`p-2 rounded-full ${getActionColor(item.action)}`}>
                    {getActionIcon(item.action)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold">{formatAction(item.action)}</h3>
                      <Badge variant="outline">{formatAction(item.action)}</Badge>
                    </div>
                    
                    {item.details?.stationName && (
                      <div className="flex items-center text-sm text-gray-600 mb-1">
                        <MapPin className="w-3 h-3 mr-1" />
                        {item.details.stationName}
                        {item.details.location && ` - ${item.details.location}`}
                      </div>
                    )}
                    
                    {item.details?.duration && (
                      <div className="flex items-center text-sm text-gray-600 mb-1">
                        <Clock className="w-3 h-3 mr-1" />
                        Thời gian: {item.details.duration}
                      </div>
                    )}
                    
                    {item.details?.amount && (
                      <div className="flex items-center text-sm text-green-600 font-medium">
                        <DollarSign className="w-3 h-3 mr-1" />
                        {item.details.amount.toLocaleString('vi-VN')} VNĐ
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    {new Date(item.timestamp).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredData.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Không có hoạt động nào
              </h3>
              <p className="text-gray-600">
                Thử điều chỉnh bộ lọc để xem thêm kết quả.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UserHistoryPage;
