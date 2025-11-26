/**
 * ===============================================================
 * MOCK DATABASE (DỮ LIỆU MẪU)
 * ===============================================================
 * TypeScript interfaces và mock data service cho frontend
 * 
 * Chức năng:
 * - 📦 Định nghĩa interfaces cho tất cả entities
 * - 🔄 Fetch data từ backend API
 * - 🎯 Type-safe data structures
 * 
 * Interfaces:
 * 
 * 1. ChargingPoint:
 *    - id, stationId, number
 *    - connectorType, powerKw
 *    - status: available/in-use/maintenance/offline
 *    - currentUser, estimatedTimeRemaining
 *    - position: { x, y } (grid position)
 * 
 * 2. Station:
 *    - id, name, address, city, state, zipCode
 *    - lat, lng, distance
 *    - available, total (số chỗ)
 *    - rating, price, pricePerKwh
 *    - connector, power, powerKw
 *    - image, amenities, operatingHours, phone
 *    - network, status
 *    - chargingPoints: ChargingPoint[]
 *    - layout: { width, height, entrances, facilities }
 * 
 * 3. User:
 *    - id, name, email, phone
 *    - memberSince, totalSessions, totalSpent
 *    - favoriteStations: string[]
 *    - role: customer/staff/admin
 *    - vehicleInfo: { make, model, year, batteryCapacity }
 * 
 * 4. Booking:
 *    - id, userId, stationId, station
 *    - date, time, duration
 *    - status: confirmed/completed/cancelled/in-progress
 *    - price, actualKwh
 *    - startTime, endTime
 *    - receipt: { id, kwh, cost, sessionDuration }
 * 
 * 5. PricingPlan:
 *    - id, name, monthlyPrice, annualPrice
 *    - features: string[]
 *    - popular: boolean
 *    - savings: string
 * 
 * Methods:
 * 
 * 1. fetchStationsFromApi():
 *    - GET /api/stations
 *    - Transform API response → Station interface
 *    - Return Station[]
 * 
 * 2. fetchStationByIdFromApi(id):
 *    - GET /api/stations/:id
 *    - Return Station | null
 * 
 * Mock data:
 * - PRICING_PLANS: Array của 3 plans (Basic, Plus, Premium)
 * 
 * Note:
 * - "Mock" trong tên nhưng thực tế gọi API thật
 * - Interfaces được dùng trong toàn bộ frontend
 * - Đảm bảo type safety với TypeScript
 * 
 * Dependencies:
 * - stationApi: Backend API calls
 */

// Mock Database Service for EV Charging System
import { fetchStations as fetchStationsFromApi, fetchStationById as fetchStationByIdFromApi } from '../api/stationApi';

export interface ChargingPoint {
  id: string;
  stationId: string;
  number: number;
  connectorType: string;
  powerKw: number;
  status: 'available' | 'in-use' | 'maintenance' | 'offline';
  currentUser?: string;
  estimatedTimeRemaining?: number; // in minutes
  position: {
    x: number; // grid position
    y: number; // grid position
  };
}

export interface Station {
  longitude: number | (() => number);
  latitude: number | (() => number);
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  distance: string;
  available: number;
  total: number;
  rating: number;
  price: string;
  pricePerKwh: number;
  connector: string;
  power: string;
  powerKw: number;
  image: string;
  amenities: string[];
  operatingHours: string;
  phone: string;
  lat: number;
  lng: number;
  network: string;
  status?: 'active' | 'maintenance' | 'offline';
  chargingPoints: ChargingPoint[];
  layout: {
    width: number; // grid width
    height: number; // grid height
    entrances: { x: number; y: number; direction: 'north' | 'south' | 'east' | 'west' }[];
    facilities: { 
      type: 'restroom' | 'cafe' | 'shop' | 'parking';
      x: number;
      y: number;
      width: number;
      height: number;
    }[];
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  memberSince: string;
  totalSessions: number;
  totalSpent: number;
  favoriteStations: string[];
  role: "customer" | "staff" | "admin";
  vehicleInfo: {
    make: string;
    model: string;
    year: number;
    batteryCapacity: number;
  };
}

export interface Booking {
  id: string;
  userId: string;
  stationId: string;
  station: Station;
  date: Date;
  time: string;
  duration: string;
  status: 'confirmed' | 'completed' | 'cancelled' | 'in-progress';
  price: string;
  actualKwh?: number;
  startTime?: string;
  endTime?: string;
  receipt?: {
    id: string;
    kwh: number;
    cost: number;
    sessionDuration: string;
  };
}

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  monthlyFee: number;
  discountRate: number;
  features: string[];
  popular?: boolean;
}

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  category: 'technical' | 'billing' | 'general' | 'station-issue';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  messages: {
    id: string;
    sender: 'user' | 'support';
    message: string;
    timestamp: Date;
  }[];
}

// Import enhanced stations data
import { ENHANCED_MOCK_STATIONS } from './mockStationsData';

// Mock Data — keep a mutable array that callers read from. We'll attempt to hydrate
// it from the backend when `getStations()` is called; if that fails we use the
// in-file ENHANCED_MOCK_STATIONS fallback.
export let MOCK_STATIONS: Station[] = ENHANCED_MOCK_STATIONS;


export const MOCK_USERS: User[] = [
  {
    id: "user_001",
    name: "Alex Johnson",
    email: "alex.johnson@email.com",
    phone: "+1 (555) 123-4567",
    memberSince: "2023-01-15",
    totalSessions: 45,
    totalSpent: 1250.75,
    favoriteStations: ["1", "2", "4"],
    role: "customer",
    vehicleInfo: {
      make: "Tesla",
      model: "Model 3",
      year: 2022,
      batteryCapacity: 75
    }
  },
  {
    id: "staff_001",
    name: "Sarah Martinez",
    email: "sarah.martinez@chargetech.com",
    phone: "+1 (555) 123-4568",
    memberSince: "2022-06-01",
    totalSessions: 0,
    totalSpent: 0,
    favoriteStations: [],
    role: "staff",
    vehicleInfo: {
      make: "Nissan",
      model: "Leaf",
      year: 2023,
      batteryCapacity: 62
    }
  },
  {
    id: "admin_001",
    name: "Michael Chen",
    email: "michael.chen@chargetech.com",
    phone: "+1 (555) 123-4569",
    memberSince: "2022-01-01",
    totalSessions: 0,
    totalSpent: 0,
    favoriteStations: [],
    role: "admin",
    vehicleInfo: {
      make: "BMW",
      model: "iX",
      year: 2023,
      batteryCapacity: 111
    }
  }
];

export const MOCK_USER = MOCK_USERS[0];

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "basic",
    name: "Basic",
    description: "Perfect for occasional charging",
    monthlyFee: 0,
    discountRate: 0,
    features: [
      "Standard charging rates",
      "Basic customer support",
      "Mobile app access",
      "Real-time availability"
    ]
  },
  {
    id: "plus",
    name: "Plus",
    description: "Great for regular commuters",
    monthlyFee: 9.99,
    discountRate: 10,
    features: [
      "10% discount on all charging",
      "Priority customer support",
      "Advanced booking features",
      "Monthly usage reports",
      "Free charging session alerts"
    ],
    popular: true
  },
  {
    id: "premium",
    name: "Premium",
    description: "Best value for frequent travelers",
    monthlyFee: 19.99,
    discountRate: 20,
    features: [
      "20% discount on all charging",
      "24/7 premium support",
      "Unlimited advanced bookings",
      "Detailed analytics dashboard",
      "Priority charging slots",
      "Concierge charging service"
    ]
  }
];

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: "booking_001",
    userId: "user_001",
    stationId: "1",
    station: MOCK_STATIONS[0],
    date: new Date(2024, 11, 28, 14, 0), // December 28, 2024 2:00 PM
    time: "14:00",
    duration: "2",
    status: "confirmed",
    price: "17.50"
  },
  {
    id: "booking_002",
    userId: "user_001",
    stationId: "2",
    station: MOCK_STATIONS[1],
    date: new Date(2024, 11, 20, 10, 0), // December 20, 2024 10:00 AM
    time: "10:00",
    duration: "3",
    status: "completed",
    price: "24.00",
    actualKwh: 75,
    startTime: "10:05",
    endTime: "13:12",
    receipt: {
      id: "receipt_002",
      kwh: 75,
      cost: 24.00,
      sessionDuration: "3h 7m"
    }
  },
  {
    id: "booking_003",
    userId: "user_001",
    stationId: "4",
    station: MOCK_STATIONS[3],
    date: new Date(2024, 11, 15, 16, 0), // December 15, 2024 4:00 PM
    time: "16:00",
    duration: "1.5",
    status: "completed",
    price: "10.50",
    actualKwh: 37.5,
    startTime: "16:03",
    endTime: "17:35",
    receipt: {
      id: "receipt_003",
      kwh: 37.5,
      cost: 10.50,
      sessionDuration: "1h 32m"
    }
  }
];

// Mock Database Service Functions
export class MockDatabaseService {
  static async getStations(): Promise<Station[]> {
    try {
      // Try to fetch from backend API first
      const stations = await fetchStationsFromApi();
      
      if (Array.isArray(stations) && stations.length > 0) {
        // Update local cache with backend data
        MOCK_STATIONS = stations;
        console.log(`✅ Loaded ${stations.length} stations from backend API`);
        return stations;
      }
    } catch (error) {
      console.warn('⚠️ Failed to fetch from backend API, using mock data:', error);
    }

    // Fallback to mock data
    return MOCK_STATIONS;
  }

  static async getStationById(id: string): Promise<Station | null> {
    try {
      // Try to fetch from backend API first
      const station = await fetchStationByIdFromApi(id);
      
      if (station) {
        console.log(`✅ Loaded station ${id} from backend API`);
        return station;
      }
    } catch (error) {
      console.warn(`⚠️ Failed to fetch station ${id} from backend API, using mock data:`, error);
    }

    // Fallback to mock data
    return MOCK_STATIONS.find(station => station.id === id) || null;
  }

  static async getUser(id: string): Promise<User | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return id === "user_001" ? MOCK_USER : null;
  }

  static async getUserBookings(userId: string): Promise<Booking[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_BOOKINGS.filter(booking => booking.userId === userId);
  }

  static async createBooking(bookingData: Partial<Booking>): Promise<Booking> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newBooking: Booking = {
      id: `booking_${Date.now()}`,
      userId: bookingData.userId || "user_001",
      stationId: bookingData.stationId || "",
      station: bookingData.station!,
      date: bookingData.date || new Date(),
      time: bookingData.time || "",
      duration: bookingData.duration || "2",
      status: "confirmed",
      price: bookingData.price || "0"
    };
    MOCK_BOOKINGS.push(newBooking);
    return newBooking;
  }

  static async updateBooking(id: string, updates: Partial<Booking>): Promise<Booking | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const bookingIndex = MOCK_BOOKINGS.findIndex(booking => booking.id === id);
    if (bookingIndex === -1) return null;
    
    MOCK_BOOKINGS[bookingIndex] = { ...MOCK_BOOKINGS[bookingIndex], ...updates };
    return MOCK_BOOKINGS[bookingIndex];
  }

  static async searchStations(query: string, filters?: {
    maxDistance?: number;
    minPower?: number;
    connector?: string;
    availability?: boolean;
  }): Promise<Station[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    let filteredStations = MOCK_STATIONS;

    if (query) {
      filteredStations = filteredStations.filter(station =>
        station.name.toLowerCase().includes(query.toLowerCase()) ||
        station.address.toLowerCase().includes(query.toLowerCase()) ||
        station.city.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (filters?.availability) {
      filteredStations = filteredStations.filter(station => station.available > 0);
    }

    if (filters?.minPower) {
      filteredStations = filteredStations.filter(station => station.powerKw >= filters.minPower!);
    }

    if (filters?.connector) {
      filteredStations = filteredStations.filter(station =>
        station.connector.toLowerCase().includes(filters.connector!.toLowerCase())
      );
    }

    return filteredStations;
  }

  // Charging Points management
  static async getChargingPointsByStationId(stationId: string): Promise<ChargingPoint[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const station = MOCK_STATIONS.find(s => s.id === stationId);
    return station?.chargingPoints || [];
  }

  static async getChargingPointById(pointId: string): Promise<ChargingPoint | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    for (const station of MOCK_STATIONS) {
      const point = station.chargingPoints.find(cp => cp.id === pointId);
      if (point) return point;
    }
    return null;
  }

  static async updateChargingPointStatus(pointId: string, status: ChargingPoint['status'], currentUser?: string, estimatedTime?: number): Promise<ChargingPoint | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    for (const station of MOCK_STATIONS) {
      const pointIndex = station.chargingPoints.findIndex(cp => cp.id === pointId);
      if (pointIndex !== -1) {
        station.chargingPoints[pointIndex] = {
          ...station.chargingPoints[pointIndex],
          status,
          currentUser: status === 'in-use' ? currentUser : undefined,
          estimatedTimeRemaining: status === 'in-use' ? estimatedTime : undefined
        };
        
        // Update station availability count
        station.available = station.chargingPoints.filter(cp => cp.status === 'available').length;
        
        return station.chargingPoints[pointIndex];
      }
    }
    return null;
  }

  // Real-time station data updates
  static async getStationRealTimeData(stationId: string): Promise<{
    availablePoints: number;
    totalPoints: number;
    currentLoad: number;
    averageWaitTime: number;
  } | null> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const station = MOCK_STATIONS.find(s => s.id === stationId);
    if (!station) return null;

    const availablePoints = station.chargingPoints.filter(cp => cp.status === 'available').length;
    const inUsePoints = station.chargingPoints.filter(cp => cp.status === 'in-use').length;
    const currentLoad = (inUsePoints / station.total) * 100;
    const averageWaitTime = availablePoints === 0 ? Math.floor(Math.random() * 60) + 15 : 0;

    return {
      availablePoints,
      totalPoints: station.total,
      currentLoad,
      averageWaitTime
    };
  }
}