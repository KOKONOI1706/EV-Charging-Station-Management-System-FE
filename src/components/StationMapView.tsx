import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MapPin, Battery, Star, Navigation, Map as MapIcon, RefreshCw } from 'lucide-react';
import { SupabaseService, Station } from '../services/supabaseService';
import { StationStatusService } from '../services/stationStatusService';

interface StationMapViewProps {
  onStationSelect: (station: Station) => void;
  onViewDetails?: (station: Station) => void;
  stations?: Station[]; // Allow external stations to be passed in
  selectedStation?: Station | null;
  userLocation?: { lat: number; lng: number } | null;
}

export function StationMapView({ onStationSelect, onViewDetails, stations: externalStations, selectedStation: externalSelectedStation, userLocation: externalUserLocation }: StationMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [stations, setStations] = useState<Station[]>([]);
  const [filteredStations, setFilteredStations] = useState<Station[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'maintenance' | 'offline'>('all');
  const [chargerTypeFilter, setChargerTypeFilter] = useState<'all' | 'fast' | 'ultra_fast' | 'standard'>('all');
  const [sortBy, setSortBy] = useState<'distance' | 'price' | 'rating'>('distance');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showMap, setShowMap] = useState(true); // Auto show map
  const [mapInitialized, setMapInitialized] = useState(false);
  const [userVehicleType, setUserVehicleType] = useState<string>('Tesla Model 3');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

  // Load Leaflet script
  useEffect(() => {
    const loadLeafletScript = async () => {
      if (!(window as any).L) {
        // Load Leaflet CSS
        const linkElement = document.createElement('link');
        linkElement.rel = 'stylesheet';
        linkElement.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        linkElement.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
        linkElement.crossOrigin = '';
        document.head.appendChild(linkElement);

        // Load Leaflet JS
        const scriptElement = document.createElement('script');
        scriptElement.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        scriptElement.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
        scriptElement.crossOrigin = '';
        
        return new Promise<void>((resolve, reject) => {
          scriptElement.onload = () => resolve();
          scriptElement.onerror = () => reject(new Error('Failed to load Leaflet'));
          document.head.appendChild(scriptElement);
        });
      }
    };

    loadLeafletScript()
      .then(() => {
        setMapInitialized(true);
      })
      .catch((err) => {
        console.error('Failed to load map library:', err);
      });
  }, []);

  // Get user location
  useEffect(() => {
    // Use external location if provided, otherwise get user location
    if (externalUserLocation) {
      setUserLocation(externalUserLocation);
      return;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.warn('Error getting location:', error);
          // Default to Thủ Đức, TP.HCM if geolocation fails
          setUserLocation({ lat: 10.8515, lng: 106.7717 });
        }
      );
    } else {
      setUserLocation({ lat: 10.8515, lng: 106.7717 }); // Thủ Đức, TP.HCM
    }
  }, [externalUserLocation]);

  // Load stations from Supabase or use external stations
  useEffect(() => {
    // Use external stations if provided
    if (externalStations) {
      console.log(`🇻🇳 StationMapView received ${externalStations.length} external stations:`, externalStations.map(s => ({ name: s.name, lat: s.lat, lng: s.lng })));
      setStations(externalStations);
      setFilteredStations(externalStations); // Set filteredStations too!
      setIsLoading(false);
      return;
    }

    console.log('📡 No external stations provided, loading from Supabase...');
    const loadStations = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await SupabaseService.fetchStations();
        
        // Calculate distances if user location is available
        let stationsWithDistance = data;
        // Note: Distance calculation would go here if needed

        console.log(`📡 Loaded ${data.length} stations from Supabase`);
        setStations(stationsWithDistance);
        setFilteredStations(stationsWithDistance);
      } catch (err) {
        console.error('Error loading stations:', err);
        setError('Failed to load charging stations. Please try again.');
        setStations([]);
        setFilteredStations([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadStations();
  }, [externalStations]);

  // Initialize map when showing map view
  useEffect(() => {
    console.log(`🗺️ Map init check: showMap=${showMap}, mapInitialized=${mapInitialized}, mapRef=${!!mapRef.current}`);
    
    if (showMap && mapInitialized && mapRef.current) {
      console.log('🗺️ Starting map initialization with Vietnam stations...');
      
      // Clean up any existing map instance first
      if ((mapRef.current as any)._leaflet_id) {
        console.log('🗺️ Cleaning up existing map instance');
        const L = (window as any).L;
        if (L && (mapRef.current as any)._leaflet_map) {
          (mapRef.current as any)._leaflet_map.remove();
        }
        (mapRef.current as any)._leaflet_id = null;
        (mapRef.current as any)._leaflet_map = null;
        mapRef.current.innerHTML = '';
      }
      
      const mapId = `map-${Date.now()}`;
      mapRef.current.id = mapId;

      const defaultCenter: [number, number] = userLocation 
        ? [userLocation.lat, userLocation.lng] 
        : [10.8515, 106.7717]; // Thủ Đức default center

      console.log(`🗺️ Map center: [${defaultCenter[0]}, ${defaultCenter[1]}]`);

      const L = (window as any).L;
      
      try {
        const map = L.map(mapId).setView(defaultCenter, 11); // Start with zoom 11 for Vietnam region
        
        // Store map reference for cleanup
        (mapRef.current as any)._leaflet_map = map;

        console.log('🗺️ Map instance created, adding tile layer...');

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 18,
          minZoom: 8
        }).addTo(map);

        console.log('🗺️ Tile layer added successfully');

        // Add user location marker if available
        if (userLocation) {
          console.log(`🧭 Adding user location marker at [${userLocation.lat}, ${userLocation.lng}]`);
          const userIcon = L.divIcon({
            html: '<div style="background-color: blue; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
            className: 'user-location-icon',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          });
          L.marker([userLocation.lat, userLocation.lng], { icon: userIcon }).addTo(map);
        }

        // Setup global station selection callback
        (window as any).selectStation = (stationId: string) => {
          const station = stations.find(s => s.id === stationId);
          if (station) {
            onStationSelect(station);
          }
        };

        // Add stations to map
        if (filteredStations.length > 0) {
          console.log(`🗺️ Adding ${filteredStations.length} stations to map:`, filteredStations.map(s => s.name));
          addStationsToLocalMap(map, filteredStations);
        } else {
          console.warn('⚠️ No filtered stations to display on map');
          console.log('📊 Available stations:', stations.length);
          console.log('📊 Filtered stations:', filteredStations.length);
        }
      } catch (error) {
        console.error('❌ Error initializing map:', error);
      }
    }
  }, [showMap, mapInitialized, filteredStations, userLocation, onStationSelect]);

  const addStationsToLocalMap = (map: any, stationsToAdd: Station[]) => {
    const L = (window as any).L;

    stationsToAdd.forEach((station) => {
      // Sử dụng service mới để xác định màu và trạng thái
      const statusInfo = StationStatusService.getStationDisplayStatus(station, userVehicleType);
      
      // Tạo marker HTML với màu sắc động
      const markerHTML = StationStatusService.createStationMarkerHTML(station, userVehicleType);
      
      const customIcon = L.divIcon({
        html: markerHTML,
        className: 'custom-station-marker',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      const marker = L.marker([station.lat, station.lng], { icon: customIcon })
        .addTo(map);

      // Sử dụng popup content nâng cao
      const popupContent = StationStatusService.createStationPopupContent(station, userVehicleType);
      marker.bindPopup(popupContent, {
        maxWidth: 320,
        className: 'custom-station-popup'
      });

      // Thêm tooltip hiển thị nhanh khi hover
      marker.bindTooltip(`
        <div style="text-align: center;">
          <strong>${station.name}</strong><br>
          <span style="color: ${statusInfo.color};">${statusInfo.statusText}</span><br>
          ${station.available_spots}/${station.total_spots} chỗ
        </div>
      `, {
        direction: 'top',
        offset: [0, -10]
      });
    });

    // Fit map to show all stations with appropriate zoom for Vietnam region
    if (stationsToAdd.length > 0) {
      console.log(`🗺️ Fitting bounds for ${stationsToAdd.length} stations in Vietnam region`);
      
      const markers = stationsToAdd.map(station => {
        console.log(`📍 Station: ${station.name} at [${station.lat}, ${station.lng}]`);
        return L.marker([station.lat, station.lng]);
      });
      
      const group = new L.featureGroup(markers);
      const bounds = group.getBounds();
      
      console.log('🌏 Calculated bounds:', bounds);
      
      if (bounds.isValid()) {
        // For Vietnam region, center on Thủ Đức with appropriate zoom
        const center = bounds.getCenter();
        console.log('📍 Bounds center:', center);
        
        // Use padding for better view, but ensure we stay focused on Vietnam
        map.fitBounds(bounds, { 
          padding: [20, 20],
          maxZoom: 11  // Prevent zooming too close 
        });
        
        console.log(`🔍 Map zoom after fitBounds: ${map.getZoom()}`);
        
        // Ensure minimum zoom for Vietnam region visibility
        if (map.getZoom() > 11) {
          map.setZoom(11);
          console.log('🔍 Adjusted zoom to 11 for better Vietnam view');
        }
      } else {
        console.warn('❌ Invalid bounds, using fallback center');
        // Fallback to Thủ Đức center
        map.setView([10.8515, 106.7717], 11);
      }
    } else {
      console.log('📍 No stations, centering on Thủ Đức');
      // No stations, center on Thủ Đức with good zoom
      map.setView([10.8515, 106.7717], 11);
    }
  };

  // Filter and sort stations
  useEffect(() => {
    console.log(`🔍 StationMapView filtering: searchQuery="${searchQuery}", statusFilter="${statusFilter}", chargerTypeFilter="${chargerTypeFilter}"`);
    console.log(`📊 Input stations:`, stations.length);
    
    // Simplified filtering - just show all stations for now
    let filtered = stations;
    
    console.log(`🔍 Simplified: showing all ${filtered.length} stations for debugging`);
    filtered.forEach(station => {
      console.log(`� Station: ${station.name} - Status: ${station.status} - Type: ${station.charger_type}`);
    });

    // Sort stations với ưu tiên trạng thái
    filtered.sort((a, b) => {
      // Ưu tiên theo trạng thái trước
      const aStatus = StationStatusService.getStationDisplayStatus(a, userVehicleType);
      const bStatus = StationStatusService.getStationDisplayStatus(b, userVehicleType);
      
      if (aStatus.priority !== bStatus.priority) {
        return aStatus.priority - bStatus.priority;
      }

      // Sau đó sort theo tiêu chí được chọn
      switch (sortBy) {
        case 'distance':
          const aDistance = parseFloat(a.distance?.replace(' mi', '') || '0');
          const bDistance = parseFloat(b.distance?.replace(' mi', '') || '0');
          return aDistance - bDistance;
        case 'price':
          return a.price_per_kwh - b.price_per_kwh;
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

    setFilteredStations(filtered);
  }, [stations, searchQuery, statusFilter, chargerTypeFilter, sortBy, userVehicleType]);

  const getStationStatusBadge = (station: Station) => {
    const statusInfo = StationStatusService.getStationDisplayStatus(station, userVehicleType);
    return (
      <Badge style={{ 
        backgroundColor: statusInfo.color + '20', 
        color: statusInfo.color,
        border: `1px solid ${statusInfo.color}`
      }}>
        {statusInfo.statusText}
      </Badge>
    );
  };

  const getStationAvailabilityText = (station: Station) => {
    const statusInfo = StationStatusService.getStationDisplayStatus(station, userVehicleType);
    return statusInfo.description;
  };

  const getChargerTypeIcon = (type: string) => {
    if (type?.toLowerCase().includes('ultra')) return '⚡⚡⚡';
    if (type?.toLowerCase().includes('fast')) return '⚡⚡';
    return '⚡';
  };

  const getChargerTypeName = (type: string) => {
    if (!type) return 'Standard';
    return type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
  };

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      try {
        setIsLoading(true);
        const searchResults = await SupabaseService.searchStations(searchQuery);
        setStations(searchResults);
      } catch (err) {
        console.error('Search failed:', err);
        setError('Search failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getCurrentLocation = async () => {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      
      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      
      setUserLocation(location);
      
      // Note: Map update logic would go here if needed
      
      // Note: Finding nearby stations logic would go here if needed
      setFilteredStations(stations);
    } catch (error) {
      console.error('Error getting location:', error);
      setError('Unable to get your location');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        <span className="ml-3 text-gray-600">Loading charging stations...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-red-600 mb-4">{error}</div>
        <Button onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Charging Stations</h2>
        <div className="flex space-x-2">
          <Button
            variant={!showMap ? "default" : "outline"}
            onClick={() => setShowMap(false)}
          >
            List View
          </Button>
          <Button
            variant={showMap ? "default" : "outline"}
            onClick={() => setShowMap(true)}
            disabled={!mapInitialized}
          >
            <MapIcon className="h-4 w-4 mr-2" />
            Map View
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="flex space-x-2">
          <Input
            placeholder="Search stations by name or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch}>
            <Navigation className="h-4 w-4 mr-2" />
            Search
          </Button>
          <Button onClick={getCurrentLocation}>
            📍 Near Me
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-1 border rounded-md text-sm"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
              <option value="offline">Offline</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">Charger:</label>
            <select
              value={chargerTypeFilter}
              onChange={(e) => setChargerTypeFilter(e.target.value as any)}
              className="px-3 py-1 border rounded-md text-sm"
            >
              <option value="all">All Types</option>
              <option value="standard">Standard</option>
              <option value="fast">Fast</option>
              <option value="ultra_fast">Ultra Fast</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1 border rounded-md text-sm"
            >
              <option value="distance">Distance</option>
              <option value="price">Price</option>
              <option value="rating">Rating</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Found {filteredStations.length} charging station{filteredStations.length !== 1 ? 's' : ''}
      </div>

      {/* Map View */}
      {showMap && (
        <Card>
          <CardContent className="p-0">
            <div 
              ref={mapRef}
              className="w-full h-96 rounded-lg"
              style={{ minHeight: '400px' }}
            />
          </CardContent>
        </Card>
      )}

      {/* Station List */}
      {!showMap && (
        <div className="grid gap-4">
          {filteredStations.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-gray-500 mb-4">
                  <MapPin className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No charging stations found</p>
                  <p className="text-sm">Try adjusting your search criteria</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredStations.map((station) => (
              <Card key={station.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-lg">{station.name}</h3>
                        {getStationStatusBadge(station)}
                      </div>
                      
                      <div className="flex items-center text-gray-600 mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="text-sm">{station.address}</span>
                        {station.distance && (
                          <span className="ml-2 text-sm">• {station.distance} away</span>
                        )}
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Battery className="h-4 w-4 mr-1" />
                          <span>{station.available_spots}/{station.total_spots} spots</span>
                        </div>
                        
                        <div className="flex items-center">
                          <Star className="h-4 w-4 mr-1 text-yellow-500" />
                          <span>{station.rating.toFixed(1)}</span>
                        </div>
                        
                        <div className="flex items-center">
                          <span className="text-lg">{getChargerTypeIcon(station.charger_type)}</span>
                          <span className="ml-1">{getChargerTypeName(station.charger_type)}</span>
                        </div>
                      </div>

                      {station.amenities && station.amenities.length > 0 && (
                        <div className="mt-3">
                          <div className="flex flex-wrap gap-1">
                            {station.amenities.map((amenity, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {amenity}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="text-right ml-4">
                      <div className="text-2xl font-bold text-green-600 mb-2">
                        ${station.price_per_kwh}/kWh
                      </div>
                      <Button
                        onClick={() => onViewDetails && onViewDetails(station)}
                        variant="outline"
                        size="sm"
                      >
                        Details
                      </Button>
                      <Button
                        onClick={() => onStationSelect(station)}
                        disabled={station.status === 'maintenance' || station.status === 'offline' || station.available_spots === 0}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {station.status === 'active' && station.available_spots > 0
                          ? 'Select Station'
                          : station.available_spots === 0
                          ? 'Fully Booked'
                          : 'Unavailable'
                        }
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};