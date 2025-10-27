import { Station } from '../data/mockDatabase';

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
    const response = await fetch(`${API_URL}/stations`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result: StationApiResponse = await response.json();
    
    if (!result.success) {
      throw new Error('Failed to fetch stations from API');
    }
    
    // Transform API data to match frontend Station interface
    return transformApiStations(result.data);
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
    
    return transformApiStation(result.data);
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
    
    return transformApiStations(result.data);
  } catch (error) {
    console.error('Error searching stations from API:', error);
    throw error;
  }
}

// Transform API station data to frontend Station interface
function transformApiStation(apiStation: any): Station {
  // Generate charging points if not provided by API
  const totalSpots = apiStation.total_spots || apiStation.total || 0;
  const availableSpots = apiStation.available_spots || apiStation.available || 0;
  const chargingPoints = apiStation.charging_points || generateChargingPoints(totalSpots, availableSpots);
  
  // Generate layout if not provided by API
  const layout = apiStation.layout || generateStationLayout(totalSpots, chargingPoints);
  
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
    price: apiStation.price || apiStation.price_per_kwh ? `$${apiStation.price_per_kwh}/kWh` : '$0.35/kWh',
    pricePerKwh: apiStation.price_per_kwh || 0.35,
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
function generateChargingPoints(total: number, available: number) {
  const points = [];
  const inUse = total - available;
  
  for (let i = 0; i < total; i++) {
    const status = i < available ? 'available' : i < (available + inUse) ? 'in-use' : 'offline';
    points.push({
      id: `cp-${i + 1}`,
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
        type: 'restroom',
        x: 1,
        y: 1,
        width: 1,
        height: 1,
      },
      {
        type: 'cafe',
        x: width - 2,
        y: 1,
        width: 1,
        height: 1,
      },
    ],
  };
}

function transformApiStations(apiStations: any[]): Station[] {
  return apiStations.map(transformApiStation);
}
