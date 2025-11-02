import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Station } from '../data/mockDatabase';
import { getStationStatus } from '../utils/stationStatus';

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
}

export function LeafletMap({ stations, center, zoom, onStationSelect, onViewDetails }: LeafletMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);

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
  }, [stations, onStationSelect, onViewDetails]);

  return (
    <div 
      ref={mapContainerRef} 
      style={{ height: '100%', width: '100%' }}
      className="rounded-lg"
    />
  );
}
