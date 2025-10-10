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
  },

  // === TRẠM SẠC XUNG QUANH THỦ ĐỨC, TP HỒ CHÍ MINH ===

  // 7. Trạm Đại học Quốc gia TP.HCM - Có sẵn
  {
    id: 'thu-duc-vnu-007',
    name: 'VNU-HCM Campus - Khu E',
    address: 'Khu phố 6, Phường Linh Trung, Thủ Đức, TP.HCM',
    city: 'Thủ Đức',
    state: 'TP.HCM',
    zipCode: '70000',
    lat: 10.8698,
    lng: 106.8037,
    status: 'active',
    charger_type: 'fast',
    price_per_kwh: 4500, // VNĐ per kWh (tương đương ~$0.18)
    power_kw: 120,
    connector: 'CCS, CHAdeMO, Type 2',
    amenities: ['University Campus', 'Student Parking', 'WiFi', 'Food Court', 'Library Access'],
    total_spots: 8,
    available_spots: 4, // 4/8 chỗ có sẵn
    rating: 4.6,
    network: 'EVN Charging',
    operating_hours: '6:00 AM - 10:00 PM',
    phone: '+84 28 3724 4270',
    image_url: 'https://example.com/vnu-station.jpg',
    distance: '2.1 km',
    price: '4,500 VNĐ/kWh',
    power: '120kW',
    // Extended fields
    last_updated: new Date().toISOString(),
    current_users: 4,
    vehicle_compatibility: ['VinFast VF8', 'VinFast VF9', 'Tesla Model Y', 'Hyundai Kona Electric']
  },

  // 8. Trạm Gigamall Thủ Đức - Đã đầy
  {
    id: 'thu-duc-gigamall-008',
    name: 'Gigamall Thủ Đức - Tầng B2',
    address: '240-242 Phạm Văn Đồng, Hiệp Bình Chánh, Thủ Đức, TP.HCM',
    city: 'Thủ Đức',
    state: 'TP.HCM',
    zipCode: '70000',
    lat: 10.8507,
    lng: 106.7717,
    status: 'active',
    charger_type: 'ultra_fast',
    price_per_kwh: 5200, // VNĐ per kWh
    power_kw: 350,
    connector: 'CCS, Tesla Supercharger',
    amenities: ['Shopping Mall', 'Cinema', 'Restaurants', 'Covered Parking', 'Valet Service'],
    total_spots: 12,
    available_spots: 0, // Đã đầy
    rating: 4.8,
    network: 'VinFast Charging',
    operating_hours: '9:00 AM - 10:00 PM',
    phone: '+84 28 3715 3579',
    image_url: 'https://example.com/gigamall-station.jpg',
    distance: '3.5 km',
    price: '5,200 VNĐ/kWh',
    power: '350kW',
    // Extended fields
    last_updated: new Date().toISOString(),
    current_users: 12,
    estimated_completion_times: [10, 15, 22, 28, 35, 42, 48, 55, 65, 72, 80, 90],
    vehicle_compatibility: ['VinFast VF8', 'VinFast VF9', 'Tesla Model 3', 'Tesla Model Y']
  },

  // 9. Trạm Landmark 81 - Sắp có chỗ
  {
    id: 'thu-duc-landmark81-009',
    name: 'Landmark 81 SkyBar - VIP Charging',
    address: '720A Điện Biên Phủ, Vinhomes Central Park, Bình Thạnh, TP.HCM',
    city: 'Bình Thạnh', 
    state: 'TP.HCM',
    zipCode: '70000',
    lat: 10.7943,
    lng: 106.7197,
    status: 'active',
    charger_type: 'ultra_fast',
    price_per_kwh: 7500, // Premium pricing
    power_kw: 500,
    connector: 'CCS, Tesla Supercharger, CHAdeMO',
    amenities: ['Luxury Mall', 'Sky Bar', 'Fine Dining', 'Valet Parking', 'Concierge Service'],
    total_spots: 6,
    available_spots: 0, // Hiện tại đầy
    rating: 4.9,
    network: 'Vinhomes Premium Charging',
    operating_hours: '24/7',
    phone: '+84 28 3636 9999',
    image_url: 'https://example.com/landmark81-station.jpg',
    distance: '8.2 km',
    price: '7,500 VNĐ/kWh',
    power: '500kW',
    // Extended fields
    next_available_in_minutes: 6, // Sắp có chỗ trong 6 phút
    last_updated: new Date().toISOString(),
    current_users: 6,
    estimated_completion_times: [6, 12, 18, 25, 32, 40],
    vehicle_compatibility: ['VinFast VF8', 'VinFast VF9', 'Tesla Model S', 'Porsche Taycan', 'Audi e-tron GT']
  },

  // 10. Trạm Saigon Hi-Tech Park - Có sẵn
  {
    id: 'thu-duc-shtp-010',
    name: 'SHTP Innovation Hub',
    address: 'Đường D1, Khu Công nghệ cao, Quận 9, TP.HCM',
    city: 'Thủ Đức',
    state: 'TP.HCM', 
    zipCode: '70000',
    lat: 10.8515,
    lng: 106.7672,
    status: 'active',
    charger_type: 'fast',
    price_per_kwh: 4200,
    power_kw: 150,
    connector: 'CCS, Type 2',
    amenities: ['Tech Park', 'Office Complex', 'Cafeteria', 'Meeting Rooms'],
    total_spots: 10,
    available_spots: 6, // 6/10 chỗ có sẵn
    rating: 4.4,
    network: 'SHTP Green Energy',
    operating_hours: '6:00 AM - 8:00 PM',
    phone: '+84 28 3715 3000',
    image_url: 'https://example.com/shtp-station.jpg',
    distance: '4.7 km',
    price: '4,200 VNĐ/kWh',
    power: '150kW',
    // Extended fields
    last_updated: new Date().toISOString(),
    current_users: 4,
    vehicle_compatibility: ['VinFast VF8', 'VinFast VF9', 'Tesla Model 3', 'BMW i4', 'Mercedes EQC']
  },

  // 11. Trạm Suối Tiên - Bảo trì
  {
    id: 'thu-duc-suoitien-011',
    name: 'Suối Tiên Tourist Park',
    address: '120 Hà Nội, Phường Tân Phú, Quận 9, TP.HCM',
    city: 'Thủ Đức',
    state: 'TP.HCM',
    zipCode: '70000',
    lat: 10.8808,
    lng: 106.8239,
    status: 'maintenance',
    charger_type: 'standard',
    price_per_kwh: 3800,
    power_kw: 50,
    connector: 'Type 2, CHAdeMO',
    amenities: ['Theme Park', 'Swimming Pool', 'Restaurants', 'Family Entertainment'],
    total_spots: 8,
    available_spots: 0, // Không khả dụng do bảo trì
    rating: 4.0,
    network: 'Tourist Charging Network',
    operating_hours: '8:00 AM - 6:00 PM',
    phone: '+84 28 3896 4645',
    image_url: 'https://example.com/suoitien-station.jpg',
    distance: '6.3 km',
    price: '3,800 VNĐ/kWh',
    power: '50kW',
    // Extended fields
    last_updated: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    current_users: 0,
    vehicle_compatibility: ['VinFast VF8', 'Nissan Leaf', 'BYD Tang']
  },

  // 12. Trạm Thảo Điền - Không tương thích
  {
    id: 'thu-duc-thaoien-012',
    name: 'Thảo Điền Village - Residential',
    address: '611 Xa Lộ Hà Nội, Phường Thảo Điền, Quận 2, TP.HCM',
    city: 'Thủ Đức',
    state: 'TP.HCM',
    zipCode: '70000',
    lat: 10.8067,
    lng: 106.7441,
    status: 'active',
    charger_type: 'standard',
    price_per_kwh: 6000, // Premium residential pricing
    power_kw: 22,
    connector: 'Type 2 only', // Chỉ có Type 2, không tương thích với một số xe
    amenities: ['Luxury Residence', 'Security Guard', 'Riverside View', 'Private Parking'],
    total_spots: 4,
    available_spots: 2, // Có chỗ nhưng chỉ Type 2
    rating: 4.7,
    network: 'Residential Premium',
    operating_hours: '6:00 AM - 11:00 PM',
    phone: '+84 28 3744 6666',
    image_url: 'https://example.com/thaodien-station.jpg',
    distance: '7.8 km',
    price: '6,000 VNĐ/kWh',
    power: '22kW',
    // Extended fields
    last_updated: new Date().toISOString(),
    current_users: 2,
    vehicle_compatibility: ['BMW i3', 'Volkswagen ID.4', 'Audi e-tron'] // Không có VinFast/Tesla
  }
];

/**
 * Hàm để inject dữ liệu demo vào service
 */
export function injectDemoStations(): Promise<Station[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('🚗 Demo stations loaded (US + Vietnam):');
      console.log('=== US Stations ===');
      mockStationsForDemo.slice(0, 6).forEach((station, index) => {
        const statusInfo = getStationStatusForLog(station);
        console.log(`${index + 1}. ${station.name} - ${statusInfo.statusText} (${statusInfo.color})`);
      });
      console.log('\n=== Thủ Đức, TP.HCM Stations ===');
      mockStationsForDemo.slice(6).forEach((station, index) => {
        const statusInfo = getStationStatusForLog(station);
        console.log(`${index + 7}. ${station.name} - ${statusInfo.statusText} (${statusInfo.color})`);
      });
      console.log(`\n📊 Total: ${mockStationsForDemo.length} stations`);
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