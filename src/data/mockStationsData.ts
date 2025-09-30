// Enhanced Mock Stations Data with Charging Points and Layouts
import { Station, ChargingPoint } from './mockDatabase';

// Generate charging points for a station
const generateChargingPoints = (stationId: string, total: number, available: number): ChargingPoint[] => {
  const points: ChargingPoint[] = [];
  const statuses: ChargingPoint['status'][] = ['available', 'in-use', 'maintenance'];
  
  for (let i = 1; i <= total; i++) {
    let status: ChargingPoint['status'] = 'available';
    
    if (i > available) {
      // Randomly assign in-use or maintenance status
      status = Math.random() > 0.8 ? 'maintenance' : 'in-use';
    }
    
    points.push({
      id: `${stationId}-cp-${i}`,
      stationId,
      number: i,
      connectorType: i % 3 === 0 ? 'CHAdeMO' : 'CCS',
      powerKw: i % 2 === 0 ? 150 : 100,
      status,
      currentUser: status === 'in-use' ? `User ${Math.floor(Math.random() * 1000)}` : undefined,
      estimatedTimeRemaining: status === 'in-use' ? Math.floor(Math.random() * 120) + 30 : undefined,
      position: {
        x: (i - 1) % 4,
        y: Math.floor((i - 1) / 4)
      }
    });
  }
  
  return points;
};

export const ENHANCED_MOCK_STATIONS: Station[] = [
  {
    id: "1",
    name: "Downtown Charging Hub",
    address: "123 Main St",
    city: "Downtown",
    state: "CA",
    zipCode: "90210",
    distance: "0.2 mi",
    available: 3,
    total: 8,
    rating: 4.8,
    price: "$0.35/kWh",
    pricePerKwh: 0.35,
    connector: "CCS, CHAdeMO",
    power: "150kW",
    powerKw: 150,
    image: "https://images.unsplash.com/photo-1751355356724-7df0dda28b2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpYyUyMHZlaGljbGUlMjBjaGFyZ2luZyUyMHN0YXRpb24lMjBtb2Rlcm58ZW58MXx8fHwxNzU4Njc4NDg3fDA&ixlib=rb-4.1.0&q=80&w=1080",
    amenities: ["WiFi", "Restrooms", "Coffee Shop", "24/7 Security"],
    operatingHours: "24/7",
    phone: "(555) 123-0001",
    lat: 34.0522,
    lng: -118.2437,
    network: "ChargeTech",
    chargingPoints: generateChargingPoints("1", 8, 3),
    layout: {
      width: 6,
      height: 4,
      entrances: [
        { x: 0, y: 2, direction: 'west' },
        { x: 5, y: 2, direction: 'east' }
      ],
      facilities: [
        { type: 'restroom', x: 4, y: 0, width: 2, height: 1 },
        { type: 'cafe', x: 4, y: 3, width: 2, height: 1 },
        { type: 'parking', x: 0, y: 0, width: 1, height: 1 }
      ]
    }
  },
  {
    id: "2",
    name: "Mall Charging Center",
    address: "456 Shopping Blvd",
    city: "Westside",
    state: "CA",
    zipCode: "90211",
    distance: "0.8 mi",
    available: 6,
    total: 12,
    rating: 4.6,
    price: "$0.32/kWh",
    pricePerKwh: 0.32,
    connector: "CCS, Type 2",
    power: "100kW",
    powerKw: 100,
    image: "https://images.unsplash.com/photo-1707758283398-7df21adba23a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpYyUyMGNhciUyMGNoYXJnaW5nJTIwc3RhdGlvbiUyMG5pZ2h0fGVufDF8fHx8MTc1ODY3ODQ5MHww&ixlib=rb-4.1.0&q=80&w=1080",
    amenities: ["Shopping Mall", "Food Court", "Parking Validation", "Covered Parking"],
    operatingHours: "10:00 AM - 10:00 PM",
    phone: "(555) 123-0002",
    lat: 34.0522,
    lng: -118.2537,
    network: "ChargeTech",
    chargingPoints: generateChargingPoints("2", 12, 6),
    layout: {
      width: 8,
      height: 3,
      entrances: [
        { x: 3, y: 0, direction: 'north' },
        { x: 7, y: 1, direction: 'east' }
      ],
      facilities: [
        { type: 'shop', x: 0, y: 0, width: 2, height: 3 },
        { type: 'restroom', x: 6, y: 0, width: 2, height: 1 },
        { type: 'parking', x: 6, y: 2, width: 2, height: 1 }
      ]
    }
  },
  {
    id: "3",
    name: "Airport Express Station",
    address: "789 Airport Way, Terminal 2",
    city: "LAX",
    state: "CA",
    zipCode: "90045",
    distance: "1.2 mi",
    available: 2,
    total: 6,
    rating: 4.9,
    price: "$0.40/kWh",
    pricePerKwh: 0.40,
    connector: "CCS, CHAdeMO, Type 2",
    power: "350kW",
    powerKw: 350,
    image: "https://images.unsplash.com/photo-1751355356724-7df0dda28b2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpYyUyMHZlaGljbGUlMjBjaGFyZ2luZyUyMHN0YXRpb24lMjBtb2Rlcm58ZW58MXx8fHwxNzU4Njc4NDg3fDA&ixlib=rb-4.1.0&q=80&w=1080",
    amenities: ["Airport Access", "Valet Service", "Express Charging", "Travel Lounge"],
    operatingHours: "24/7",
    phone: "(555) 123-0003",
    lat: 33.9425,
    lng: -118.4081,
    network: "ChargeTech",
    chargingPoints: generateChargingPoints("3", 6, 2),
    layout: {
      width: 4,
      height: 3,
      entrances: [
        { x: 0, y: 1, direction: 'west' }
      ],
      facilities: [
        { type: 'cafe', x: 2, y: 0, width: 2, height: 1 },
        { type: 'restroom', x: 3, y: 2, width: 1, height: 1 }
      ]
    }
  },
  {
    id: "4",
    name: "Green Energy Station",
    address: "321 Eco Drive",
    city: "Sustainable District",
    state: "CA",
    zipCode: "90212",
    distance: "1.5 mi",
    available: 4,
    total: 8,
    rating: 4.7,
    price: "$0.28/kWh",
    pricePerKwh: 0.28,
    connector: "CCS, Type 2",
    power: "125kW",
    powerKw: 125,
    image: "https://images.unsplash.com/photo-1707758283398-7df21adba23a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpYyUyMGNhciUyMGNoYXJnaW5nJTIwc3RhdGlvbiUyMG5pZ2h0fGVufDF8fHx8MTc1ODY3ODQ5MHww&ixlib=rb-4.1.0&q=80&w=1080",
    amenities: ["Solar Powered", "Green Certification", "EV Lounge", "Bike Sharing"],
    operatingHours: "6:00 AM - 11:00 PM",
    phone: "(555) 123-0004",
    lat: 34.0622,
    lng: -118.2537,
    network: "ChargeTech",
    chargingPoints: generateChargingPoints("4", 8, 4),
    layout: {
      width: 5,
      height: 4,
      entrances: [
        { x: 2, y: 0, direction: 'north' },
        { x: 4, y: 2, direction: 'east' }
      ],
      facilities: [
        { type: 'cafe', x: 0, y: 0, width: 2, height: 2 },
        { type: 'restroom', x: 0, y: 3, width: 1, height: 1 },
        { type: 'parking', x: 4, y: 3, width: 1, height: 1 }
      ]
    }
  },
  {
    id: "5",
    name: "Highway Rest Stop",
    address: "555 Interstate 5 North",
    city: "Midway",
    state: "CA",
    zipCode: "90213",
    distance: "2.3 mi",
    available: 8,
    total: 16,
    rating: 4.5,
    price: "$0.38/kWh",
    pricePerKwh: 0.38,
    connector: "CCS, CHAdeMO, Type 2",
    power: "250kW",
    powerKw: 250,
    image: "https://images.unsplash.com/photo-1751355356724-7df0dda28b2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpYyUyMHZlaGljbGUlMjBjaGFyZ2luZyUyMHN0YXRpb24lMjBtb2Rlcm58ZW58MXx8fHwxNzU4Njc4NDg3fDA&ixlib=rb-4.1.0&q=80&w=1080",
    amenities: ["Rest Area", "Convenience Store", "Pet Area", "Truck Parking"],
    operatingHours: "24/7",
    phone: "(555) 123-0005",
    lat: 34.1522,
    lng: -118.2437,
    network: "ChargeTech",
    chargingPoints: generateChargingPoints("5", 16, 8),
    layout: {
      width: 8,
      height: 4,
      entrances: [
        { x: 0, y: 2, direction: 'west' },
        { x: 7, y: 2, direction: 'east' }
      ],
      facilities: [
        { type: 'shop', x: 2, y: 0, width: 4, height: 1 },
        { type: 'restroom', x: 6, y: 0, width: 2, height: 1 },
        { type: 'parking', x: 0, y: 0, width: 2, height: 1 }
      ]
    }
  },
  {
    id: "6",
    name: "University Campus Station",
    address: "888 College Ave",
    city: "University City",
    state: "CA",
    zipCode: "90214",
    distance: "3.1 mi",
    available: 5,
    total: 10,
    rating: 4.4,
    price: "$0.25/kWh",
    pricePerKwh: 0.25,
    connector: "CCS, Type 2",
    power: "75kW",
    powerKw: 75,
    image: "https://images.unsplash.com/photo-1707758283398-7df21adba23a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpYyUyMGNhciUyMGNoYXJnaW5nJTIwc3RhdGlvbiUyMG5pZ2h0fGVufDF8fHx8MTc1ODY3ODQ5MHww&ixlib=rb-4.1.0&q=80&w=1080",
    amenities: ["Student Discount", "Library Access", "Study Areas", "Campus Shuttle"],
    operatingHours: "6:00 AM - 12:00 AM",
    phone: "(555) 123-0006",
    lat: 34.0722,
    lng: -118.2337,
    network: "ChargeTech",
    chargingPoints: generateChargingPoints("6", 10, 5),
    layout: {
      width: 6,
      height: 3,
      entrances: [
        { x: 1, y: 0, direction: 'north' },
        { x: 5, y: 1, direction: 'east' }
      ],
      facilities: [
        { type: 'cafe', x: 0, y: 0, width: 1, height: 3 },
        { type: 'restroom', x: 4, y: 0, width: 2, height: 1 }
      ]
    }
  }
];