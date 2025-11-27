/**
 * ===============================================================
 * NEARBY STATIONS PAGE - Trang tìm trạm gần với bản đồ
 * ===============================================================
 * Trang hiển thị trạm sạc gần user với bản đồ tương tác
 * 
 * Features:
 * - 📍 Tự động lấy vị trí user
 * - 🗺️ Hiển thị trạm trên Google Maps (OpenStreetMap)
 * - 📏 Tính khoảng cách đến mỗi trạm
 * - 🎯 Sắp xếp theo khoảng cách
 * - 🔄 Refresh location
 * - ⚙️ Điều chỉnh bán kính tìm kiếm
 * - 📱 Click marker để xem chi tiết
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Settings, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { fetchStations, fetchStationsWithLocation } from '../api/stationApi';
import { locationService } from '../services/locationService';
import { StationMap } from '../components/StationMap';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';

export function NearbyStationsPage() {
  const navigate = useNavigate();
  const [stations, setStations] = useState<any[]>([]);
  const [selectedStation, setSelectedStation] = useState<any | null>(null);
  const [userLocation, setUserLocation] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [radiusKm, setRadiusKm] = useState(10);
  const [useBackendCalculation, setUseBackendCalculation] = useState(true);

  // Load stations on mount
  useEffect(() => {
    loadStations();
  }, [radiusKm, useBackendCalculation]);

  const loadStations = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get user location
      const location = await locationService.getCurrentLocation();
      setUserLocation(location);
      console.log('📍 User location:', location);

      let stationsData: any[];

      if (useBackendCalculation) {
        // Backend calculates distance
        stationsData = await fetchStationsWithLocation(
          location.latitude,
          location.longitude,
          radiusKm
        );
      } else {
        // Frontend calculates distance
        const allStations = await fetchStations();
        stationsData = await locationService.filterStationsByRadius(
          allStations,
          radiusKm
        );
      }

      setStations(stationsData);
      console.log('✅ Loaded stations:', stationsData.length);

      // Auto-select nearest station
      if (stationsData.length > 0) {
        setSelectedStation(stationsData[0]);
      }
    } catch (err: any) {
      console.error('❌ Error loading stations:', err);
      setError(err.message || 'Không thể tải danh sách trạm');
    } finally {
      setLoading(false);
    }
  };

  const handleStationClick = (station: any) => {
    setSelectedStation(station);
  };

  const handleViewDetails = (station: any) => {
    navigate(`/station/${station.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-blue-600" />
                Trạm sạc gần bạn
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Tìm trạm sạc gần vị trí hiện tại của bạn
              </p>
            </div>
            <Button
              onClick={() => navigate('/')}
              variant="outline"
            >
              ← Về trang chủ
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Settings Bar */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Bán kính:</span>
                <select
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(Number(e.target.value))}
                  className="border rounded px-3 py-1 text-sm"
                >
                  <option value={5}>5 km</option>
                  <option value={10}>10 km</option>
                  <option value={20}>20 km</option>
                  <option value={50}>50 km</option>
                  <option value={100}>100 km</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="useBackend"
                  checked={useBackendCalculation}
                  onChange={(e) => setUseBackendCalculation(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="useBackend" className="text-sm text-gray-700">
                  Dùng Backend tính
                </label>
              </div>

              <Button
                onClick={loadStations}
                variant="outline"
                size="sm"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Làm mới
              </Button>

              <div className="ml-auto text-sm text-gray-600">
                {stations.length} trạm
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-4 border-red-500 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <Card>
            <CardContent className="p-12 text-center">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Đang tìm trạm gần bạn...</p>
            </CardContent>
          </Card>
        )}

        {/* Content */}
        {!loading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Map */}
            <Card className="lg:sticky lg:top-4 h-fit">
              <CardHeader>
                <CardTitle className="text-lg">
                  🗺️ Bản đồ trạm sạc
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StationMap
                  stations={stations.map(s => ({
                    id: s.id,
                    name: s.name,
                    lat: s.lat,
                    lng: s.lng,
                    address: s.address,
                    price_per_kwh: s.price_per_kwh,
                    available_points: s.available,
                    distance_km: s.distance_km,
                  }))}
                  selectedStation={selectedStation ? {
                    id: selectedStation.id,
                    name: selectedStation.name,
                    lat: selectedStation.lat,
                    lng: selectedStation.lng,
                    address: selectedStation.address,
                    price_per_kwh: selectedStation.price_per_kwh,
                    available_points: selectedStation.available,
                    distance_km: selectedStation.distance_km,
                  } : null}
                  userLocation={userLocation}
                  onStationClick={handleStationClick}
                  height="500px"
                  zoom={13}
                  showUserLocation={!!userLocation}
                />

                {/* User Location Info */}
                {userLocation && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg text-sm">
                    <p className="font-medium text-blue-900">📍 Vị trí của bạn:</p>
                    <p className="text-blue-700 text-xs mt-1">
                      {userLocation.latitude.toFixed(6)}, {userLocation.longitude.toFixed(6)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Station List */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-900">
                📋 Danh sách trạm ({stations.length})
              </h2>

              {stations.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">
                      Không tìm thấy trạm nào trong bán kính {radiusKm} km
                    </p>
                    <Button
                      onClick={() => setRadiusKm(radiusKm * 2)}
                      variant="outline"
                      className="mt-3"
                    >
                      Mở rộng bán kính
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                stations.map((station, idx) => (
                  <Card
                    key={station.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedStation?.id === station.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => handleStationClick(station)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">
                              {idx + 1}. {station.name}
                            </h3>
                            {idx === 0 && (
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                🏅 Gần nhất
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            📍 {station.address}
                          </p>
                        </div>
                        
                        {station.distance_km !== undefined && (
                          <Badge className="bg-blue-100 text-blue-800 ml-2">
                            📏 {station.distance_km < 1
                              ? `${(station.distance_km * 1000).toFixed(0)} m`
                              : `${station.distance_km.toFixed(1)} km`}
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-sm mt-3">
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500">⚡</span>
                          <span className="text-gray-700">{station.power || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500">💵</span>
                          <span className="text-gray-700">
                            {station.price_per_kwh?.toLocaleString() || station.price || 'N/A'} đ/kWh
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className={station.available > 0 ? 'text-green-600' : 'text-red-600'}>
                            🔌
                          </span>
                          <span className="text-gray-700">
                            {station.available}/{station.total}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 flex gap-2">
                        <Button
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            handleViewDetails(station);
                          }}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          Xem chi tiết
                        </Button>
                        <Button
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            window.open(
                              `https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}`,
                              '_blank'
                            );
                          }}
                          size="sm"
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                          🧭 Chỉ đường
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
