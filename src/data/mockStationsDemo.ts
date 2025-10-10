import { Station } from '../services/supabaseService';

/**
 * Dữ liệu mock để demo 4 loại trạng thái trạm sạc
 */
export const mockStationsForDemo: Station[] = [
  // 1. Trạm còn chỗ - Màu xanh lá
  {
    id: 'demo-available-001',
    name: 'Green Valley Mall - Available',
    address: '123 Green Valley Blvd, Los Angeles, CA',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90210',
    lat: 34.0522,
    lng: -118.2437,
    status: 'active',
    charger_type: 'ultra_fast',
    price_per_kwh: 0.32,
    power_kw: 350,
    connector: 'CCS, CHAdeMO',
    amenities: ['WiFi', 'Restroom', 'Coffee Shop', 'Parking'],
    total_spots: 8,
    available_spots: 5, // Còn 5 chỗ
    rating: 4.8,
    network: 'SuperCharge Network',
    operating_hours: '24/7',
    phone: '+1 (555) 123-4567',
    image_url: 'https://example.com/station1.jpg',
    distance: '0.8 mi',
    price: '$0.32/kWh',
    power: '350kW',
    // Extended fields
    last_updated: new Date().toISOString(),
    current_users: 3,
    vehicle_compatibility: ['Tesla Model S', 'Tesla Model 3', 'BMW i4', 'Audi e-tron']
  },

  // 2. Trạm đầy - Màu đỏ
  {
    id: 'demo-full-002',
    name: 'Downtown Plaza - Full',
    address: '456 Downtown Ave, Los Angeles, CA',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90213',
    lat: 34.0565,
    lng: -118.2500,
    status: 'active',
    charger_type: 'fast',
    price_per_kwh: 0.28,
    power_kw: 150,
    connector: 'CCS, Type 2',
    amenities: ['WiFi', 'Shopping Mall', 'Food Court'],
    total_spots: 6,
    available_spots: 0, // Hết chỗ
    rating: 4.5,
    network: 'ChargePoint',
    operating_hours: '6:00 AM - 11:00 PM',
    phone: '+1 (555) 234-5678',
    image_url: 'https://example.com/station2.jpg',
    distance: '1.2 mi',
    price: '$0.28/kWh',
    power: '150kW',
    // Extended fields
    last_updated: new Date().toISOString(),
    current_users: 6,
    estimated_completion_times: [15, 25, 35, 45, 50, 60],
    vehicle_compatibility: ['Tesla Model 3', 'Nissan Leaf', 'Hyundai Kona']
  },

  // 3. Trạm bảo trì - Màu xám
  {
    id: 'demo-maintenance-003',
    name: 'Airport Terminal - Maintenance',
    address: '789 Airport Rd, Los Angeles, CA',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90045',
    lat: 33.9425,
    lng: -118.4081,
    status: 'maintenance',
    charger_type: 'standard',
    price_per_kwh: 0.35,
    power_kw: 50,
    connector: 'Type 2, CHAdeMO',
    amenities: ['Airport Access', 'Long-term Parking'],
    total_spots: 4,
    available_spots: 0, // Không khả dụng do bảo trì
    rating: 4.2,
    network: 'EVgo',
    operating_hours: '24/7',
    phone: '+1 (555) 345-6789',
    image_url: 'https://example.com/station3.jpg',
    distance: '5.8 mi',
    price: '$0.35/kWh',
    power: '50kW',
    // Extended fields
    last_updated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    current_users: 0,
    vehicle_compatibility: ['All EVs']
  },

  // 4. Trạm sắp có chỗ - Màu vàng
  {
    id: 'demo-soon-available-004',
    name: 'Beach Hotel - Soon Available',
    address: '321 Ocean Blvd, Santa Monica, CA',
    city: 'Santa Monica',
    state: 'CA',
    zipCode: '90401',
    lat: 34.0195,
    lng: -118.4912,
    status: 'active',
    charger_type: 'fast',
    price_per_kwh: 0.30,
    power_kw: 250,
    connector: 'CCS, Tesla Supercharger',
    amenities: ['Beach Access', 'Hotel', 'Restaurant', 'Valet Parking'],
    total_spots: 10,
    available_spots: 0, // Hiện tại đầy
    rating: 4.9,
    network: 'Tesla Supercharger',
    operating_hours: '24/7',
    phone: '+1 (555) 456-7890',
    image_url: 'https://example.com/station4.jpg',
    distance: '3.2 mi',
    price: '$0.30/kWh',
    power: '250kW',
    // Extended fields
    next_available_in_minutes: 8, // Sắp có chỗ trong 8 phút
    last_updated: new Date().toISOString(),
    current_users: 10,
    estimated_completion_times: [8, 12, 18, 22, 28, 35, 40, 45, 52, 60],
    vehicle_compatibility: ['Tesla Model S', 'Tesla Model 3', 'Tesla Model X', 'Tesla Model Y']
  },

  // 5. Trạm không tương thích với xe - Màu cam
  {
    id: 'demo-incompatible-005',
    name: 'Tech Campus - Incompatible',
    address: '555 Innovation Dr, Palo Alto, CA',
    city: 'Palo Alto',
    state: 'CA',
    zipCode: '94301',
    lat: 37.4419,
    lng: -122.1430,
    status: 'active',
    charger_type: 'standard',
    price_per_kwh: 0.25,
    power_kw: 22,
    connector: 'Type 2 only', // Chỉ có Type 2, không tương thích với Tesla
    amenities: ['Tech Campus', 'Employee Only', 'Covered Parking'],
    total_spots: 6,
    available_spots: 3, // Có chỗ nhưng không tương thích
    rating: 4.1,
    network: 'Workplace Charging',
    operating_hours: '7:00 AM - 7:00 PM',
    phone: '+1 (555) 567-8901',
    image_url: 'https://example.com/station5.jpg',
    distance: '12.5 mi',
    price: '$0.25/kWh',
    power: '22kW',
    // Extended fields
    last_updated: new Date().toISOString(),
    current_users: 3,
    vehicle_compatibility: ['BMW i3', 'Nissan Leaf', 'Volkswagen ID.4'] // Không có Tesla
  },

  // 6. Trạm offline - Màu xám đậm
  {
    id: 'demo-offline-006',
    name: 'Highway Rest Stop - Offline',
    address: '99 Highway 101, Thousand Oaks, CA',
    city: 'Thousand Oaks',
    state: 'CA',
    zipCode: '91360',
    lat: 34.1706,
    lng: -118.8375,
    status: 'offline',
    charger_type: 'fast',
    price_per_kwh: 0.33,
    power_kw: 125,
    connector: 'CCS, CHAdeMO',
    amenities: ['Rest Stop', 'Convenience Store', 'Restrooms'],
    total_spots: 4,
    available_spots: 0, // Offline
    rating: 3.8,
    network: 'Electrify America',
    operating_hours: '24/7',
    phone: '+1 (555) 678-9012',
    image_url: 'https://example.com/station6.jpg',
    distance: '18.3 mi',
    price: '$0.33/kWh',
    power: '125kW',
    // Extended fields
    last_updated: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 24 hours ago
    current_users: 0,
    vehicle_compatibility: ['All EVs']
  }
];

/**
 * Hàm để inject dữ liệu demo vào service
 */
export function injectDemoStations(): Promise<Station[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('🚗 Demo stations loaded:');
      mockStationsForDemo.forEach((station, index) => {
        const statusInfo = getStationStatusForLog(station);
        console.log(`${index + 1}. ${station.name} - ${statusInfo.statusText} (${statusInfo.color})`);
      });
      resolve(mockStationsForDemo);
    }, 1000);
  });
}

/**
 * Helper function to get status for logging
 */
function getStationStatusForLog(station: Station) {
  // Replicate the logic from StationStatusService for logging
  if (station.status === 'maintenance') {
    return { statusText: 'Đang bảo trì', color: '🔧 Gray' };
  }
  
  if (station.status === 'offline') {
    return { statusText: 'Tạm ngừng', color: '⚫ Dark Gray' };
  }
  
  if (station.available_spots === 0 && station.next_available_in_minutes && station.next_available_in_minutes <= 10) {
    return { statusText: 'Sắp có chỗ', color: '🟡 Yellow' };
  }
  
  if (station.available_spots === 0) {
    return { statusText: 'Đã đầy', color: '🔴 Red' };
  }
  
  if (station.available_spots > 0 && station.status === 'active') {
    // Check if compatible (simplified for demo)
    const isCompatible = !station.vehicle_compatibility || 
      station.vehicle_compatibility.some(v => v.toLowerCase().includes('tesla'));
    
    if (isCompatible) {
      return { statusText: 'Có sẵn', color: '🟢 Green' };
    } else {
      return { statusText: 'Không tương thích', color: '🟠 Orange' };
    }
  }
  
  return { statusText: 'Không xác định', color: '⚪ Gray' };
}

/**
 * CSS styles cho markers tùy chỉnh
 */
export const customMarkerStyles = `
<style>
  .custom-station-marker {
    background: none !important;
    border: none !important;
  }
  
  .custom-station-popup .leaflet-popup-content {
    margin: 8px;
    line-height: 1.4;
  }
  
  .custom-station-popup .leaflet-popup-tip {
    background: white;
  }
  
  .custom-station-popup .leaflet-popup-content-wrapper {
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
</style>
`;