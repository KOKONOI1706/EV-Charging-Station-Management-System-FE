/**
 * ===============================================================
 * STATION MAP - Bản đồ hiển thị vị trí trạm sạc
 * ===============================================================
 * Component hiển thị trạm sạc trên bản đồ OpenStreetMap sử dụng Leaflet
 * 
 * Features:
 * - 🗺️ Hiển thị vị trí trạm trên bản đồ
 * - 📍 Marker cho từng trạm
 * - 🎯 Marker đặc biệt cho vị trí user
 * - 🔍 Zoom in/out
 * - 📏 Hiển thị khoảng cách
 * - 🎨 Popup thông tin trạm
 * - 📱 Responsive
 * 
 * Props:
 * - stations: Danh sách trạm cần hiển thị
 * - selectedStation: Trạm đang được chọn (highlight)
 * - userLocation: Vị trí hiện tại của user
 * - onStationClick: Callback khi click vào marker
 * - height: Chiều cao của map (default: 400px)
 * - zoom: Mức zoom mặc định (default: 13)
 * - showUserLocation: Hiển thị vị trí user hay không
 */

import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { routingService, RouteResult } from '../services/routingService';

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface Station {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address?: string;
  price_per_kwh?: number;
  distance_km?: number;
  available_points?: number;
}

interface UserLocation {
  latitude: number;
  longitude: number;
}

interface StationMapProps {
  stations: Station[];
  selectedStation?: Station | null;
  userLocation?: UserLocation | null;
  onStationClick?: (station: Station) => void;
  height?: string;
  zoom?: number;
  showUserLocation?: boolean;
  showRoute?: boolean;
}

// Custom marker icons
const createCustomIcon = (color: string, isSelected: boolean = false) => {
  const size = isSelected ? 35 : 25;
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 3px 10px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          font-size: ${isSelected ? '18px' : '14px'};
          font-weight: bold;
        ">⚡</div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
};

const userLocationIcon = L.divIcon({
  className: 'user-marker',
  html: `
    <div style="
      background-color: #3b82f6;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
      animation: pulse 2s infinite;
    "></div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// Component to handle map view updates
function MapViewController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  
  return null;
}

// Component to display route info
function RouteInfo({ route }: { route: RouteResult }) {
  const eta = routingService.getETA(route.durationMin);
  
  return (
    <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 z-[9999] min-w-[200px]">
      <div className="font-semibold mb-2 text-gray-900 flex items-center gap-2">
        <span className="text-lg">🚗</span>
        <span className="text-sm">Chỉ đường</span>
      </div>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">📏 Khoảng cách:</span>
          <span className="font-semibold text-blue-600">{route.distanceText}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">⏱️ Thời gian:</span>
          <span className="font-semibold text-blue-600">{route.durationText}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">🕐 Đến lúc:</span>
          <span className="font-semibold text-green-600">{eta}</span>
        </div>
      </div>
    </div>
  );
}

export function StationMap({
  stations,
  selectedStation,
  userLocation,
  onStationClick,
  height = '400px',
  zoom = 13,
  showUserLocation = true,
  showRoute = true,
}: StationMapProps) {
  const mapRef = useRef<any>(null);
  const [routeInfo, setRouteInfo] = useState<RouteResult | null>(null);
  const [routeGeometry, setRouteGeometry] = useState<Array<[number, number]>>([]);

  // Calculate route when station is selected
  useEffect(() => {
    if (!showRoute || !selectedStation || !userLocation) {
      setRouteInfo(null);
      setRouteGeometry([]);
      return;
    }

    const calculateRoute = async () => {
      try {
        const route = await routingService.getRoute(
          { lat: userLocation.latitude, lng: userLocation.longitude },
          { lat: selectedStation.lat, lng: selectedStation.lng },
          'car'
        );

        if (route) {
          setRouteInfo(route);
          setRouteGeometry(route.geometry.map(p => [p.lat, p.lng]));
          console.log('✅ Route calculated:', route);
        }
      } catch (error) {
        console.error('❌ Error calculating route:', error);
      }
    };

    calculateRoute();
  }, [selectedStation, userLocation, showRoute]);

  // Calculate center position
  const getCenter = (): [number, number] => {
    if (selectedStation) {
      return [selectedStation.lat, selectedStation.lng];
    }
    if (userLocation) {
      return [userLocation.latitude, userLocation.longitude];
    }
    if (stations.length > 0) {
      return [stations[0].lat, stations[0].lng];
    }
    // Default to Ho Chi Minh City
    return [10.762622, 106.660172];
  };

  // Calculate bounds to fit all stations
  const fitBounds = () => {
    if (mapRef.current && stations.length > 0) {
      const bounds = L.latLngBounds(
        stations.map(s => [s.lat, s.lng] as [number, number])
      );
      if (userLocation && showUserLocation) {
        bounds.extend([userLocation.latitude, userLocation.longitude]);
      }
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  };

  useEffect(() => {
    // Fit bounds when stations change
    const timer = setTimeout(fitBounds, 100);
    return () => clearTimeout(timer);
  }, [stations, userLocation]);

  return (
    <div style={{ height, width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
      <style>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.8;
          }
        }
        .leaflet-container {
          height: 100%;
          width: 100%;
        }
      `}</style>
      
      <MapContainer
        center={getCenter()}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapViewController center={getCenter()} zoom={zoom} />

        {/* Route polyline */}
        {routeGeometry.length > 0 && (
          <Polyline
            positions={routeGeometry}
            pathOptions={{
              color: '#3b82f6',
              weight: 4,
              opacity: 0.7,
            }}
          />
        )}

        {/* User location marker */}
        {showUserLocation && userLocation && (
          <Marker
            position={[userLocation.latitude, userLocation.longitude]}
            icon={userLocationIcon}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold text-blue-600">📍 Vị trí của bạn</p>
                <p className="text-xs text-gray-600 mt-1">
                  {userLocation.latitude.toFixed(6)}, {userLocation.longitude.toFixed(6)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Station markers */}
        {stations.map((station) => {
          const isSelected = selectedStation?.id === station.id;
          const markerColor = isSelected ? '#10b981' : station.available_points && station.available_points > 0 ? '#3b82f6' : '#ef4444';
          
          return (
            <Marker
              key={station.id}
              position={[station.lat, station.lng]}
              icon={createCustomIcon(markerColor, isSelected)}
              eventHandlers={{
                click: () => onStationClick?.(station),
              }}
            >
              <Popup>
                <div className="text-sm min-w-[200px]">
                  <p className="font-semibold text-gray-800 mb-2">
                    {isSelected && '✅ '}
                    {station.name}
                  </p>
                  
                  {station.address && (
                    <p className="text-xs text-gray-600 mb-2">
                      📍 {station.address}
                    </p>
                  )}
                  
                  <div className="space-y-1 text-xs">
                    {station.price_per_kwh && (
                      <p className="text-gray-700">
                        💵 {station.price_per_kwh.toLocaleString()} đ/kWh
                      </p>
                    )}
                    
                    {station.available_points !== undefined && (
                      <p className={station.available_points > 0 ? 'text-green-600' : 'text-red-600'}>
                        ⚡ {station.available_points > 0 
                          ? `${station.available_points} điểm sạc khả dụng` 
                          : 'Không có điểm sạc khả dụng'}
                      </p>
                    )}
                    
                    {station.distance_km !== undefined && (
                      <p className="text-blue-600">
                        📏 Cách bạn: {station.distance_km < 1 
                          ? `${(station.distance_km * 1000).toFixed(0)} m` 
                          : `${station.distance_km.toFixed(1)} km`}
                      </p>
                    )}
                  </div>
                  
                  <button
                    onClick={() => onStationClick?.(station)}
                    className="mt-3 w-full bg-blue-600 text-white text-xs py-1.5 px-3 rounded hover:bg-blue-700"
                  >
                    {isSelected ? 'Đã chọn ✓' : 'Chọn trạm này'}
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Route Info Panel */}
      {routeInfo && <RouteInfo route={routeInfo} />}
    </div>
  );
}
