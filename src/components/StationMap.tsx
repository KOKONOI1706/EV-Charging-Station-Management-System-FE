import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MapPin, Battery, Star, Navigation, Map as MapIcon } from 'lucide-react';
import { SupabaseService, Station } from '../services/supabaseService';
import { MapService } from '../services/mapService';

interface StationMapProps {
  onBookStation?: (station: Station) => void;
  onStationBook?: (station: Station) => void;
}

export const StationMap: React.FC<StationMapProps> = ({ onBookStation, onStationBook }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [stations, setStations] = useState<Station[]>([]);
  const [filteredStations, setFilteredStations] = useState<Station[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'occupied' | 'maintenance'>('all');
  const [chargerTypeFilter, setChargerTypeFilter] = useState<'all' | 'fast' | 'ultra_fast' | 'standard'>('all');
  const [sortBy, setSortBy] = useState<'distance' | 'price' | 'rating'>('distance');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [mapInitialized, setMapInitialized] = useState(false);

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
          // Default to Los Angeles if geolocation fails
          setUserLocation({ lat: 34.0522, lng: -118.2437 });
        }
      );
    } else {
      setUserLocation({ lat: 34.0522, lng: -118.2437 });
    }
  }, []);

  // Load stations from Supabase
  useEffect(() => {
    const loadStations = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await SupabaseService.fetchStations();
        
        // Calculate distances if user location is available
        let stationsWithDistance = data;
        if (userLocation) {
          stationsWithDistance = MapService.findNearbyStations(
            userLocation.lat,
            userLocation.lng,
            data,
            50 // 50 mile radius
          );
        }

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
  }, [userLocation]);

  // Initialize map when showing map view
  useEffect(() => {
    if (showMap && mapInitialized && mapRef.current && !MapService.map) {
      const mapId = `map-${Date.now()}`;
      mapRef.current.id = mapId;

      const defaultCenter: [number, number] = userLocation 
        ? [userLocation.lat, userLocation.lng] 
        : [34.0522, -118.2437];

      MapService.initMap(mapId, {
        center: defaultCenter,
        zoom: userLocation ? 12 : 10,
        maxZoom: 18,
        minZoom: 8
      });

      // Add user location marker if available
      if (userLocation) {
        MapService.addUserLocationMarker(userLocation.lat, userLocation.lng);
      }

      // Setup global station selection callback
      (window as any).selectStation = (stationId: string) => {
        const station = stations.find(s => s.id === stationId);
        if (station && (onBookStation || onStationBook)) {
          (onBookStation || onStationBook)?.(station);
        }
      };

      // Add stations to map
      if (filteredStations.length > 0) {
        MapService.addStationsToMap(filteredStations, (station) => {
          (onBookStation || onStationBook)?.(station);
        });
      }
    }

    return () => {
      if (!showMap) {
        MapService.destroyMap();
      }
    };
  }, [showMap, mapInitialized, filteredStations, userLocation, onBookStation, onStationBook]);

  // Filter and sort stations
  useEffect(() => {
    let filtered = stations.filter(station => {
      // Search filter
      const matchesSearch = searchQuery === '' || 
        station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        station.address.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const matchesStatus = statusFilter === 'all' || station.status === statusFilter;

      // Charger type filter - using charger_type from Supabase
      const chargerType = station.charger_type?.toLowerCase();
      const matchesChargerType = chargerTypeFilter === 'all' || 
        chargerType?.includes(chargerTypeFilter.replace('_', ' '));

      return matchesSearch && matchesStatus && matchesChargerType;
    });

    // Sort stations
    filtered.sort((a, b) => {
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

    // Update map if showing
    if (showMap && mapInitialized) {
      MapService.addStationsToMap(filtered, (station) => {
        (onBookStation || onStationBook)?.(station);
      });
    }
  }, [stations, searchQuery, statusFilter, chargerTypeFilter, sortBy, showMap, mapInitialized, onBookStation, onStationBook]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'occupied': return 'bg-yellow-100 text-yellow-800';
      case 'maintenance': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
      const location = await MapService.getCurrentLocation();
      setUserLocation(location);
      
      if (showMap && mapInitialized) {
        MapService.addUserLocationMarker(location.lat, location.lng);
        MapService.setView(location.lat, location.lng, 12);
      }
      
      // Find nearby stations
      const nearbyStations = MapService.findNearbyStations(
        location.lat,
        location.lng,
        stations,
        10 // 10 mile radius
      );
      
      setFilteredStations(nearbyStations);
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
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="maintenance">Maintenance</option>
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
                        <Badge className={getStatusColor(station.status)}>
                          {station.status}
                        </Badge>
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
                        onClick={() => (onBookStation || onStationBook)?.(station)}
                        disabled={station.status !== 'active' || station.available_spots === 0}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {station.status === 'active' && station.available_spots > 0
                          ? 'Book Now'
                          : station.status === 'maintenance'
                          ? 'Maintenance'
                          : station.status === 'offline'
                          ? 'Offline'
                          : 'Fully Booked'
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