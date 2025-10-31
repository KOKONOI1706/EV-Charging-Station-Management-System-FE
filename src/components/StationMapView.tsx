import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { 
  MapPin, 
  Search, 
  Zap, 
  Star,
  Filter,
  List,
  Map
} from 'lucide-react';
import { Station, MockDatabaseService } from '../data/mockDatabase';
import { useLanguage } from '../hooks/useLanguage';
import { LeafletMap } from './LeafletMap';
import { getStationStatus } from '../utils/stationStatus';

interface StationMapViewProps {
  onStationSelect: (station: Station) => void;
  onViewDetails: (station: Station) => void;
}

const defaultCenter: [number, number] = [10.762622, 106.660172]; // TP.HCM
const defaultZoom = 13;

export function StationMapView({ onStationSelect, onViewDetails }: StationMapViewProps) {
  const { t } = useLanguage();
  const [stations, setStations] = useState<Station[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStations();
  }, []);

  const loadStations = async () => {
    try {
      setIsLoading(true);
      const stationsData = await MockDatabaseService.getStations();
      setStations(stationsData);
    } catch (error) {
      console.error('Failed to load stations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStations = stations.filter(station =>
    station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    station.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    station.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderMapView = () => (
    <div className="relative">
      <div className="rounded-lg overflow-hidden" style={{ height: '24rem' }}>
        <LeafletMap
          stations={filteredStations}
          center={defaultCenter}
          zoom={defaultZoom}
          onStationSelect={onStationSelect}
          onViewDetails={onViewDetails}
        />
      </div>

      {/* Legend */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 z-[150] border border-gray-200">
        <h4 className="font-semibold mb-3 text-sm">🗺️ Chú thích trạng thái</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500 shadow-sm"></div>
            <span className="text-gray-700">✅ Còn nhiều chỗ</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-500 shadow-sm"></div>
            <span className="text-gray-700">⚠️ Sắp đầy / Sắp có chỗ</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500 shadow-sm"></div>
            <span className="text-gray-700">🔴 Hết chỗ</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gray-400 shadow-sm"></div>
            <span className="text-gray-700">🔧 Bảo trì</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderListView = () => (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredStations.map((station) => {
        const statusInfo = getStationStatus(station);
        
        return (
          <Card key={station.id} className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 border-2 hover:border-green-500">
            <CardContent className="p-4">
              {/* Station Image */}
              <div className="w-full h-32 rounded-lg overflow-hidden mb-3">
                <img
                  src={station.image}
                  alt={station.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=Charging+Station';
                  }}
                />
              </div>

              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-base">{station.name}</h3>
                <Badge className={`${statusInfo.bgColor} ${statusInfo.textColor} flex items-center gap-1`}>
                  <span>{statusInfo.icon}</span>
                  <span>{statusInfo.label}</span>
                </Badge>
              </div>
              
              <p className="text-sm text-gray-600 mb-3 flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
                <span>{station.address}</span>
              </p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Chỗ trống:</span>
                  <span className="font-semibold">{station.available}/{station.total}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Công suất:
                  </span>
                  <span className="font-semibold">{station.power}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Giá:</span>
                  <span className="font-semibold text-green-600">{station.price}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> Đánh giá:
                  </span>
                  <span className="font-semibold">{station.rating} ⭐</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => onViewDetails(station)}
                >
                  Chi tiết
                </Button>
                <Button
                  size="sm"
                  className={`flex-1 ${
                    statusInfo.status === 'available' || statusInfo.status === 'limited'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                  disabled={statusInfo.status === 'full' || statusInfo.status === 'maintenance'}
                  onClick={() => onStationSelect(station)}
                >
                  {statusInfo.status === 'maintenance' ? 'Bảo trì' : 'Đặt chỗ'}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={t.searchStationsPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'map' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('map')}
            className={viewMode === 'map' ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            <Map className="w-4 h-4 mr-2" />
            {t.mapView}
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            className={viewMode === 'list' ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            <List className="w-4 h-4 mr-2" />
            {t.listView}
          </Button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {t.foundStations.replace('{count}', filteredStations.length.toString())}
          {searchQuery && ` for "${searchQuery}"`}
        </p>
        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4 mr-2" />
          {t.filters}
        </Button>
      </div>

      {/* Main Content */}
      {viewMode === 'map' ? renderMapView() : renderListView()}

      {/* No Results */}
      {filteredStations.length === 0 && searchQuery && (
        <div className="text-center py-8">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t.noStationsFound}</h3>
          <p className="text-gray-600 mb-4">
            {t.noStationsFoundDesc}
          </p>
          <Button 
            variant="outline" 
            onClick={() => setSearchQuery('')}
          >
            Clear Search
          </Button>
        </div>
      )}
    </div>
  );
}