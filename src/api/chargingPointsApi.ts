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
  connector_type_id?: number;
  connector_types?: {
    connector_type_id: number;
    code: string;
    name: string;
  };
  status: string;
  station_id: string;
  pos_x?: number;
  pos_y?: number;
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
    const points = result.data || [];
    
    // Transform data: extract connector_type from nested connector_types object
    return points.map((point: any) => ({
      ...point,
      connector_type: point.connector_types?.name || point.connector_types?.code || 'Unknown'
    }));
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
    const point = result.data;
    
    if (!point) return null;
    
    // Transform data: extract connector_type from nested connector_types object
    return {
      ...point,
      connector_type: point.connector_types?.name || point.connector_types?.code || 'Unknown'
    };
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

/**
 * Create a new charging point
 */
export async function createChargingPoint(data: {
  station_id: string;
  name: string;
  power_kw: number;
  connector_type_id: number;
  status?: string;
}): Promise<ChargingPoint> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/charging-points`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create charging point: ${response.statusText}`);
    }

    const result = await response.json();
    const point = result.data;
    
    return {
      ...point,
      connector_type: point.connector_types?.name || point.connector_types?.code || 'Unknown'
    };
  } catch (error) {
    console.error('[Charging Points API] Error creating charging point:', error);
    throw error;
  }
}

/**
 * Update a charging point
 */
export async function updateChargingPoint(pointId: number, data: {
  name?: string;
  power_kw?: number;
  connector_type_id?: number;
  status?: string;
  pos_x?: number;
  pos_y?: number;
}): Promise<ChargingPoint> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/charging-points/${pointId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update charging point: ${response.statusText}`);
    }

    const result = await response.json();
    const point = result.data;
    
    return {
      ...point,
      connector_type: point.connector_types?.name || point.connector_types?.code || 'Unknown'
    };
  } catch (error) {
    console.error('[Charging Points API] Error updating charging point:', error);
    throw error;
  }
}

/**
 * Delete a charging point
 */
export async function deleteChargingPoint(pointId: number): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/charging-points/${pointId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete charging point: ${response.statusText}`);
    }
  } catch (error) {
    console.error('[Charging Points API] Error deleting charging point:', error);
    throw error;
  }
}

/**
 * Get all connector types
 */
export interface ConnectorType {
  connector_type_id: number;
  code: string;
  name: string;
}

export async function getConnectorTypes(): Promise<ConnectorType[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/charging-points/connector-types/list`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch connector types: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('[Charging Points API] Error fetching connector types:', error);
    throw error;
  }
}
