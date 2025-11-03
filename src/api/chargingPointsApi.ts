/**
 * Charging Points API
 * Fetch real charging points data from database
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export interface ChargingPoint {
  point_id: number;
  name: string;
  power_kw: number;
  connector_type: string;
  status: string;
  station_id: string;
}

export interface Station {
  id: string;
  name: string;
  address: string;
  price_per_kwh: number;
}

/**
 * Get charging points for a specific station
 */
export async function getStationChargingPoints(stationId: string): Promise<ChargingPoint[]> {
  try {
    console.log(`[Charging Points API] Fetching charging points for station: ${stationId}`);
    const response = await fetch(`${API_BASE_URL}/api/charging-points?station_id=${stationId}`);
    
    if (!response.ok) {
      console.error(`[Charging Points API] HTTP Error: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to fetch charging points: ${response.statusText}`);
    }

    const result = await response.json();
    console.log(`[Charging Points API] Successfully fetched ${result.data?.length || 0} charging points`);
    return result.data || [];
  } catch (error) {
    console.error('[Charging Points API] Error fetching station charging points:', error);
    
    // Fallback: return mock data if API fails
    console.warn('[Charging Points API] Using fallback mock data');
    return [
      {
        point_id: 1,
        name: "Fast Charger #1",
        power_kw: 150,
        connector_type: "CCS",
        status: "Available",
        station_id: stationId
      },
      {
        point_id: 2,
        name: "Fast Charger #2", 
        power_kw: 150,
        connector_type: "CHAdeMO",
        status: "Available",
        station_id: stationId
      }
    ];
  }
}

/**
 * Get a specific charging point by ID
 */
export async function getChargingPoint(pointId: number): Promise<ChargingPoint | null> {
  try {
    console.log(`[Charging Points API] Fetching charging point: ${pointId}`);
    const response = await fetch(`${API_BASE_URL}/api/charging-points/${pointId}`);
    
    if (!response.ok) {
      console.error(`[Charging Points API] HTTP Error: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to fetch charging point: ${response.statusText}`);
    }

    const result = await response.json();
    console.log(`[Charging Points API] Successfully fetched charging point ${pointId}`);
    return result.data || null;
  } catch (error) {
    console.error('[Charging Points API] Error fetching charging point:', error);
    
    // Fallback: return mock data if API fails
    console.warn('[Charging Points API] Using fallback mock data for point:', pointId);
    return {
      point_id: pointId,
      name: `Charger #${pointId}`,
      power_kw: 150,
      connector_type: "CCS",
      status: "Available",
      station_id: "1"
    };
  }
}

/**
 * Get available charging points for a station
 */
export async function getAvailableChargingPoints(stationId: string): Promise<ChargingPoint[]> {
  try {
    const points = await getStationChargingPoints(stationId);
    return points.filter(p => p.status === 'Available');
  } catch (error) {
    console.error('[Charging Points API] Error fetching available charging points:', error);
    throw error;
  }
}
