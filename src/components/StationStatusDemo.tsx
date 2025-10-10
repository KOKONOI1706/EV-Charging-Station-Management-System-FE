import React, { useState, useEffect } from 'react';
import { StationMapView } from './StationMapView';
import { mockStationsForDemo, injectDemoStations } from '../data/mockStationsDemo';
import { Station } from '../services/supabaseService';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { RefreshCw, MapPin } from 'lucide-react';

export const StationStatusDemo: React.FC = () => {
  const [demoStations, setDemoStations] = useState<Station[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusCounts, setStatusCounts] = useState({
    available: 0,
    full: 0,
    maintenance: 0,
    soonAvailable: 0,
    incompatible: 0,
    offline: 0
  });

  const loadDemoData = async () => {
    setIsLoading(true);
    try {
      const stations = await injectDemoStations();
      setDemoStations(stations);
      
      // Tính toán thống kê
      const counts = {
        available: 0,
        full: 0,
        maintenance: 0,
        soonAvailable: 0,
        incompatible: 0,
        offline: 0
      };

      stations.forEach(station => {
        if (station.status === 'maintenance') {
          counts.maintenance++;
        } else if (station.status === 'offline') {
          counts.offline++;
        } else if (station.available_spots === 0 && station.next_available_in_minutes && station.next_available_in_minutes <= 10) {
          counts.soonAvailable++;
        } else if (station.available_spots === 0) {
          counts.full++;
        } else if (station.available_spots > 0) {
          // Check compatibility (simplified)
          const isCompatible = !station.vehicle_compatibility || 
            station.vehicle_compatibility.some(v => v.toLowerCase().includes('tesla'));
          
          if (isCompatible) {
            counts.available++;
          } else {
            counts.incompatible++;
          }
        }
      });

      setStatusCounts(counts);
    } catch (error) {
      console.error('Error loading demo data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDemoData();
  }, []);

  const statusInfo = [
    {
      label: 'Có sẵn',
      color: 'bg-green-500',
      count: statusCounts.available,
      description: 'Trạm hoạt động bình thường và có chỗ trống'
    },
    {
      label: 'Đã đầy',
      color: 'bg-red-500',
      count: statusCounts.full,
      description: 'Tất cả điểm sạc đang được sử dụng'
    },
    {
      label: 'Sắp có chỗ',
      color: 'bg-yellow-500',
      count: statusCounts.soonAvailable,
      description: 'Sẽ có chỗ trống trong vòng 10 phút'
    },
    {
      label: 'Bảo trì',
      color: 'bg-gray-500',
      count: statusCounts.maintenance,
      description: 'Trạm đang trong quá trình bảo trì'
    },
    {
      label: 'Không tương thích',
      color: 'bg-orange-500',
      count: statusCounts.incompatible,
      description: 'Có chỗ nhưng không tương thích với xe của bạn'
    },
    {
      label: 'Tạm ngừng',
      color: 'bg-gray-700',
      count: statusCounts.offline,
      description: 'Trạm tạm thời không hoạt động'
    }
  ];

  return (
    <div className="h-screen flex flex-col">
      {/* Header with Demo Controls */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <MapPin className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold">Demo Hệ Thống Màu Trạm Sạc</h1>
          </div>
          <Button
            onClick={loadDemoData}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Đang tải...' : 'Tải lại demo'}
          </Button>
        </div>

        {/* Status Legend */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {statusInfo.map((info, index) => (
            <Card key={index} className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-4 h-4 rounded-full ${info.color}`}></div>
                <span className="font-semibold text-sm">{info.label}</span>
              </div>
              <div className="text-2xl font-bold text-gray-800 mb-1">
                {info.count}
              </div>
              <div className="text-xs text-gray-600 leading-tight">
                {info.description}
              </div>
            </Card>
          ))}
        </div>

        {/* Demo Information */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">📍 Quy tắc màu hiển thị:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-700">
            <div>• <span className="font-medium">Xanh lá:</span> Có chỗ và tương thích</div>
            <div>• <span className="font-medium">Đỏ:</span> Đã hết chỗ</div>
            <div>• <span className="font-medium">Vàng:</span> Sắp có chỗ (≤10 phút)</div>
            <div>• <span className="font-medium">Cam:</span> Có chỗ nhưng không tương thích</div>
            <div>• <span className="font-medium">Xám:</span> Bảo trì hoặc tạm ngừng</div>
            <div>• <span className="font-medium">Popup:</span> Click marker để xem chi tiết</div>
          </div>
        </div>
      </div>

      {/* Map View */}
      <div className="flex-1">
        <StationMapView
          stations={demoStations}
          onStationSelect={() => {}}
          selectedStation={null}
          userLocation={{ lat: 10.8515, lng: 106.7717 }} // Thủ Đức, TP.HCM
        />
      </div>
    </div>
  );
};

export default StationStatusDemo;