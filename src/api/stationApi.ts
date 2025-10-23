import { Station } from '../data/mockDatabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
  return {
    id: apiStation.id?.toString() || '',
    name: apiStation.name || '',
    address: apiStation.address || '',
    city: apiStation.city || '',
    state: apiStation.state || '',
    zipCode: apiStation.zip_code || apiStation.zipCode || '',
    distance: apiStation.distance_km ? `${apiStation.distance_km} km` : 'N/A',
    available: apiStation.available_spots || apiStation.available || 0,
    total: apiStation.total_spots || apiStation.total || 0,
    rating: apiStation.rating || 4.5,
    price: apiStation.price || apiStation.price_per_kwh ? `$${apiStation.price_per_kwh}/kWh` : '$0.35/kWh',
    pricePerKwh: apiStation.price_per_kwh || 0.35,
    connector: apiStation.connector || apiStation.connector_type || 'CCS',
    power: apiStation.power || apiStation.power_kw ? `${apiStation.power_kw} kW` : '150 kW',
    powerKw: apiStation.power_kw || 150,
    image: apiStation.image || '/placeholder-station.jpg',
    amenities: apiStation.amenities || ['WiFi', 'Restroom', 'Cafe'],
    operatingHours: apiStation.operating_hours || apiStation.operatingHours || '24/7',
    phone: apiStation.phone || '+1 (555) 000-0000',
    lat: apiStation.lat || apiStation.latitude || 0,
    lng: apiStation.lng || apiStation.longitude || 0,
    latitude: apiStation.lat || apiStation.latitude || 0,
    longitude: apiStation.lng || apiStation.longitude || 0,
    network: apiStation.network || 'ChargeTech',
    chargingPoints: apiStation.charging_points || [],
    layout: apiStation.layout || {
      width: 10,
      height: 8,
      entrances: [{ x: 5, y: 0, direction: 'north' as const }],
      facilities: [],
    },
  };
}

function transformApiStations(apiStations: any[]): Station[] {
  return apiStations.map(transformApiStation);
}
