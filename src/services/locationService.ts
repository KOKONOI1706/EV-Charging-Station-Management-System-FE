/**
 * ===============================================================
 * LOCATION SERVICE - Geolocation & Distance Calculation
 * ===============================================================
 * Service xử lý vị trí địa lý và tính khoảng cách
 */

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

class LocationService {
  private cachedLocation: UserLocation | null = null;
  private cacheExpiry: number = 5 * 60 * 1000; // 5 minutes
  private lastFetchTime: number = 0;

  /**
   * Get current user location using Geolocation API
   */
  async getCurrentLocation(): Promise<UserLocation> {
    // Return cached location if still valid
    const now = Date.now();
    if (this.cachedLocation && (now - this.lastFetchTime) < this.cacheExpiry) {
      console.log('📍 Using cached location');
      return this.cachedLocation;
    }

    // Check if geolocation is supported
    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported by your browser');
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: UserLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          };

          // Cache the location
          this.cachedLocation = location;
          this.lastFetchTime = Date.now();

          console.log('📍 Got user location:', location);
          resolve(location);
        },
        (error) => {
          let message = 'Unable to get location';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = 'User denied geolocation permission';
              break;
            case error.POSITION_UNAVAILABLE:
              message = 'Location information is unavailable';
              break;
            case error.TIMEOUT:
              message = 'Location request timed out';
              break;
          }
          console.error('❌ Geolocation error:', message);
          reject(new Error(message));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }

  /**
   * Calculate distance between two points using Haversine formula
   * Returns distance in kilometers
   */
  calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371; // Earth radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  }

  /**
   * Convert degrees to radians
   */
  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Format distance for display
   */
  formatDistance(km: number): string {
    if (km < 1) {
      return `${(km * 1000).toFixed(0)} m`;
    }
    return `${km.toFixed(1)} km`;
  }

  /**
   * Calculate distances to all stations and add distance_km field
   */
  async calculateDistancesToStations(stations: any[]): Promise<any[]> {
    const userLocation = await this.getCurrentLocation();

    return stations.map(station => ({
      ...station,
      distance_km: this.calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        station.lat,
        station.lng
      ),
    })).sort((a, b) => a.distance_km - b.distance_km);
  }

  /**
   * Find N nearest stations
   */
  async findNearestStations(stations: any[], limit: number = 5): Promise<any[]> {
    const stationsWithDistance = await this.calculateDistancesToStations(stations);
    return stationsWithDistance.slice(0, limit);
  }

  /**
   * Filter stations within radius
   */
  async filterStationsByRadius(stations: any[], radiusKm: number): Promise<any[]> {
    const stationsWithDistance = await this.calculateDistancesToStations(stations);
    return stationsWithDistance.filter(s => s.distance_km <= radiusKm);
  }

  /**
   * Clear cached location
   */
  clearCache(): void {
    this.cachedLocation = null;
    this.lastFetchTime = 0;
  }
}

// Export singleton instance
export const locationService = new LocationService();

// Export class for testing
export { LocationService };
