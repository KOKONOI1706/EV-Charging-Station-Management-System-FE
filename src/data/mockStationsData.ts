/**
 * ===============================================================
 * MOCK STATIONS DATA - Dữ Liệu Trạm Sạc Mẫu (Mock Data)
 * ===============================================================
 * File chứa dữ liệu mẫu chi tiết cho các trạm sạc tại TP.HCM
 * 
 * Chức năng:
 * - 🏢 6 trạm sạc mẫu với dữ liệu realistic
 * - 🔌 Chi tiết charging points cho mỗi trạm
 * - 🗺️ Station layouts với entrances, facilities
 * - 📍 Tọa độ GPS thực tế tại TP.HCM
 * - ⚡ Đa dạng connector types, power levels
 * 
 * Enhanced Features:
 * - Charging Points: Mỗi trạm có 4-15 charging points
 * - Point Status: available, in-use, maintenance
 * - Layouts: Visual grid với entrances, facilities
 * - Amenities: WiFi, nhà vệ sinh, cafe, shopping...
 * 
 * generateChargingPoints(stationId, total, available):
 * - Tạo array charging points cho 1 trạm
 * - Input:
 *   + stationId: ID của station (để link foreign key)
 *   + total: Tổng số charging points
 *   + available: Số points available (còn lại là in-use/maintenance)
 * - Output: ChargingPoint[] với:
 *   + id: `{stationId}-cp-{number}`
 *   + number: 1, 2, 3...
 *   + connectorType: CCS, CHAdeMO (rotation i % 3)
 *   + powerKw: 100kW, 150kW (rotation i % 2)
 *   + status: available | in-use | maintenance
 *   + currentUser: Random nếu in-use
 *   + estimatedTimeRemaining: 30-150 phút nếu in-use
 *   + position: { x, y } (grid layout)
 * 
 * Station Data (6 trạm):
 * 
 * 1. VinFast Landmark 81:
 *    - Location: Nguyễn Hữu Cảnh, Bình Thạnh
 *    - Coordinates: 10.7946, 106.7218
 *    - Charging Points: 8 total, 4 available
 *    - Power: 150kW
 *    - Connectors: CCS, Type 2
 *    - Price: 3.500đ/kWh
 *    - Rating: 4.9/5
 *    - Amenities: WiFi, Restroom, Mall, Security 24/7
 *    - Layout: 6x4 grid, 2 entrances (west/east), restroom + cafe + parking
 * 
 * 2. VinFast Vivo City:
 *    - Location: Nguyễn Văn Linh, Quận 7
 *    - Coordinates: 10.7414, 106.6994
 *    - Charging Points: 10 total, 0 available (BUSY - test case)
 *    - Power: 120kW
 *    - Price: 3.200đ/kWh
 *    - Rating: 4.7/5
 *    - Hours: 09:00 - 22:00
 *    - Amenities: Vivo City Mall, Food Court, Free Parking, Covered
 * 
 * 3. Tesla Supercharger Thảo Điền:
 *    - Location: Quốc Hương, Thảo Điền, Q2
 *    - Coordinates: 10.8014, 106.7397
 *    - Charging Points: 6 total, 6 available (ALL AVAILABLE)
 *    - Power: 250kW (ultra-fast Tesla V3)
 *    - Price: 4.200đ/kWh
 *    - Rating: 4.8/5
 *    - 24/7
 *    - Amenities: Tesla exclusive, Lounge, Premium
 * 
 * 4. Shell Recharge Phú Mỹ Hưng:
 *    - Location: Nguyễn Văn Linh, PMH, Q7
 *    - Coordinates: 10.7256, 106.7019
 *    - Charging Points: 12 total, 8 available
 *    - Power: 180kW
 *    - Connectors: CCS, Type 2, CHAdeMO
 *    - Price: 3.800đ/kWh
 *    - Rating: 4.6/5
 *    - Amenities: Shell Store, Car Wash, Air Pump
 * 
 * 5. EVgo District 1:
 *    - Location: Lê Lợi, Quận 1 (center)
 *    - Coordinates: 10.7730, 106.6980
 *    - Charging Points: 4 total, 2 available (LIMITED)
 *    - Power: 100kW
 *    - Price: 4.000đ/kWh (premium location)
 *    - Rating: 4.5/5
 *    - Hours: 06:00 - 23:00
 *    - Amenities: City center, Shopping nearby
 * 
 * 6. GreenCharge Airport:
 *    - Location: Trường Sơn, Tân Bình (near airport)
 *    - Coordinates: 10.8187, 106.6598
 *    - Charging Points: 15 total, 12 available
 *    - Power: 200kW
 *    - Price: 4.500đ/kWh
 *    - Rating: 4.7/5
 *    - 24/7
 *    - Amenities: Airport proximity, Waiting lounge, Luggage storage
 * 
 * Layout Structure:
 * ```typescript
 * layout: {
 *   width: number,        // Grid width (cells)
 *   height: number,       // Grid height (cells)
 *   entrances: Array<{    // Entry/exit points
 *     x: number,
 *     y: number,
 *     direction: 'north' | 'south' | 'east' | 'west'
 *   }>,
 *   facilities: Array<{   // Amenities locations
 *     type: 'restroom' | 'cafe' | 'parking' | 'shop',
 *     x: number,
 *     y: number,
 *     width: number,
 *     height: number
 *   }>
 * }
 * ```
 * 
 * Status Display:
 * - Available (Green): >= 50% spots free
 * - Limited (Yellow): < 50% spots free
 * - Busy (Red): 0 spots free
 * 
 * Usage:
 * ```typescript
 * import { ENHANCED_MOCK_STATIONS } from '@/data/mockStationsData';
 * 
 * // Map stations
 * const stations = ENHANCED_MOCK_STATIONS;
 * 
 * // Find by ID
 * const station = stations.find(s => s.id === '1');
 * 
 * // Get charging points
 * const points = station.chargingPoints;
 * ```
 * 
 * Dependencies:
 * - mockDatabase.ts: Station, ChargingPoint interfaces
 * - TypeScript: Type safety
 */

// Enhanced Mock Stations Data with Charging Points and Layouts
import { Station, ChargingPoint } from './mockDatabase';

// Generate charging points for a station
const generateChargingPoints = (stationId: string, total: number, available: number): ChargingPoint[] => {
  const points: ChargingPoint[] = [];  
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
    name: "VinFast Landmark 81",
    address: "208 Nguyễn Hữu Cảnh, Phường 22, Bình Thạnh",
    city: "Hồ Chí Minh",
    state: "Bình Thạnh",
    zipCode: "700000",
    distance: "0.5 km",
    available: 4,
    total: 8,
    rating: 4.9,
    price: "3.500 đ/kWh",
    pricePerKwh: 3.5,
    connector: "CCS, Type 2",
    power: "150kW",
    powerKw: 150,
    image: "https://images.unsplash.com/photo-1751355356724-7df0dda28b2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpYyUyMHZlaGljbGUlMjBjaGFyZ2luZyUyMHN0YXRpb24lMjBtb2Rlcm58ZW58MXx8fHwxNzU4Njc4NDg3fDA&ixlib=rb-4.1.0&q=80&w=1080",
    amenities: ["WiFi", "Nhà vệ sinh", "Trung tâm thương mại", "Bảo vệ 24/7"],
    operatingHours: "24/7",
    phone: "1900 23 23 89",
    lat: 10.7946,
    lng: 106.7218,
    latitude: 10.7946,
    longitude: 106.7218,
    network: "VinFast",
    status: 'active',
    chargingPoints: generateChargingPoints("1", 8, 4),
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
    name: "VinFast Vivo City",
    address: "1058 Nguyễn Văn Linh, Tân Phong, Quận 7",
    city: "Hồ Chí Minh",
    state: "Quận 7",
    zipCode: "700000",
    distance: "1.2 km",
    available: 0,
    total: 10,
    rating: 4.7,
    price: "3.200 đ/kWh",
    pricePerKwh: 3.2,
    connector: "CCS, Type 2",
    power: "120kW",
    powerKw: 120,
    image: "https://images.unsplash.com/photo-1707758283398-7df21adba23a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpYyUyMGNhciUyMGNoYXJnaW5nJTIwc3RhdGlvbiUyMG5pZ2h0fGVufDF8fHx8MTc1ODY3ODQ5MHww&ixlib=rb-4.1.0&q=80&w=1080",
    amenities: ["TTTM Vivo City", "Khu ẩm thực", "Miễn phí gửi xe", "Mái che"],
    operatingHours: "09:00 - 22:00",
    phone: "1900 23 23 89",
    lat: 10.7414,
    lng: 106.6994,
    latitude: 10.7414,
    longitude: 106.6994,
    network: "VinFast",
    status: 'active', // Hết chỗ - sẽ hiện màu đỏ
    chargingPoints: generateChargingPoints("2", 10, 0),
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
    name: "VinFast Sân Bay Tân Sơn Nhất",
    address: "Trường Sơn, Phường 2, Tân Bình",
    city: "Hồ Chí Minh",
    state: "Tân Bình",
    zipCode: "700000",
    distance: "2.5 km",
    available: 3,
    total: 6,
    rating: 4.8,
    price: "4.000 đ/kWh",
    pricePerKwh: 4.0,
    connector: "CCS, CHAdeMO, Type 2",
    power: "180kW",
    powerKw: 180,
    image: "https://images.unsplash.com/photo-1751355356724-7df0dda28b2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpYyUyMHZlaGljbGUlMjBjaGFyZ2luZyUyMHN0YXRpb24lMjBtb2Rlcm58ZW58MXx8fHwxNzU4Njc4NDg3fDA&ixlib=rb-4.1.0&q=80&w=1080",
    amenities: ["Sân bay", "Phòng chờ", "Sạc nhanh", "Dịch vụ Valet"],
    operatingHours: "24/7",
    phone: "1900 23 23 89",
    lat: 10.8188,
    lng: 106.6590,
    latitude: 10.8188,
    longitude: 106.6590,
    network: "VinFast",
    status: 'maintenance', // Đang bảo trì - sẽ hiện màu xám
    chargingPoints: generateChargingPoints("3", 6, 3),
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
    id: "7",
    name: "VinFast Bitexco Financial Tower",
    address: "2 Hải Triều, Bến Nghé, Quận 1",
    city: "Hồ Chí Minh",
    state: "Quận 1",
    zipCode: "700000",
    distance: "0.6 km",
    available: 2,
    total: 6,
    rating: 4.9,
    price: "4.200 đ/kWh",
    pricePerKwh: 4.2,
    connector: "CCS, Type 2, CHAdeMO",
    power: "200kW",
    powerKw: 200,
    image: "https://images.unsplash.com/photo-1751355356724-7df0dda28b2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpYyUyMHZlaGljbGUlMjBjaGFyZ2luZyUyMHN0YXRpb24lMjBtb2Rlcm58ZW58MXx8fHwxNzU4Njc4NDg3fDA&ixlib=rb-4.1.0&q=80&w=1080",
    amenities: ["Trung tâm tài chính", "Nhà hàng cao cấp", "Sân thượng quan cảnh", "Valet parking"],
    operatingHours: "24/7",
    phone: "1900 23 23 89",
    lat: 10.7717,
    lng: 106.7042,
    latitude: 10.7717,
    longitude: 106.7042,
    network: "VinFast",
    chargingPoints: generateChargingPoints("7", 6, 2),
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
    id: "8",
    name: "Greenway Aeon Mall Bình Tân",
    address: "1 Đường số 17A, Bình Trị Đông B, Bình Tân",
    city: "Hồ Chí Minh",
    state: "Bình Tân",
    zipCode: "700000",
    distance: "4.2 km",
    available: 7,
    total: 12,
    rating: 4.6,
    price: "2.600 đ/kWh",
    pricePerKwh: 2.6,
    connector: "CCS, Type 2",
    power: "100kW",
    powerKw: 100,
    image: "https://images.unsplash.com/photo-1707758283398-7df21adba23a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpYyUyMGNhciUyMGNoYXJnaW5nJTIwc3RhdGlvbiUyMG5pZ2h0fGVufDF8fHx8MTc1ODY3ODQ5MHww&ixlib=rb-4.1.0&q=80&w=1080",
    amenities: ["TTTM Aeon Mall", "Rạp chiếu phim", "Khu vui chơi trẻ em", "Miễn phí gửi xe 3h"],
    operatingHours: "08:00 - 22:00",
    phone: "028 6258 3333",
    lat: 10.7404,
    lng: 106.6143,
    latitude: 10.7404,
    longitude: 106.6143,
    network: "Greenway",
    status: 'active',
    chargingPoints: generateChargingPoints("8", 12, 7),
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
    id: "9",
    name: "Central Mall Charging Hub",
    address: "123 Nguyen Hue, District 1",
    city: "Hồ Chí Minh",
    state: "Quận 1",
    zipCode: "700000",
    distance: "0.3 km",
    available: 6,
    total: 8,
    rating: 4.8,
    price: "8.400 đ/kWh",
    pricePerKwh: 8.4,
    connector: "CCS, CHAdeMO, Type 2",
    power: "150kW",
    powerKw: 150,
    image: "https://images.unsplash.com/photo-1751355356724-7df0dda28b2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpYyUyMHZlaGljbGUlMjBjaGFyZ2luZyUyMHN0YXRpb24lMjBtb2Rlcm58ZW58MXx8fHwxNzU4Njc4NDg3fDA&ixlib=rb-4.1.0&q=80&w=1080",
    amenities: ["WiFi", "Nhà vệ sinh", "Quán cafe", "Trung tâm mua sắm"],
    operatingHours: "24/7",
    phone: "+84 28 3829 5000",
    lat: 10.7769,
    lng: 106.7009,
    latitude: 10.7769,
    longitude: 106.7009,
    network: "ChargeTech",
    chargingPoints: generateChargingPoints("9", 8, 6),
    layout: {
      width: 6,
      height: 3,
      entrances: [
        { x: 0, y: 1, direction: 'west' },
        { x: 5, y: 1, direction: 'east' }
      ],
      facilities: [
        { type: 'shop', x: 0, y: 0, width: 2, height: 1 },
        { type: 'cafe', x: 4, y: 0, width: 2, height: 1 },
        { type: 'restroom', x: 2, y: 2, width: 2, height: 1 }
      ]
    }
  },
  {
    id: "10",
    name: "Airport Express Station",
    address: "456 Tan Son Nhat Airport, Tan Binh District",
    city: "Hồ Chí Minh",
    state: "Tân Bình",
    zipCode: "700000",
    distance: "5.0 km",
    available: 9,
    total: 12,
    rating: 4.9,
    price: "10.080 đ/kWh",
    pricePerKwh: 10.08,
    connector: "CCS, CHAdeMO",
    power: "350kW",
    powerKw: 350,
    image: "https://images.unsplash.com/photo-1751355356724-7df0dda28b2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpYyUyMHZlaGljbGUlMjBjaGFyZ2luZyUyMHN0YXRpb24lMjBtb2Rlcm58ZW58MXx8fHwxNzU4Njc4NDg3fDA&ixlib=rb-4.1.0&q=80&w=1080",
    amenities: ["WiFi", "Nhà vệ sinh", "Quán cafe", "Phòng chờ", "Cửa hàng miễn thuế"],
    operatingHours: "24/7",
    phone: "+84 28 3848 5000",
    lat: 10.8231,
    lng: 106.6297,
    latitude: 10.8231,
    longitude: 106.6297,
    network: "ChargeTech",
    chargingPoints: generateChargingPoints("10", 12, 9),
    layout: {
      width: 8,
      height: 3,
      entrances: [
        { x: 0, y: 1, direction: 'west' },
        { x: 7, y: 1, direction: 'east' }
      ],
      facilities: [
        { type: 'cafe', x: 0, y: 0, width: 3, height: 1 },
        { type: 'shop', x: 5, y: 0, width: 3, height: 1 },
        { type: 'restroom', x: 3, y: 2, width: 2, height: 1 }
      ]
    }
  },
  {
    id: "11",
    name: "Tech Park Station",
    address: "789 Quang Trung Software City, District 12",
    city: "Hồ Chí Minh",
    state: "Quận 12",
    zipCode: "700000",
    distance: "8.5 km",
    available: 4,
    total: 6,
    rating: 4.6,
    price: "7.680 đ/kWh",
    pricePerKwh: 7.68,
    connector: "CCS, Type 2",
    power: "150kW",
    powerKw: 150,
    image: "https://images.unsplash.com/photo-1707758283398-7df21adba23a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpYyUyMGNhciUyMGNoYXJnaW5nJTIwc3RhdGlvbiUyMG5pZ2h0fGVufDF8fHx8MTc1ODY3ODQ5MHww&ixlib=rb-4.1.0&q=80&w=1080",
    amenities: ["WiFi", "Bãi đậu xe", "Quán cafe"],
    operatingHours: "06:00 - 22:00",
    phone: "+84 28 3715 5000",
    lat: 10.8506,
    lng: 106.6200,
    latitude: 10.8506,
    longitude: 106.6200,
    network: "ChargeTech",
    chargingPoints: generateChargingPoints("11", 6, 4),
    layout: {
      width: 4,
      height: 3,
      entrances: [
        { x: 0, y: 1, direction: 'west' }
      ],
      facilities: [
        { type: 'cafe', x: 2, y: 0, width: 2, height: 1 },
        { type: 'parking', x: 2, y: 2, width: 2, height: 1 }
      ]
    }
  },
  {
    id: "12",
    name: "University Hub",
    address: "321 Linh Trung, Thu Duc City",
    city: "Hồ Chí Minh",
    state: "Thủ Đức",
    zipCode: "700000",
    distance: "10.0 km",
    available: 7,
    total: 10,
    rating: 4.7,
    price: "7.200 đ/kWh",
    pricePerKwh: 7.2,
    connector: "CCS, CHAdeMO, Type 2",
    power: "150kW",
    powerKw: 150,
    image: "https://images.unsplash.com/photo-1707758283398-7df21adba23a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpYyUyMGNhciUyMGNoYXJnaW5nJTIwc3RhdGlvbiUyMG5pZ2h0fGVufDF8fHx8MTc1ODY3ODQ5MHww&ixlib=rb-4.1.0&q=80&w=1080",
    amenities: ["WiFi", "Nhà vệ sinh", "Khu học tập", "Khu ẩm thực"],
    operatingHours: "24/7",
    phone: "+84 28 3724 5000",
    lat: 10.8700,
    lng: 106.8030,
    latitude: 10.8700,
    longitude: 106.8030,
    network: "ChargeTech",
    chargingPoints: generateChargingPoints("12", 10, 7),
    layout: {
      width: 6,
      height: 3,
      entrances: [
        { x: 1, y: 0, direction: 'north' },
        { x: 5, y: 2, direction: 'south' }
      ],
      facilities: [
        { type: 'cafe', x: 0, y: 0, width: 1, height: 3 },
        { type: 'restroom', x: 4, y: 0, width: 2, height: 1 }
      ]
    }
  },
  {
    id: "13",
    name: "Highway Service Center",
    address: "555 National Highway 1A, Binh Chanh District",
    city: "Hồ Chí Minh",
    state: "Bình Chánh",
    zipCode: "700000",
    distance: "12.0 km",
    available: 3,
    total: 4,
    rating: 4.5,
    price: "9.120 đ/kWh",
    pricePerKwh: 9.12,
    connector: "CCS, CHAdeMO",
    power: "150kW",
    powerKw: 150,
    image: "https://images.unsplash.com/photo-1751355356724-7df0dda28b2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpYyUyMHZlaGljbGUlMjBjaGFyZ2luZyUyMHN0YXRpb24lMjBtb2Rlcm58ZW58MXx8fHwxNzU4Njc4NDg3fDA&ixlib=rb-4.1.0&q=80&w=1080",
    amenities: ["Nhà vệ sinh", "Cửa hàng tiện lợi", "Bãi đậu xe"],
    operatingHours: "24/7",
    phone: "+84 28 3750 5000",
    lat: 10.7500,
    lng: 106.6000,
    latitude: 10.7500,
    longitude: 106.6000,
    network: "ChargeTech",
    chargingPoints: generateChargingPoints("13", 4, 3),
    layout: {
      width: 4,
      height: 2,
      entrances: [
        { x: 0, y: 1, direction: 'west' }
      ],
      facilities: [
        { type: 'shop', x: 2, y: 0, width: 2, height: 1 },
        { type: 'restroom', x: 3, y: 1, width: 1, height: 1 }
      ]
    }
  },
  {
    id: "14",
    name: "Landmark 81 Premium Station",
    address: "720A Dien Bien Phu, Binh Thanh District",
    city: "Hồ Chí Minh",
    state: "Bình Thạnh",
    zipCode: "700000",
    distance: "1.5 km",
    available: 11,
    total: 15,
    rating: 4.9,
    price: "10.800 đ/kWh",
    pricePerKwh: 10.8,
    connector: "CCS, Tesla, CHAdeMO",
    power: "350kW",
    powerKw: 350,
    image: "https://images.unsplash.com/photo-1751355356724-7df0dda28b2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpYyUyMHZlaGljbGUlMjBjaGFyZ2luZyUyMHN0YXRpb24lMjBtb2Rlcm58ZW58MXx8fHwxNzU4Njc4NDg3fDA&ixlib=rb-4.1.0&q=80&w=1080",
    amenities: ["WiFi", "Nhà vệ sinh", "Valet", "Phòng chờ VIP", "Nhà hàng cao cấp"],
    operatingHours: "24/7",
    phone: "+84 28 3636 8888",
    lat: 10.7943,
    lng: 106.7212,
    latitude: 10.7943,
    longitude: 106.7212,
    network: "ChargeTech Premium",
    chargingPoints: generateChargingPoints("14", 15, 11),
    layout: {
      width: 8,
      height: 4,
      entrances: [
        { x: 0, y: 2, direction: 'west' },
        { x: 7, y: 2, direction: 'east' }
      ],
      facilities: [
        { type: 'cafe', x: 2, y: 0, width: 4, height: 1 },
        { type: 'restroom', x: 6, y: 0, width: 2, height: 1 },
        { type: 'parking', x: 0, y: 0, width: 2, height: 1 }
      ]
    }
  }
];