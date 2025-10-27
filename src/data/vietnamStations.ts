import { Station } from '../services/supabaseService';

/**
 * Dữ liệu trạm sạc chỉ ở Thủ Đức và TP.HCM
 */
export const vietnamStations: Station[] = [
  // 1. Trạm Đại học Quốc gia TP.HCM - Có sẵn
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
    price_per_kwh: 4500, // VNĐ per kWh
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

  // 2. Trạm Gigamall Thủ Đức - Đã đầy
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

  // 3. Trạm Landmark 81 - Sắp có chỗ
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

  // 4. Trạm Saigon Hi-Tech Park - Có sẵn
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

  // 5. Trạm Suối Tiên - Bảo trì
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

  // 6. Trạm Thảo Điền - Không tương thích
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
  },

  // 7. Trạm Bình Dương - Becamex
  {
    id: 'binh-duong-becamex-013',
    name: 'Becamex IDC - Bình Dương New City',
    address: '230 Đại lộ Bình Dương, Lái Thiêu, Thuận An, Bình Dương',
    city: 'Thuận An',
    state: 'Bình Dương',
    zipCode: '75000',
    lat: 10.9049,
    lng: 106.7240,
    status: 'active',
    charger_type: 'fast',
    price_per_kwh: 4100,
    power_kw: 180,
    connector: 'CCS, Type 2, CHAdeMO',
    amenities: ['Business Center', 'Industrial Park', 'Parking', 'Security'],
    total_spots: 6,
    available_spots: 3, // 3/6 chỗ có sẵn
    rating: 4.3,
    network: 'Becamex Energy',
    operating_hours: '24/7',
    phone: '+84 274 222 0000',
    image_url: 'https://example.com/becamex-station.jpg',
    distance: '15.2 km',
    price: '4,100 VNĐ/kWh',
    power: '180kW',
    // Extended fields
    last_updated: new Date().toISOString(),
    current_users: 3,
    vehicle_compatibility: ['VinFast VF8', 'VinFast VF9', 'Tesla Model 3', 'Mercedes EQS']
  },

  // 8. Trạm Đồng Nai - Long Thành
  {
    id: 'dong-nai-longthanh-014',
    name: 'Long Thành Airport Express',
    address: 'Sân bay Long Thành, Đức Hòa, Long Thành, Đồng Nai',
    city: 'Long Thành',
    state: 'Đồng Nai',
    zipCode: '76000',
    lat: 10.8187,
    lng: 107.0208,
    status: 'active',
    charger_type: 'ultra_fast',
    price_per_kwh: 5500,
    power_kw: 400,
    connector: 'CCS, Tesla Supercharger',
    amenities: ['Airport Access', 'Duty Free', 'Food Court', 'Long-term Parking'],
    total_spots: 20,
    available_spots: 8, // 8/20 chỗ có sẵn
    rating: 4.9,
    network: 'Airport Charging Network',
    operating_hours: '24/7',
    phone: '+84 251 3730 0000',
    image_url: 'https://example.com/longthanh-station.jpg',
    distance: '25.6 km',
    price: '5,500 VNĐ/kWh',
    power: '400kW',
    // Extended fields
    last_updated: new Date().toISOString(),
    current_users: 12,
    vehicle_compatibility: ['VinFast VF8', 'VinFast VF9', 'Tesla Model S', 'Tesla Model X', 'Porsche Taycan']
  }
];

/**
 * Hàm để inject dữ liệu Vietnam stations vào service
 */
export function loadVietnamStations(): Promise<Station[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('🇻🇳 Vietnam stations loaded:');
      vietnamStations.forEach((station, index) => {
        console.log(`${index + 1}. ${station.name} - Lat: ${station.lat}, Lng: ${station.lng}`);
      });
      console.log(`📊 Total: ${vietnamStations.length} stations in Vietnam region`);
      resolve(vietnamStations);
    }, 500);
  });
}