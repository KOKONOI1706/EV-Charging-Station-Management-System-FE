/**
 * ===============================================================
 * STATION API SERVICE
 * ===============================================================
 * Service quản lý API trạm sạc (stations)
 * 
 * Chức năng:
 * - 📍 Lấy danh sách tất cả trạm sạc
 * - 🔍 Tìm kiếm trạm theo location (lat, lng, radius)
 * - 🗺️ Tính khoảng cách từ vị trí user đến từng trạm
 * - ⚡ Lấy charging points của mỗi trạm (power, status, connectors)
 * - 🖼️ Hiển thị ảnh trạm (Unsplash images)
 * - 💰 Hiển thị giá sạc (price_per_kwh)
 * - 📊 Theo dõi trạng thái real-time (available/unavailable points)
 * 
 * Interfaces:
 * - Station: Dữ liệu trạm sạc (name, address, lat, lng, price_per_kwh)
 * - StationApiResponse: Response từ backend (success, data, total)
 * - StationSearchParams: Params tìm kiếm (query, filters, location)
 * 
 * Features:
 * - Distance calculation: Haversine formula
 * - Image fallback: Unsplash placeholder nếu không có ảnh
 * - Caching: No-cache để luôn lấy data mới nhất
 * - Aggregation: Gộp charging points theo station_id
 * 
 * Dependencies:
 * - Backend API: /stations, /charging-points
 * - Supabase: Lưu trữ stations và charging_points
 * - Unsplash: Ảnh mẫu trạm sạc
 */

import { Station } from '../data/mockDatabase';

// URL backend API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to get default station images from Unsplash
function getDefaultStationImage(stationId?: string): string {
  // Array of high-quality EV charging station images from Unsplash
  const images = [
    'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&h=600&fit=crop', // Modern EV charger
    'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&h=600&fit=crop', // Charging station at night
    'https://images.unsplash.com/photo-1609429019995-8c40f49535a5?w=800&h=600&fit=crop', // White Tesla charging
    'https://images.unsplash.com/photo-1551522435-a13afa10f103?w=800&h=600&fit=crop', // EV charging port
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop', // Multiple charging stations
    'https://images.unsplash.com/photo-1612538498613-e0df2e0e6819?w=800&h=600&fit=crop', // Modern charging hub
  ];
  
  // Use station ID to consistently pick same image for same station
  const index = stationId ? parseInt(stationId.replace(/\D/g, '')) % images.length : 0;
  return images[index] || images[0];
}

export interface StationApiResponse {
  success: boolean;
  data: any[];
  total: number;
}

export interface StationSearchParams {
  query?: string;
  filters?: {
    availability?: boolean;
    minPower?: number;
    connector?: string;
    status?: string;
    maxDistance?: number;
  };
  location?: {
    lat: number;
    lng: number;
  };
}

// Fetch all stations
export async function fetchStations(): Promise<Station[]> {
  try {
    const response = await fetch(`${API_URL}/stations`, {
      cache: 'no-store', // Disable caching to always get fresh data
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result: StationApiResponse = await response.json();
    
    console.log('📡 Fetched stations from API, first station price_per_kwh:', result.data[0]?.price_per_kwh);
    
    if (!result.success) {
      throw new Error('Failed to fetch stations from API');
    }
    
    // Fetch all charging points for all stations in one call
    const chargingPointsResponse = await fetch(`${API_URL}/charging-points`);
    let allChargingPoints: any[] = [];
    
    if (chargingPointsResponse.ok) {
      const cpResult = await chargingPointsResponse.json();
      if (cpResult.success && cpResult.data) {
        allChargingPoints = cpResult.data;
      }
    }
    
    // Group charging points by station_id
    const chargingPointsByStation: { [key: string]: any[] } = {};
    allChargingPoints.forEach(cp => {
      const stationId = cp.station_id?.toString() || '';
      if (!chargingPointsByStation[stationId]) {
        chargingPointsByStation[stationId] = [];
      }
      chargingPointsByStation[stationId].push(cp);
    });
    
    // Transform API data to match frontend Station interface
    return result.data.map(station => {
      const stationId = station.id?.toString() || '';
      const stationChargingPoints = chargingPointsByStation[stationId] || [];
      return transformApiStation(station, stationChargingPoints);
    });
  } catch (error) {
    console.error('Error fetching stations from API:', error);
    throw error;
  }
}

// Fetch station by ID
export async function fetchStationById(id: string): Promise<Station | null> {
  try {
    const response = await fetch(`${API_URL}/stations/${id}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error('Failed to fetch station from API');
    }
    
    // Fetch real charging points from database
    const chargingPointsResponse = await fetch(`${API_URL}/charging-points?station_id=${id}`);
    let realChargingPoints = [];
    
    if (chargingPointsResponse.ok) {
      const cpResult = await chargingPointsResponse.json();
      if (cpResult.success && cpResult.data) {
        realChargingPoints = cpResult.data;
      }
    }
    
    return transformApiStation(result.data, realChargingPoints);
  } catch (error) {
    console.error(`Error fetching station ${id} from API:`, error);
    throw error;
  }
}

// Search stations with filters
export async function searchStations(params: StationSearchParams): Promise<Station[]> {
  try {
    const response = await fetch(`${API_URL}/stations/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result: StationApiResponse = await response.json();
    
    if (!result.success) {
      throw new Error('Failed to search stations from API');
    }
    
    // Fetch all charging points
    const chargingPointsResponse = await fetch(`${API_URL}/charging-points`);
    let allChargingPoints: any[] = [];
    
    if (chargingPointsResponse.ok) {
      const cpResult = await chargingPointsResponse.json();
      if (cpResult.success && cpResult.data) {
        allChargingPoints = cpResult.data;
      }
    }
    
    // Group charging points by station_id
    const chargingPointsByStation: { [key: string]: any[] } = {};
    allChargingPoints.forEach(cp => {
      const stationId = cp.station_id?.toString() || '';
      if (!chargingPointsByStation[stationId]) {
        chargingPointsByStation[stationId] = [];
      }
      chargingPointsByStation[stationId].push(cp);
    });
    
    return result.data.map(station => {
      const stationId = station.id?.toString() || '';
      const stationChargingPoints = chargingPointsByStation[stationId] || [];
      return transformApiStation(station, stationChargingPoints);
    });
  } catch (error) {
    console.error('Error searching stations from API:', error);
    throw error;
  }
}

// Transform API station data to frontend Station interface
function transformApiStation(apiStation: any, realChargingPoints?: any[]): Station {
  let chargingPoints;
  let availableSpots = 0;
  let totalSpots = 0;
  
  // Use real charging points from database if available
  if (realChargingPoints && realChargingPoints.length > 0) {
    totalSpots = realChargingPoints.length;
    availableSpots = realChargingPoints.filter(cp => cp.status === 'Available').length;
    
    // Transform real charging points to frontend format
    chargingPoints = realChargingPoints.map((cp, index) => {
      // Map database status to frontend status
      let frontendStatus: 'available' | 'in-use' | 'maintenance' | 'offline' = 'offline';
      if (cp.status === 'Available') frontendStatus = 'available';
      else if (cp.status === 'In Use') frontendStatus = 'in-use';
      else if (cp.status === 'Maintenance') frontendStatus = 'maintenance';
      else if (cp.status === 'Offline') frontendStatus = 'offline';
      
      return {
        id: cp.point_id?.toString() || `cp-${index + 1}`,
        stationId: cp.station_id?.toString() || apiStation.id?.toString() || '',
        number: cp.point_id || (index + 1),
        status: frontendStatus,
        connectorType: cp.connector_type || 'CCS',
        powerKw: cp.power_kw || 150,
        position: { x: 0, y: 0 }, // Will be positioned by layout
        currentUser: frontendStatus === 'in-use' ? 'In Use' : undefined,
        estimatedTimeRemaining: undefined,
      };
    });
  } else {
    // Fallback to generated charging points if no real data
    totalSpots = apiStation.total_spots || apiStation.total || 0;
    availableSpots = apiStation.available_spots || apiStation.available || 0;
    chargingPoints = generateChargingPoints(totalSpots, availableSpots, apiStation.id?.toString());
  }
  
  // Parse layout from backend or generate default layout
  let layout;
  if (apiStation.layout) {
    try {
      // If layout is stored as JSON string in database
      layout = typeof apiStation.layout === 'string' 
        ? JSON.parse(apiStation.layout) 
        : apiStation.layout;
      console.log('📐 Parsed layout for station:', apiStation.name, {
        width: layout.width,
        height: layout.height,
        facilitiesCount: layout.facilities?.length || 0,
        facilities: layout.facilities
      });
    } catch (error) {
      console.warn('Failed to parse station layout, generating default:', error);
      layout = generateStationLayout(totalSpots, chargingPoints);
    }
  } else {
    console.log('⚠️ No layout in DB for station:', apiStation.name, ', generating default');
    // Generate layout based on actual charging points
    layout = generateStationLayout(totalSpots, chargingPoints);
  }
  
  return {
    id: apiStation.id?.toString() || '',
    name: apiStation.name || '',
    address: apiStation.address || '',
    city: apiStation.city || '',
    state: apiStation.state || '',
    zipCode: apiStation.zip_code || apiStation.zipCode || '',
    distance: apiStation.distance_km ? `${apiStation.distance_km} km` : 'N/A',
    available: availableSpots,
    total: totalSpots,
    rating: apiStation.rating || 4.5,
    price: apiStation.price || apiStation.price_per_kwh ? `${new Intl.NumberFormat('vi-VN').format(apiStation.price_per_kwh)}₫/kWh` : '3.500₫/kWh',
    pricePerKwh: apiStation.price_per_kwh || 3500,
    connector: apiStation.connector || apiStation.connector_type || 'CCS',
    power: apiStation.power || apiStation.power_kw ? `${apiStation.power_kw} kW` : '150 kW',
    powerKw: apiStation.power_kw || 150,
    image: apiStation.image || getDefaultStationImage(apiStation.id || apiStation.station_id),
    amenities: apiStation.amenities || ['WiFi', 'Restroom', 'Cafe'],
    operatingHours: apiStation.operating_hours || apiStation.operatingHours || '24/7',
    phone: apiStation.phone || '+1 (555) 000-0000',
    lat: apiStation.lat || apiStation.latitude || 0,
    lng: apiStation.lng || apiStation.longitude || 0,
    latitude: apiStation.lat || apiStation.latitude || 0,
    longitude: apiStation.lng || apiStation.longitude || 0,
    network: apiStation.network || 'ChargeTech',
    chargingPoints: chargingPoints,
    layout: layout,
    status: apiStation.status || 'active',
  };
}

// Generate charging points based on total and available
function generateChargingPoints(total: number, available: number, stationId?: string) {
  const points = [];
  const inUse = total - available;
  
  for (let i = 0; i < total; i++) {
    const status = i < available ? 'available' : i < (available + inUse) ? 'in-use' : 'offline';
    points.push({
      id: `cp-${i + 1}`,
      stationId: stationId || '',
      number: i + 1,
      status: status as any,
      connectorType: 'CCS',
      powerKw: 150,
      position: { x: 0, y: 0 }, // Will be positioned by layout
      currentUser: status === 'in-use' ? `User ${i + 1}` : undefined,
      estimatedTimeRemaining: status === 'in-use' ? Math.floor(Math.random() * 30) + 10 : undefined,
    });
  }
  
  return points;
}

// Generate station layout based on charging points
function generateStationLayout(total: number, chargingPoints: any[]) {
  // Calculate grid size based on total points
  const pointsPerRow = Math.ceil(Math.sqrt(total));
  const rows = Math.ceil(total / pointsPerRow);
  
  const width = pointsPerRow * 2 + 4; // 2 cells per point + margins
  const height = rows * 2 + 4; // 2 cells per row + margins
  
  // Position charging points in grid
  chargingPoints.forEach((point, index) => {
    const row = Math.floor(index / pointsPerRow);
    const col = index % pointsPerRow;
    point.position = {
      x: col * 2 + 2,
      y: row * 2 + 2,
    };
  });
  
  return {
    width,
    height,
    entrances: [
      { x: Math.floor(width / 2), y: 0, direction: 'north' as const }
    ],
    facilities: [
      {
        type: 'restroom' as const,
        x: 1,
        y: 1,
        width: 1,
        height: 1,
      },
      {
        type: 'cafe' as const,
        x: width - 2,
        y: 1,
        width: 1,
        height: 1,
      },
    ],
  };
}

// Create a new station
export async function createStation(stationData: any): Promise<Station> {
  try {
    // If stationData already has snake_case fields (from StationCRUDModal), use them directly
    // Otherwise transform from camelCase Station object
    const hasSnakeCase = 'total_spots' in stationData || 'power_kw' in stationData;
    
    const backendData = hasSnakeCase ? {
      // Data is already in backend format from modal
      ...stationData
    } : {
      // Transform frontend Station object to backend format
      name: stationData.name,
      address: stationData.address,
      city: stationData.city,
      state: stationData.state,
      zip_code: stationData.zipCode,
      lat: stationData.lat,
      lng: stationData.lng,
      total_spots: stationData.total,
      available_spots: stationData.available,
      power_kw: stationData.powerKw,
      price_per_kwh: stationData.pricePerKwh,
      connector_type: stationData.connector,
      operating_hours: stationData.operatingHours,
      phone: stationData.phone,
      network: stationData.network,
      rating: stationData.rating,
      amenities: stationData.amenities,
      status: stationData.status || 'active',
      layout: stationData.layout ? JSON.stringify(stationData.layout) : null,
    };

    console.log('🔄 Sending to backend:', backendData);

    const response = await fetch(`${API_URL}/stations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to create station');
    }

    return transformApiStation(result.data);
  } catch (error) {
    console.error('Error creating station:', error);
    throw error;
  }
}

// Update an existing station
export async function updateStation(id: string, stationData: any): Promise<Station> {
  try {
    // If stationData already has snake_case fields (from StationCRUDModal), use them directly
    // Otherwise transform from camelCase Station object
    const hasSnakeCase = 'total_spots' in stationData || 'power_kw' in stationData;
    
    const backendData = hasSnakeCase ? {
      // Data is already in backend format from modal
      ...stationData
    } : {
      // Transform frontend Station object to backend format
      name: stationData.name,
      address: stationData.address,
      city: stationData.city,
      state: stationData.state,
      zip_code: stationData.zipCode,
      lat: stationData.lat,
      lng: stationData.lng,
      total_spots: stationData.total,
      available_spots: stationData.available,
      power_kw: stationData.powerKw,
      price_per_kwh: stationData.pricePerKwh,
      connector_type: stationData.connector,
      operating_hours: stationData.operatingHours,
      phone: stationData.phone,
      network: stationData.network,
      rating: stationData.rating,
      amenities: stationData.amenities,
      status: stationData.status,
      layout: stationData.layout ? JSON.stringify(stationData.layout) : null,
    };

    console.log('🔄 Sending to backend:', backendData);

    const response = await fetch(`${API_URL}/stations/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to update station');
    }

    return transformApiStation(result.data);
  } catch (error) {
    console.error('Error updating station:', error);
    throw error;
  }
}

/**
 * Fetch stations with location-based filtering
 * Backend calculates distance and filters by radius
 */
export async function fetchStationsWithLocation(
  latitude: number,
  longitude: number,
  radiusKm: number = 10
): Promise<Station[]> {
  try {
    const response = await fetch(
      `${API_URL}/stations?lat=${latitude}&lng=${longitude}&radius=${radiusKm}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch stations');
    }

    return result.data || [];
  } catch (error) {
    console.error('Error fetching stations with location:', error);
    throw error;
  }
}

// Delete a station
export async function deleteStation(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/stations/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to delete station');
    }
  } catch (error) {
    console.error('Error deleting station:', error);
    throw error;
  }
}
