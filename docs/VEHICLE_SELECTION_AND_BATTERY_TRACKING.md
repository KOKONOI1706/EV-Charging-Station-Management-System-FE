# Tích hợp Chọn xe và Theo dõi Pin thông minh

## 🎯 Mục đích

Cải thiện trải nghiệm người dùng khi bắt đầu phiên sạc bằng cách:
1. **Cho phép chọn xe** từ danh sách xe của user
2. **Thu thập thông tin pin hiện tại** (%)
3. **Ước tính thời gian sạc** dựa trên dung lượng pin và công suất
4. **Cảnh báo tự động** khi pin gần đầy hoặc đã đầy
5. **Tính phí đậu xe** sau khi pin đầy (idle fee)

## 📋 Flow mới khi bắt đầu sạc

### Trước (Cũ):
```
User clicks "Bắt đầu sạc"
→ Nhập meter start
→ Bắt đầu sạc (không có thông tin xe/pin)
```

### Sau (Mới):
```
User clicks "Bắt đầu sạc"
→ Chọn xe từ danh sách (tùy chọn)
→ Nhập meter start
→ [NẾU có chọn xe + xe có battery_capacity_kwh]
   → Modal nhập % pin hiện tại
   → Chọn target (80% hoặc 100%)
   → Xem ước tính thời gian sạc
→ Bắt đầu sạc (với đầy đủ thông tin)
```

## 🔧 Các thay đổi kỹ thuật

### 1. Frontend Components

#### `StartChargingModal.tsx` (Đã cập nhật)
**Chức năng mới:**
- Load danh sách xe của user từ API
- Hiển thị danh sách xe với thông tin: tên, biển số, dung lượng pin
- Auto-select nếu user chỉ có 1 xe
- Cho phép chọn "Không chọn xe" để sạc nhanh không tracking
- Kiểm tra xe có `battery_capacity_kwh` không → nếu có thì hiển thị `BatteryInputModal`
- Gửi `vehicle_id`, `initial_battery_percent`, `target_battery_percent` lên backend

**UI Changes:**
```tsx
// Section mới: Vehicle Selection
<Label>
  <Car /> Chọn xe (Tùy chọn)
</Label>

// Danh sách xe dạng cards
{vehicles.map(vehicle => (
  <button onClick={() => setSelectedVehicle(vehicle)}>
    {vehicle.make} {vehicle.model}
    Biển số: {vehicle.plate_number}
    {vehicle.battery_capacity_kwh && (
      <Battery /> {vehicle.battery_capacity_kwh} kWh
    )}
  </button>
))}

// Hint khi chọn xe có battery info
{selectedVehicle?.battery_capacity_kwh && (
  <p>💡 Hệ thống sẽ ước tính thời gian sạc và cảnh báo khi pin đầy</p>
)}
```

#### `BatteryInputModal.tsx` (Sẵn có, giờ được sử dụng)
**Chức năng:**
- Slider nhập % pin hiện tại (0-100%)
- Buttons chọn target: 80% (khuyến nghị) hoặc 100%
- Tính toán real-time:
  - Năng lượng cần sạc (kWh)
  - Thời gian ước tính (phút/giờ)
- Visual battery indicator (màu xanh/vàng/đỏ)
- Validation: current < target

**Công thức tính:**
```javascript
percentToCharge = target - current;
energyNeeded = (percentToCharge / 100) * batteryCapacity;
hoursNeeded = energyNeeded / chargingPowerKw;
```

### 2. API Integration

#### Request gửi lên backend:
```typescript
interface StartSessionRequest {
  user_id: number;
  point_id: number;
  meter_start: number;
  booking_id?: number;
  
  // ✅ NEW FIELDS
  vehicle_id?: number;              // ID của xe được chọn
  initial_battery_percent?: number; // % pin hiện tại (0-100)
  target_battery_percent?: number;  // % pin mục tiêu (80 hoặc 100)
}
```

#### Backend xử lý:
1. Nếu có `vehicle_id` + `initial_battery_percent`:
   - Query `battery_capacity_kwh` từ bảng `vehicles`
   - Tính `estimated_completion_time`
   - Lưu vào `charging_sessions` table

2. Trong quá trình sạc:
   - Backend tính `battery_progress` real-time
   - Khi đạt 90% → warning "pin gần đầy"
   - Khi đạt 100% → set `battery_full_time`, bắt đầu grace period
   - Sau grace period (5 phút) → bắt đầu tính idle fee

## 📊 Database Schema

### Table: `charging_sessions`
```sql
-- Các cột đã có sẵn từ migration trước
initial_battery_percent NUMERIC(5, 2),        -- % pin khi bắt đầu
target_battery_percent NUMERIC(5, 2) DEFAULT 100.00,
estimated_completion_time TIMESTAMPTZ,
battery_full_time TIMESTAMPTZ,
idle_start_time TIMESTAMPTZ,
auto_stopped BOOLEAN DEFAULT FALSE,
```

### Table: `vehicles`
```sql
vehicle_id SERIAL PRIMARY KEY,
user_id INTEGER REFERENCES users(user_id),
plate_number VARCHAR(20) NOT NULL,
make VARCHAR(50),
model VARCHAR(50),
year INTEGER,
battery_capacity_kwh NUMERIC(6, 2),  -- Dung lượng pin (kWh)
connector_type_id INTEGER,
```

## 🎨 UX Improvements

### 1. Chọn xe thông minh
- ✅ Nếu user có 1 xe → auto-select
- ✅ Nếu user có nhiều xe → hiển thị danh sách
- ✅ Nếu user không có xe → vẫn có thể sạc (skip vehicle selection)

### 2. Ước tính thời gian
**Ví dụ:**
```
Xe: Tesla Model 3 (60 kWh)
Pin hiện tại: 20%
Target: 80%
Công suất sạc: 50 kW

Năng lượng cần: (80-20)/100 * 60 = 36 kWh
Thời gian: 36/50 = 0.72h = 43 phút
```

### 3. Khuyến nghị sạc đến 80%
- ⚡ Nhanh hơn (sạc đến 80% mất ~40 phút, đến 100% mất ~60 phút)
- 🔋 Bảo vệ pin tốt hơn
- 💰 Tiết kiệm chi phí (ít thời gian hơn)

### 4. Cảnh báo thông minh
| Thời điểm | Cảnh báo | Màu | Hành động |
|-----------|----------|-----|-----------|
| 90% pin | "Pin gần đầy" | Vàng | Chuẩn bị kết thúc |
| 100% pin | "Pin đầy - Grace period 5 phút" | Cam | Đếm ngược |
| 5 phút sau | "Bắt đầu tính phí đậu 1000đ/phút" | Đỏ | Idle fee |
| 15 phút sau | "Tự động ngừng sạc" | Đỏ | Auto-stop |

## 🧪 Testing Scenarios

### Scenario 1: User có xe với battery info
```
Given: User có xe "Tesla Model 3" với battery 60 kWh
When: User clicks "Bắt đầu sạc"
Then: 
  - Hiển thị danh sách xe
  - Auto-select xe (nếu chỉ có 1)
  - User nhập meter start
  - User clicks "Bắt đầu sạc"
  - Hiển thị BatteryInputModal
  - User nhập current battery: 30%
  - User chọn target: 80%
  - Hiển thị estimate: ~40 phút
  - User confirms
  - Session starts với đầy đủ tracking
```

### Scenario 2: User không có xe
```
Given: User chưa thêm xe nào
When: User clicks "Bắt đầu sạc"
Then:
  - Hiển thị message "Bạn chưa có xe nào"
  - User nhập meter start
  - User clicks "Bắt đầu sạc"
  - Session starts KHÔNG có battery tracking
  - Vẫn hoạt động bình thường (legacy mode)
```

### Scenario 3: User chọn "Không chọn xe"
```
Given: User có xe nhưng muốn sạc nhanh
When: User clicks "Không chọn xe (Sạc nhanh)"
Then:
  - Deselect vehicle
  - User nhập meter start
  - Session starts KHÔNG có battery tracking
```

## 📝 Migration Checklist

- [x] Update `StartChargingModal.tsx` với vehicle selection
- [x] Integrate `BatteryInputModal.tsx` vào flow
- [x] Update API request to include vehicle_id + battery data
- [x] Backend đã sẵn sàng nhận vehicle_id (từ trước)
- [x] Database schema đã có battery tracking fields (từ trước)
- [ ] Test với user có xe
- [ ] Test với user không có xe
- [ ] Test với xe không có battery_capacity_kwh
- [ ] Test calculation accuracy
- [ ] Verify backend warnings work correctly

## 🚀 Lợi ích

### Cho User:
- 🎯 Biết chính xác thời gian cần sạc
- ⚡ Tối ưu thời gian (sạc đến 80% thay vì 100%)
- 💰 Tránh phí đậu xe nhờ cảnh báo kịp thời
- 📊 Theo dõi lịch sử sạc theo từng xe

### Cho Hệ thống:
- 📈 Thu thập dữ liệu sử dụng pin theo xe
- 💼 Quản lý điểm sạc hiệu quả hơn (tránh xe đậu lâu sau khi đầy)
- 💵 Thu idle fee đúng quy định
- 🤖 Tự động ngừng sạc sau thời gian idle

## 🔗 Related Files

**Frontend:**
- `src/components/StartChargingModal.tsx` - Modal bắt đầu sạc (UPDATED)
- `src/components/BatteryInputModal.tsx` - Modal nhập % pin (INTEGRATED)
- `src/api/chargingSessionApi.ts` - API service (đã có interface)
- `src/api/vehicleApi.ts` - Vehicle API service

**Backend:**
- `src/routes/chargingSessions.js` - Charging session routes (đã sẵn sàng)
- `src/routes/vehicles.js` - Vehicle routes

**Database:**
- `database/add_battery_tracking_fields.sql` - Migration (đã có)

**Documentation:**
- `docs/SMART_BATTERY_MONITORING.md` - Complete system design
- `docs/DATABASE_SCHEMA.md` - Database reference

## 💡 Tips

1. **User nên thêm xe vào profile** để tận dụng tính năng tracking
2. **Nhập battery capacity chính xác** để ước tính đúng
3. **Khuyến nghị sạc đến 80%** cho hầu hết trường hợp hàng ngày
4. **Sạc đến 100%** chỉ khi cần đi xa

---

**Status:** ✅ Đã hoàn thành implementation
**Date:** 2025-01-05
**Version:** 1.0
