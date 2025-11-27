/**
 * ===============================================================
 * LEAFLET MAP COMPONENT (BẢN ĐỒ LEAFLET)
 * ===============================================================
 * Component hiển thị bản đồ tương tác với Leaflet library
 * 
 * Chức năng:
 * - 🗺️ Render bản đồ OpenStreetMap
 * - 📍 Hiển thị markers cho tất cả stations
 * - 🎨 Custom marker colors theo status (xanh/vàng/đỏ/xám)
 * - 💬 Popup khi click marker
 * - 🖱️ Click marker → onStationSelect callback
 * - 🔄 Auto-update markers khi stations thay đổi
 * 
 * Props:
 * - stations: Station[] - Danh sách trạm cần hiển thị
 * - center: [lat, lng] - Tọa độ trung tâm ban đầu
 * - zoom: number - Zoom level ban đầu (1-18)
 * - onStationSelect: (station) => void - Callback khi click marker
 * - onViewDetails: (station) => void - Callback "Xem chi tiết"
 * 
 * Leaflet setup:
 * - Tile layer: OpenStreetMap
 * - Default marker icons: CDN (cloudflare)
 * - Custom markers: Teardrop shape với màu status
 * 
 * Marker colors (dựa vào getStationStatus):
 * - Available (còn nhiều chỗ): Green (#22c55e)
 * - Limited (sắp đầy): Yellow (#eab308)
 * - Full (hết chỗ): Red (#ef4444)
 * - Maintenance: Gray (#9ca3af)
 * 
 * Popup content:
 * - 📌 Tên trạm (bold)
 * - 📍 Địa chỉ
 * - ✅ Số chỗ: {available}/{total}
 * - ⚡ Công suất: {power}kW
 * - 💰 Giá: {price}/kWh
 * - Nút "Đặt chỗ" → onStationSelect
 * - Nút "Xem chi tiết" → onViewDetails
 * 
 * Coordinates handling:
 * - Support cả station.lat/lng VÀ station.latitude/longitude
 * - Handle function getters: latitude() / longitude()
 * - Validate coordinates (skip invalid)
 * 
 * Custom marker design:
 * - Teardrop/pin shape (border-radius 50% 50% 50% 0)
 * - Rotate -45deg
 * - White border (3px)
 * - Box shadow
 * - Inner white dot (rotate back +45deg)
 * 
 * Lifecycle:
 * 1. Mount: Khởi tạo map với center + zoom
 * 2. Add tile layer (OSM)
 * 3. Stations change → Clear old markers → Add new markers
 * 4. Unmount: Cleanup map instance
 * 
 * Refs:
 * - mapRef: L.Map instance (persistent)
 * - mapContainerRef: HTML div container
 * - markersRef: Array of L.Marker (để cleanup)
 * 
 * Dependencies:
 * - Leaflet: Map library
 * - getStationStatus: Util tính status color
 */

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Station } from '../data/mockDatabase';
import { getStationStatus } from '../utils/stationStatus';
import { routingService, RouteResult } from '../services/routingService';

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface LeafletMapProps {
  stations: Station[];
  center: [number, number];
  zoom: number;
  onStationSelect: (station: Station) => void;
  onViewDetails: (station: Station) => void;
  userLocation?: { latitude: number; longitude: number } | null;
  showUserLocation?: boolean;
  selectedStation?: Station | null;
  showRoute?: boolean;
}

export function LeafletMap({ stations, center, zoom, onStationSelect, onViewDetails, userLocation, showUserLocation = true, selectedStation, showRoute = true }: LeafletMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const routeInfoRef = useRef<L.Control | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteResult | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map
    const map = L.map(mapContainerRef.current).setView(center, zoom);
    mapRef.current = map;

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add markers for each station
    stations.forEach((station) => {
      // Get coordinates - handle both lat/lng and latitude/longitude properties
      let lat: number;
      let lng: number;

      if (typeof station.latitude === 'function') {
        lat = station.latitude();
      } else if (typeof station.latitude === 'number') {
        lat = station.latitude;
      } else {
        lat = station.lat;
      }

      if (typeof station.longitude === 'function') {
        lng = station.longitude();
      } else if (typeof station.longitude === 'number') {
        lng = station.longitude;
      } else {
        lng = station.lng;
      }

      // Skip if coordinates are invalid
      if (isNaN(lat) || isNaN(lng)) {
        console.warn(`Invalid coordinates for station ${station.id}:`, { lat, lng });
        return;
      }

      // Get status-based color
      const statusInfo = getStationStatus(station);
      const iconColor = statusInfo.color;
      
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            background-color: ${iconColor};
            width: 32px;
            height: 32px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              transform: rotate(45deg);
              color: white;
              font-size: 18px;
              font-weight: bold;
              margin-top: -2px;
            ">⚡</div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(mapRef.current!);

      // Create popup content
      const popupContent = document.createElement('div');
      popupContent.className = 'space-y-2 min-w-[220px]';
      popupContent.innerHTML = `
        <h4 class="font-semibold text-base">${station.name}</h4>
        <p class="text-sm text-gray-600">${station.address}</p>
        <div class="flex items-center justify-between text-sm">
          <span class="font-medium">${station.available}/${station.total} chỗ trống</span>
          <span class="${statusInfo.bgColor} ${statusInfo.textColor} px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <span>${statusInfo.icon}</span>
            <span>${statusInfo.label}</span>
          </span>
        </div>
        <div class="text-xs text-gray-500 space-y-1">
          <div class="flex justify-between">
            <span>⚡ Công suất:</span>
            <span class="font-medium">${station.power}</span>
          </div>
          <div class="flex justify-between">
            <span>💰 Giá:</span>
            <span class="font-medium">${station.price}</span>
          </div>
        </div>
      `;

      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'flex gap-2 pt-2 border-t';
      
      const detailsBtn = document.createElement('button');
      detailsBtn.textContent = 'Chi tiết';
      detailsBtn.className = 'flex-1 px-3 py-1.5 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors';
      detailsBtn.onclick = () => onViewDetails(station);
      
      const bookBtn = document.createElement('button');
      bookBtn.textContent = statusInfo.status === 'maintenance' ? 'Bảo trì' : 'Đặt chỗ';
      bookBtn.className = `flex-1 px-3 py-1.5 text-sm font-medium text-white rounded-lg transition-colors ${
        statusInfo.status === 'available' || statusInfo.status === 'limited' 
          ? 'bg-green-600 hover:bg-green-700' 
          : 'bg-gray-400 cursor-not-allowed'
      }`;
      bookBtn.disabled = statusInfo.status === 'full' || statusInfo.status === 'maintenance';
      bookBtn.onclick = () => onStationSelect(station);
      
      buttonContainer.appendChild(detailsBtn);
      buttonContainer.appendChild(bookBtn);
      popupContent.appendChild(buttonContainer);

      marker.bindPopup(popupContent);
      markersRef.current.push(marker);
    });

    // Add user location marker
    if (showUserLocation && userLocation && mapRef.current) {
      // Remove old user marker if exists
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
      }

      const userIcon = L.divIcon({
        className: 'user-location-marker',
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
          <style>
            @keyframes pulse {
              0%, 100% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.2); opacity: 0.8; }
            }
          </style>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      const userMarker = L.marker(
        [userLocation.latitude, userLocation.longitude],
        { icon: userIcon }
      ).addTo(mapRef.current);

      const userPopupContent = `
        <div class="text-sm">
          <p class="font-semibold text-blue-600">📍 Vị trí của bạn</p>
          <p class="text-xs text-gray-600 mt-1">
            ${userLocation.latitude.toFixed(6)}, ${userLocation.longitude.toFixed(6)}
          </p>
        </div>
      `;

      userMarker.bindPopup(userPopupContent);
      userMarkerRef.current = userMarker;
    }
  }, [stations, onStationSelect, onViewDetails, userLocation, showUserLocation]);

  // Calculate and display route
  useEffect(() => {
    if (!mapRef.current || !showRoute || !selectedStation || !userLocation) {
      // Clear route if conditions not met
      if (routeLayerRef.current) {
        routeLayerRef.current.remove();
        routeLayerRef.current = null;
      }
      if (routeInfoRef.current) {
        routeInfoRef.current.remove();
        routeInfoRef.current = null;
      }
      setRouteInfo(null);
      return;
    }

    const calculateRoute = async () => {
      try {
        // Get station coordinates
        let stationLat: number, stationLng: number;
        if (typeof selectedStation.latitude === 'function') {
          stationLat = selectedStation.latitude();
        } else if (typeof selectedStation.latitude === 'number') {
          stationLat = selectedStation.latitude;
        } else {
          stationLat = selectedStation.lat;
        }

        if (typeof selectedStation.longitude === 'function') {
          stationLng = selectedStation.longitude();
        } else if (typeof selectedStation.longitude === 'number') {
          stationLng = selectedStation.longitude;
        } else {
          stationLng = selectedStation.lng;
        }

        console.log('🗺️ Calculating route from user to station...');
        const route = await routingService.getRoute(
          { lat: userLocation.latitude, lng: userLocation.longitude },
          { lat: stationLat, lng: stationLng },
          'car'
        );

        if (!route || !mapRef.current) return;

        setRouteInfo(route);

        // Clear old route
        if (routeLayerRef.current) {
          routeLayerRef.current.remove();
        }

        // Draw route polyline
        const routeLine = L.polyline(
          route.geometry.map(p => [p.lat, p.lng]),
          {
            color: '#3b82f6',
            weight: 4,
            opacity: 0.7,
            smoothFactor: 1,
          }
        ).addTo(mapRef.current);

        routeLayerRef.current = routeLine;

        // Fit map to show entire route
        mapRef.current.fitBounds(routeLine.getBounds(), { padding: [50, 50] });

        // Add route info control
        if (routeInfoRef.current) {
          routeInfoRef.current.remove();
        }

        const RouteInfoControl = L.Control.extend({
          onAdd: function() {
            const div = L.DomUtil.create('div', 'route-info-control');
            div.style.cssText = `
              background: white;
              padding: 12px 16px;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.2);
              font-size: 14px;
              min-width: 200px;
            `;
            
            const eta = routingService.getETA(route.durationMin);
            
            div.innerHTML = `
              <div style="font-weight: 600; margin-bottom: 8px; color: #1f2937; display: flex; align-items: center; gap: 6px;">
                <span style="font-size: 18px;">🚗</span>
                <span>Chỉ đường đến trạm</span>
              </div>
              <div style="display: flex; flex-direction: column; gap: 4px; font-size: 13px;">
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280;">📏 Khoảng cách:</span>
                  <span style="font-weight: 600; color: #3b82f6;">${route.distanceText}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280;">⏱️ Thời gian:</span>
                  <span style="font-weight: 600; color: #3b82f6;">${route.durationText}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280;">🕐 Đến lúc:</span>
                  <span style="font-weight: 600; color: #10b981;">${eta}</span>
                </div>
              </div>
            `;
            return div;
          },
        });

        const control = new RouteInfoControl({ position: 'topright' });
        control.addTo(mapRef.current);
        routeInfoRef.current = control;

        console.log('✅ Route displayed:', route);
      } catch (error) {
        console.error('❌ Error calculating route:', error);
      }
    };

    calculateRoute();
  }, [selectedStation, userLocation, showRoute]);

  return (
    <div 
      ref={mapContainerRef} 
      style={{ height: '100%', width: '100%' }}
      className="rounded-lg"
    />
  );
}
