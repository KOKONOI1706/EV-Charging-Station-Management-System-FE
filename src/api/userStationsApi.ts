/**
 * ===============================================================
 * USER STATIONS API (FRONTEND)
 * ===============================================================
 * API quản lý assignment của Staff đến Stations
 * 
 * Chức năng:
 * - 📍 Lấy station được assign cho user (staff)
 * - ✏️ Cập nhật station assignment (Admin assign staff đến trạm)
 * - 👥 Lấy danh sách staff của 1 station
 * 
 * Use cases:
 * 1. Staff login → Lấy station được assign → Hiển thị dashboard của station đó
 * 2. Admin assign staff đến station → Update assignment
 * 3. Admin xem danh sách staff của station
 * 
 * Interfaces:
 * 
 * 1. Station:
 *    - id: UUID
 *    - name: Tên trạm
 *    - address: Địa chỉ
 *    - latitude, longitude: Tọa độ
 *    - total_spots, available_spots: Số chỗ
 * 
 * 2. UserStationData:
 *    - userId: ID của user
 *    - name: Tên user
 *    - email: Email
 *    - roleId: ID vai trò
 *    - stationId: UUID của station (null nếu chưa assign)
 *    - station: Station object (null nếu chưa assign)
 * 
 * 3. StaffMember:
 *    - user_id: ID staff
 *    - name: Tên
 *    - email: Email
 *    - role_id: Role ID
 *    - station_id: Station UUID
 *    - created_at: Ngày assign
 * 
 * Methods:
 * 
 * 1. getUserStation(userId)
 *    - GET /api/user-stations/{userId}
 *    - Lấy station được assign cho user
 *    - Return: UserStationData với station info
 * 
 * 2. updateUserStation(userId, stationId)
 *    - PUT /api/user-stations/{userId}
 *    - Cập nhật station assignment
 *    - stationId = null để unassign
 *    - Return: Updated UserStationData
 * 
 * 3. getStationStaff(stationId)
 *    - GET /api/user-stations/staff/{stationId}
 *    - Lấy tất cả staff được assign tại station
 *    - Return: { stationId, staffCount, staff[] }
 * 
 * Flow assign staff:
 * 1. Admin vào User Management
 * 2. Chọn staff cần assign
 * 3. Chọn station từ dropdown
 * 4. Gọi updateUserStation(staffId, stationId)
 * 5. Backend cập nhật users.station_id = stationId
 * 6. Staff login lại → Chỉ thấy data của station đó
 * 
 * Dependencies:
 * - Backend API: /api/user-stations
 * - env: VITE_API_BASE_URL
 */

/**
 * User Stations API
 * Manages the assignment of staff members to charging stations
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

interface Station {
  id: string;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  total_spots?: number;
  available_spots?: number;
}

interface UserStationData {
  userId: number;
  name: string;
  email: string;
  roleId: number;
  stationId: string | null;
  station: Station | null;
}

interface StaffMember {
  user_id: number;
  name: string;
  email: string;
  role_id: number;
  station_id: string;
  created_at: string;
}

/**
 * Get the assigned station for a user
 */
export async function getUserStation(userId: number): Promise<UserStationData> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user-stations/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user station: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch user station');
    }

    return result.data;
  } catch (error) {
    console.error('[User Stations API] Error fetching user station:', error);
    throw error;
  }
}

/**
 * Update the assigned station for a user
 */
export async function updateUserStation(
  userId: number, 
  stationId: string | null
): Promise<UserStationData> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user-stations/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ stationId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update user station: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to update user station');
    }

    return result.data;
  } catch (error) {
    console.error('[User Stations API] Error updating user station:', error);
    throw error;
  }
}

/**
 * Get all staff members assigned to a specific station
 */
export async function getStationStaff(stationId: string): Promise<{
  stationId: string;
  staffCount: number;
  staff: StaffMember[];
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user-stations/staff/${stationId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch station staff: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch station staff');
    }

    return result.data;
  } catch (error) {
    console.error('[User Stations API] Error fetching station staff:', error);
    throw error;
  }
}
