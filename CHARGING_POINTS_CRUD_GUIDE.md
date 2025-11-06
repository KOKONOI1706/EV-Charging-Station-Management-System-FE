# Hướng Dẫn CRUD Điểm Sạc (Charging Points)

## 📌 Tổng Quan

Tính năng mới cho phép quản lý trực tiếp các **điểm sạc** (charging points) của mỗi trạm sạc ngay trong modal quản lý trạm. Bạn có thể thêm, sửa, xóa và xem các điểm sạc mà không cần rời khỏi giao diện quản lý trạm.

## 🎯 Tính Năng Đã Triển Khai

### Backend API Endpoints

#### 1. **Tạo Điểm Sạc Mới**
```http
POST /api/charging-points
Content-Type: application/json

{
  "station_id": "uuid",
  "name": "Point A1",
  "power_kw": 150,
  "connector_type_id": 1,
  "status": "Available"
}
```

#### 2. **Cập Nhật Điểm Sạc**
```http
PUT /api/charging-points/:id
Content-Type: application/json

{
  "name": "Point A1 - Updated",
  "power_kw": 200,
  "connector_type_id": 2,
  "status": "Maintenance"
}
```

#### 3. **Xóa Điểm Sạc**
```http
DELETE /api/charging-points/:id
```

#### 4. **Lấy Danh Sách Loại Connector**
```http
GET /api/charging-points/connector-types/list
```

### Frontend Components

#### Tab "Charging Points" mới trong StationCRUDModal
- **Vị trí**: Tab thứ 3 giữa "Details" và "Layout Design"
- **Chức năng**:
  - Xem danh sách điểm sạc của trạm
  - Thêm điểm sạc mới
  - Chỉnh sửa điểm sạc
  - Xóa điểm sạc
  - Hiển thị trạng thái với màu sắc trực quan

## 📖 Hướng Dẫn Sử Dụng

### 1. Tạo Trạm Sạc Mới Với Điểm Sạc

**Bước 1: Tạo trạm trước**
1. Mở Admin Dashboard
2. Vào tab "Station Management"
3. Click "Add Station"
4. Điền thông tin ở tab "Basic Info" và "Details"
5. Click "Create Station" để lưu trạm

**Bước 2: Thêm điểm sạc**
1. Sau khi tạo trạm xong, click "Edit" trên trạm vừa tạo
2. Chuyển sang tab "Charging Points"
3. Click nút "Add Point"
4. Điền thông tin:
   - **Point Name**: Tên điểm (vd: "Point A1")
   - **Power (kW)**: Công suất (vd: 150)
   - **Connector Type**: Chọn loại connector (CCS, Type 2, CHAdeMO, etc.)
   - **Status**: Chọn trạng thái (Available, In Use, Maintenance, Offline)
5. Click "Add Point"
6. Lặp lại để thêm nhiều điểm sạc

### 2. Chỉnh Sửa Điểm Sạc Hiện Có

1. Vào tab "Station Management"
2. Click "Edit" trên trạm cần sửa
3. Chuyển sang tab "Charging Points"
4. Click icon Edit (bút) trên điểm sạc cần sửa
5. Chỉnh sửa thông tin
6. Click "Update Point"

### 3. Xóa Điểm Sạc

1. Vào tab "Station Management"
2. Click "Edit" trên trạm
3. Chuyển sang tab "Charging Points"
4. Click icon Trash (thùng rác đỏ) trên điểm cần xóa
5. Xác nhận xóa trong popup

### 4. Xem Thông Tin Điểm Sạc

1. Click "View Details" trên trạm bất kỳ
2. Chuyển sang tab "Charging Points"
3. Xem danh sách đầy đủ các điểm sạc với:
   - Tên điểm
   - Công suất (kW)
   - Loại connector
   - Trạng thái hiện tại (màu badge)

## 🎨 Giao Diện Trực Quan

### Màu Sắc Trạng Thái
- 🟢 **Available** (Có sẵn) - Màu xanh lá
- 🔵 **In Use** (Đang dùng) - Màu xanh dương
- 🟡 **Maintenance** (Bảo trì) - Màu vàng
- ⚫ **Offline** (Ngoại tuyến) - Màu xám

### Thông Tin Hiển Thị
Mỗi điểm sạc hiển thị:
```
┌─────────────────────────────────────────┐
│ 🔌 Point A1                             │
│    150 kW • CCS Type 2 • [Available]   │
│                         [Edit] [Delete] │
└─────────────────────────────────────────┘
```

## 🔧 Cấu Hình & Yêu Cầu

### Yêu Cầu Hệ Thống
- Backend đã chạy ở port 5000
- Database đã có bảng `charging_points` và `connector_types`
- User đã đăng nhập với quyền admin

### Environment Variables
```env
VITE_API_BASE_URL=http://localhost:5000
```

## 📊 Cấu Trúc Dữ Liệu

### ChargingPoint Object
```typescript
{
  point_id: number;              // ID tự động
  station_id: string;            // UUID của trạm
  name: string;                  // Tên điểm (vd: "Point A1")
  power_kw: number;              // Công suất (kW)
  connector_type_id: number;     // ID loại connector
  connector_type: string;        // Tên loại connector
  status: string;                // Trạng thái
  created_at: string;            // Thời gian tạo
  updated_at: string;            // Thời gian cập nhật
  last_seen_at: string;          // Lần online cuối
}
```

### ConnectorType Object
```typescript
{
  connector_type_id: number;     // ID
  code: string;                  // Mã (vd: "CCS1")
  name: string;                  // Tên (vd: "CCS Type 1")
}
```

## 🚀 Quy Trình Hoàn Chỉnh

### Tạo Trạm Mới Có 4 Điểm Sạc

```plaintext
1. Tạo Trạm
   ├─ Basic Info: Tên, địa chỉ, tọa độ
   ├─ Details: 4 điểm, giá, công suất
   └─ Click "Create Station"

2. Thêm Điểm Sạc (x4)
   ├─ Point A1: 150kW, CCS Type 2, Available
   ├─ Point A2: 150kW, CCS Type 2, Available
   ├─ Point B1: 200kW, CHAdeMO, Available
   └─ Point B2: 200kW, CHAdeMO, Available

3. Thiết Kế Layout
   └─ Tab Layout Design: Đặt vị trí điểm trên grid

4. Lưu & Hoàn Tất
   └─ Click "Save Changes"
```

## 💡 Mẹo & Best Practices

### Đặt Tên Điểm Sạc
- ✅ Sử dụng quy ước rõ ràng: "Point A1", "Point B2"
- ✅ Nhóm theo khu vực: "Zone A - Point 1"
- ✅ Đánh số tuần tự: "CP-001", "CP-002"
- ❌ Tránh tên chung chung: "Điểm 1", "Point"

### Chọn Connector Type
- **CCS (Combined Charging System)**: Phổ biến nhất ở châu Âu và Mỹ
- **CHAdeMO**: Phổ biến với xe Nhật (Nissan, Mitsubishi)
- **Type 2**: Chuẩn châu Âu cho AC charging
- **GB/T**: Chuẩn Trung Quốc

### Quản Lý Trạng Thái
- **Available**: Điểm sạc sẵn sàng sử dụng
- **In Use**: Đang có xe sạc (tự động cập nhật)
- **Maintenance**: Đang bảo trì, không cho sạc
- **Offline**: Lỗi kỹ thuật, cần kiểm tra

## 🐛 Xử Lý Lỗi

### Lỗi: "Please save the station first"
**Nguyên nhân**: Đang ở mode tạo mới, trạm chưa được lưu  
**Giải pháp**: Lưu trạm trước, sau đó mới thêm điểm sạc

### Lỗi: "Failed to load charging points"
**Nguyên nhân**: Backend không phản hồi hoặc station_id sai  
**Giải pháp**: 
- Kiểm tra backend đang chạy
- Kiểm tra network tab trong DevTools
- Verify station_id trong database

### Lỗi: "Failed to create charging point"
**Nguyên nhân**: Thiếu thông tin bắt buộc hoặc connector_type_id không tồn tại  
**Giải pháp**:
- Điền đầy đủ tất cả trường
- Kiểm tra bảng `connector_types` có dữ liệu

### Điểm sạc không hiển thị
**Giải pháp**:
1. Refresh page
2. Check browser console
3. Verify trong database:
```sql
SELECT * FROM charging_points WHERE station_id = 'your-station-id';
```

## 📈 Tính Năng Mở Rộng (Tương Lai)

### Đang Lên Kế Hoạch
- [ ] Drag & drop điểm sạc trên layout grid
- [ ] Bulk import điểm sạc từ CSV
- [ ] Clone điểm sạc (copy cấu hình)
- [ ] Lịch sử thay đổi trạng thái
- [ ] Thống kê sử dụng theo điểm
- [ ] Đặt lịch bảo trì tự động
- [ ] Cảnh báo khi điểm offline lâu
- [ ] QR code cho mỗi điểm sạc

## 🔗 API Documentation

### Tạo Điểm Sạc
```bash
curl -X POST http://localhost:5000/api/charging-points \
  -H "Content-Type: application/json" \
  -d '{
    "station_id": "uuid-here",
    "name": "Point A1",
    "power_kw": 150,
    "connector_type_id": 1,
    "status": "Available"
  }'
```

### Cập Nhật Điểm Sạc
```bash
curl -X PUT http://localhost:5000/api/charging-points/123 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Point A1 - Updated",
    "power_kw": 200
  }'
```

### Xóa Điểm Sạc
```bash
curl -X DELETE http://localhost:5000/api/charging-points/123
```

### Lấy Connector Types
```bash
curl http://localhost:5000/api/charging-points/connector-types/list
```

## 📚 Tài Liệu Liên Quan

- **StationCRUDModal Component**: `src/components/StationCRUDModal.tsx`
- **Charging Points API**: `src/api/chargingPointsApi.ts`
- **Backend Routes**: `src/routes/chargingPoints.js`
- **Database Schema**: `charging_points` table

## 📞 Hỗ Trợ

Nếu gặp vấn đề:
1. Kiểm tra browser console (F12)
2. Kiểm tra backend logs
3. Verify database có dữ liệu
4. Xem lại hướng dẫn này

---

**Phiên Bản**: 1.0.0  
**Cập Nhật**: 7 Tháng 11, 2025  
**Tác Giả**: Development Team

🎉 **Chúc bạn quản lý trạm sạc hiệu quả!**
