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
    const response = await fetch(`${API_BASE_URL}/api/charging-points?station_id=${stationId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch charging points: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('[Charging Points API] Error fetching station charging points:', error);
    throw error;
  }
}

/**
 * Get a specific charging point by ID
 */
export async function getChargingPoint(pointId: number): Promise<ChargingPoint | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/charging-points/${pointId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch charging point: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data || null;
  } catch (error) {
    console.error('[Charging Points API] Error fetching charging point:', error);
    throw error;
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
