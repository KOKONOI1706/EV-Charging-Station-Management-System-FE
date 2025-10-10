import { Station } from './supabaseService';

declare global {
  interface Window {
    L: any;
  }
}

export interface MapConfig {
  center: [number, number];
  zoom: number;
  maxZoom: number;
  minZoom: number;
}

export interface MarkerData {
  station: Station;
  lat: number;
  lng: number;
  popupContent: string;
}

export class MapService {
  private static map: any = null;
  private static markers: any[] = [];
  private static userLocationMarker: any = null;

  // Initialize map
  static initMap(containerId: string, config: MapConfig = {
    center: [34.0522, -118.2437], // Los Angeles default
    zoom: 12,
    maxZoom: 18,
    minZoom: 10
  }): any {
    if (!window.L) {
      console.error('Leaflet library not loaded');
      return null;
    }

    // Initialize map
    this.map = window.L.map(containerId).setView(config.center, config.zoom);

    // Add tile layer
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: config.maxZoom,
      minZoom: config.minZoom
    }).addTo(this.map);

    return this.map;
  }

  // Add stations to map
  static addStationsToMap(stations: Station[], onStationClick?: (station: Station) => void): void {
    if (!this.map || !window.L) return;

    // Clear existing markers
    this.clearStationMarkers();

    stations.forEach(station => {
      const marker = this.createStationMarker(station, onStationClick);
      this.markers.push(marker);
    });
  }

  // Create station marker
  private static createStationMarker(station: Station, onStationClick?: (station: Station) => void): any {
    if (!window.L) return null;

    // Create custom icon based on station status
    const iconColor = this.getMarkerColor(station.status, station.available_spots);
    const customIcon = this.createCustomIcon(iconColor);

    const marker = window.L.marker([station.lat, station.lng], { icon: customIcon })
      .addTo(this.map);

    // Create popup content
    const popupContent = this.createPopupContent(station);
    marker.bindPopup(popupContent);

    // Add click event
    if (onStationClick) {
      marker.on('click', () => {
        onStationClick(station);
      });
    }

    return marker;
  }

  // Get marker color based on station status
  private static getMarkerColor(status: string, availableSpots: number): string {
    if (status === 'maintenance') return 'red';
    if (availableSpots === 0) return 'orange';
    if (availableSpots > 0) return 'green';
    return 'gray';
  }

  // Create custom icon
  private static createCustomIcon(color: string): any {
    if (!window.L) return null;

    return window.L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          width: 25px;
          height: 25px;
          border-radius: 50%;
          background-color: ${color};
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
      `,
      iconSize: [25, 25],
      iconAnchor: [12.5, 12.5],
      popupAnchor: [0, -12.5]
    });
  }

  // Create popup content
  private static createPopupContent(station: Station): string {
    return `
      <div class="station-popup">
        <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">${station.name}</h3>
        <p style="margin: 4px 0; font-size: 14px; color: #666;">${station.address}</p>
        <p style="margin: 4px 0; font-size: 14px;">
          <strong>Available:</strong> ${station.available_spots}/${station.total_spots} spots
        </p>
        <p style="margin: 4px 0; font-size: 14px;">
          <strong>Price:</strong> $${station.price_per_kwh}/kWh
        </p>
        <p style="margin: 4px 0; font-size: 14px;">
          <strong>Power:</strong> ${station.power_kw}kW
        </p>
        <p style="margin: 4px 0; font-size: 14px;">
          <strong>Connector:</strong> ${station.connector}
        </p>
        <div style="margin-top: 8px;">
          <button 
            onclick="window.selectStation('${station.id}')" 
            style="
              background-color: #007bff;
              color: white;
              border: none;
              padding: 6px 12px;
              border-radius: 4px;
              cursor: pointer;
              font-size: 12px;
            "
          >
            Select Station
          </button>
        </div>
      </div>
    `;
  }

  // Add user location marker
  static addUserLocationMarker(lat: number, lng: number): void {
    if (!this.map || !window.L) return;

    // Remove existing user location marker
    if (this.userLocationMarker) {
      this.map.removeLayer(this.userLocationMarker);
    }

    // Create user location icon
    const userIcon = window.L.divIcon({
      className: 'user-location-marker',
      html: `
        <div style="
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background-color: #007bff;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        "></div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    this.userLocationMarker = window.L.marker([lat, lng], { icon: userIcon })
      .addTo(this.map)
      .bindPopup('Your Location');

    // Center map on user location
    this.map.setView([lat, lng], 14);
  }

  // Get user's current location
  static getCurrentLocation(): Promise<{ lat: number; lng: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  // Calculate distance between two points
  static calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  // Clear all station markers
  static clearStationMarkers(): void {
    if (!this.map) return;

    this.markers.forEach(marker => {
      this.map.removeLayer(marker);
    });
    this.markers = [];
  }

  // Fit map to show all stations
  static fitMapToStations(stations: Station[]): void {
    if (!this.map || !window.L || stations.length === 0) return;

    const group = new window.L.featureGroup(
      stations.map(station => window.L.marker([station.lat, station.lng]))
    );

    this.map.fitBounds(group.getBounds().pad(0.1));
  }

  // Search nearby stations
  static findNearbyStations(
    userLat: number, 
    userLng: number, 
    stations: Station[], 
    radiusMiles: number = 10
  ): Station[] {
    return stations
      .map(station => ({
        ...station,
        calculatedDistance: this.calculateDistance(userLat, userLng, station.lat, station.lng)
      }))
      .filter(station => station.calculatedDistance <= radiusMiles)
      .sort((a, b) => a.calculatedDistance - b.calculatedDistance)
      .map(station => ({
        ...station,
        distance: `${station.calculatedDistance.toFixed(1)} mi`
      }));
  }

  // Destroy map instance
  static destroyMap(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
      this.markers = [];
      this.userLocationMarker = null;
    }
  }

  // Set map view
  static setView(lat: number, lng: number, zoom: number = 12): void {
    if (this.map) {
      this.map.setView([lat, lng], zoom);
    }
  }

  // Add circle to show search radius
  static addSearchRadius(lat: number, lng: number, radiusMiles: number): any {
    if (!this.map || !window.L) return null;

    const radiusMeters = radiusMiles * 1609.34; // Convert miles to meters
    return window.L.circle([lat, lng], {
      radius: radiusMeters,
      color: '#007bff',
      fillColor: '#007bff',
      fillOpacity: 0.1,
      weight: 2
    }).addTo(this.map);
  }
}