/**
 * ===============================================================
 * ROUTING SERVICE - Tính đường đi và thời gian
 * ===============================================================
 * Service tính toán route, khoảng cách và thời gian từ A đến B
 * 
 * Features:
 * - 🗺️ Tính đường đi thực tế (không phải đường chim bay)
 * - 📏 Khoảng cách chính xác (km)
 * - ⏱️ Thời gian ước tính (phút)
 * - 🚗 Hỗ trợ nhiều phương tiện (car, bike, foot)
 * - 📍 Waypoints (các điểm dừng trên đường)
 * 
 * API: OSRM (Open Source Routing Machine)
 * - Free, không cần API key
 * - Demo server: https://router.project-osrm.org
 * - Alternatives: Mapbox, Google Directions (cần API key)
 */

export interface RoutePoint {
  lat: number;
  lng: number;
}

export interface RouteResult {
  distance: number; // meters
  duration: number; // seconds
  geometry: RoutePoint[]; // Array of lat/lng points for polyline
  distanceKm: number; // kilometers
  durationMin: number; // minutes
  durationText: string; // "15 phút"
  distanceText: string; // "3.2 km"
}

class RoutingService {
  private baseUrl = 'https://router.project-osrm.org';

  /**
   * Calculate route from start to end
   * @param start Starting point {lat, lng}
   * @param end Ending point {lat, lng}
   * @param profile Transport mode: 'car' | 'bike' | 'foot'
   */
  async getRoute(
    start: RoutePoint,
    end: RoutePoint,
    profile: 'car' | 'bike' | 'foot' = 'car'
  ): Promise<RouteResult | null> {
    try {
      // OSRM format: /route/v1/{profile}/{coordinates}
      // coordinates: lng,lat;lng,lat (note: lng first!)
      const url = `${this.baseUrl}/route/v1/${profile}/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;

      console.log('🗺️ Fetching route:', url);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
        console.error('❌ No route found:', data);
        return null;
      }

      const route = data.routes[0];
      
      // Convert GeoJSON coordinates [lng, lat] to {lat, lng}
      const geometry: RoutePoint[] = route.geometry.coordinates.map(
        (coord: [number, number]) => ({
          lat: coord[1],
          lng: coord[0],
        })
      );

      const distanceKm = route.distance / 1000;
      const durationMin = route.duration / 60;

      const result: RouteResult = {
        distance: route.distance,
        duration: route.duration,
        geometry,
        distanceKm,
        durationMin,
        distanceText: this.formatDistance(distanceKm),
        durationText: this.formatDuration(durationMin),
      };

      console.log('✅ Route calculated:', result);
      return result;
    } catch (error) {
      console.error('❌ Error getting route:', error);
      return null;
    }
  }

  /**
   * Format distance for display
   */
  formatDistance(km: number): string {
    if (km < 1) {
      return `${Math.round(km * 1000)} m`;
    }
    return `${km.toFixed(1)} km`;
  }

  /**
   * Format duration for display
   */
  formatDuration(minutes: number): string {
    if (minutes < 1) {
      return '< 1 phút';
    }
    if (minutes < 60) {
      return `${Math.round(minutes)} phút`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (mins === 0) {
      return `${hours} giờ`;
    }
    return `${hours} giờ ${mins} phút`;
  }

  /**
   * Get multiple routes (for comparison)
   */
  async getAlternativeRoutes(
    start: RoutePoint,
    end: RoutePoint,
    profile: 'car' | 'bike' | 'foot' = 'car',
    alternatives: number = 2
  ): Promise<RouteResult[]> {
    try {
      const url = `${this.baseUrl}/route/v1/${profile}/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson&alternatives=${alternatives}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.code !== 'Ok' || !data.routes) {
        return [];
      }

      return data.routes.map((route: any) => {
        const geometry: RoutePoint[] = route.geometry.coordinates.map(
          (coord: [number, number]) => ({
            lat: coord[1],
            lng: coord[0],
          })
        );

        const distanceKm = route.distance / 1000;
        const durationMin = route.duration / 60;

        return {
          distance: route.distance,
          duration: route.duration,
          geometry,
          distanceKm,
          durationMin,
          distanceText: this.formatDistance(distanceKm),
          durationText: this.formatDuration(durationMin),
        };
      });
    } catch (error) {
      console.error('❌ Error getting alternative routes:', error);
      return [];
    }
  }

  /**
   * Calculate ETA (Estimated Time of Arrival)
   */
  getETA(durationMinutes: number): string {
    const now = new Date();
    const eta = new Date(now.getTime() + durationMinutes * 60 * 1000);
    return eta.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Get speed based on profile
   */
  getAverageSpeed(profile: 'car' | 'bike' | 'foot'): number {
    const speeds = {
      car: 40, // km/h in city
      bike: 15, // km/h
      foot: 5, // km/h
    };
    return speeds[profile];
  }
}

export const routingService = new RoutingService();
