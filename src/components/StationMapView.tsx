import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { 
  MapPin, 
  Search, 
  Navigation, 
  Zap, 
  Clock, 
  Star,
  Filter,
  List,
  Map
} from 'lucide-react';
import { Station, MockDatabaseService } from '../data/mockDatabase';
import { useLanguage } from '../hooks/useLanguage';

interface StationMapViewProps {
  onStationSelect: (station: Station) => void;
  onViewDetails: (station: Station) => void;
}

export function StationMapView({ onStationSelect, onViewDetails }: StationMapViewProps) {
  const { t } = useLanguage();
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
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

  const getStatusColor = (available: number, total: number) => {
    const ratio = available / total;
    if (ratio > 0.5) return 'bg-green-500';
    if (ratio > 0.2) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const renderMapView = () => (
    <div className="relative">
      {/* Simulated Map Container */}
      <div className="w-full h-96 bg-gray-100 rounded-lg relative overflow-hidden border">
        {/* Map Background Grid */}
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#gray" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Map Legend */}
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-md p-3 z-10">
          <h4 className="font-medium mb-2">Station Status</h4>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Available (50%+)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>Limited (20-50%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Busy (&lt;20%)</span>
            </div>
          </div>
        </div>

        {/* Station Markers */}
        {filteredStations.map((station, index) => {
          const x = 20 + (index % 3) * 120 + Math.random() * 60;
          const y = 50 + Math.floor(index / 3) * 80 + Math.random() * 40;
          
          return (
            <div
              key={station.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 hover:scale-110 ${
                selectedStation?.id === station.id ? 'z-20 scale-110' : 'z-10'
              }`}
              style={{ left: `${x}px`, top: `${y}px` }}
              onClick={() => setSelectedStation(station)}
            >
              {/* Station Marker */}
              <div className={`w-6 h-6 rounded-full border-2 border-white shadow-lg ${
                getStatusColor(station.available, station.total)
              }`}>
                <MapPin className="w-full h-full text-white p-1" />
              </div>
              
              {/* Station Label */}
              <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow-md text-xs font-medium whitespace-nowrap">
                {station.name}
              </div>

              {/* Expanded Info for Selected Station */}
              {selectedStation?.id === station.id && (
                <div className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-3 min-w-64 z-30">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{station.name}</h4>
                      <Badge className={
                        station.available > 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }>
                        {station.available}/{station.total} available
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{station.address}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Zap className="w-4 h-4 text-green-600" />
                        <span>{station.power}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span>{station.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Navigation className="w-4 h-4 text-blue-600" />
                        <span>{station.distance}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        onClick={() => onViewDetails(station)}
                        className="flex-1"
                      >
                        View Layout
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => onStationSelect(station)}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        Book Now
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Current Location Marker */}
        <div className="absolute bottom-4 right-4 bg-blue-600 rounded-full p-2 shadow-lg">
          <Navigation className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );

  const renderListView = () => (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredStations.map((station) => (
        <Card key={station.id} className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">{station.name}</h3>
              <Badge className={
                station.available > 0 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }>
                {station.available}/{station.total}
              </Badge>
            </div>
            
            <p className="text-sm text-gray-600 mb-3">{station.address}</p>
            
            <div className="grid grid-cols-2 gap-2 text-sm mb-4">
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-green-600" />
                <span>{station.power}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>{station.rating}</span>
              </div>
              <div className="flex items-center gap-1">
                <Navigation className="w-4 h-4 text-blue-600" />
                <span>{station.distance}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-purple-600" />
                <span>{station.operatingHours}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onViewDetails(station)}
                className="flex-1"
              >
                View Layout
              </Button>
              <Button 
                size="sm" 
                onClick={() => onStationSelect(station)}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Book Now
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
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
            placeholder="Search stations by name or location..."
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
            Map View
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            className={viewMode === 'list' ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            <List className="w-4 h-4 mr-2" />
            List View
          </Button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Found {filteredStations.length} charging station{filteredStations.length !== 1 ? 's' : ''}
          {searchQuery && ` for "${searchQuery}"`}
        </p>
        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Main Content */}
      {viewMode === 'map' ? renderMapView() : renderListView()}

      {/* No Results */}
      {filteredStations.length === 0 && searchQuery && (
        <div className="text-center py-8">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No stations found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search terms or clearing the search to see all stations.
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