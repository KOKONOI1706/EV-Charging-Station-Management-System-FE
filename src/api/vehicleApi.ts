/**
 * ===============================================================
 * VEHICLE API SERVICE
 * ===============================================================
 * Service quản lý API xe điện của user
 * 
 * Chức năng:
 * - 🚗 CRUD operations cho xe điện (Create, Read, Update, Delete)
 * - 🔋 Quản lý thông tin pin (battery_capacity_kwh)
 * - 🔌 Quản lý loại đầu sạc (connector_type_id)
 * - 📝 Lưu thông tin xe: biển số, hãng, model, năm sản xuất, màu sắc
 * - 👤 Phân quyền: Mỗi user chỉ quản lý xe của mình
 * 
 * Interfaces:
 * - Vehicle: Dữ liệu xe (plate_number, make, model, battery_capacity_kwh, connector_type)
 * - ConnectorType: Loại đầu sạc (Type 2, CCS, CHAdeMO, etc.)
 * - CreateVehicleRequest: Params tạo xe mới
 * - UpdateVehicleRequest: Params cập nhật thông tin xe
 * 
 * Validation:
 * - Biển số xe phải unique trong hệ thống
 * - Battery capacity > 0 kWh
 * - Connector type phải tồn tại trong database
 * 
 * Dependencies:
 * - Backend API: /vehicles
 * - Supabase: Lưu trữ vehicle records và connector_types
 * - Quan hệ: vehicles.connector_type_id → connector_types.connector_type_id
 */

// URL backend API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface ConnectorType {
  connector_type_id: number;
  name: string;
  description?: string;
}

export interface Vehicle {
  vehicle_id: number;
  user_id: number;
  plate_number: string;
  make?: string;
  model?: string;
  year?: number;
  color?: string;
  battery_capacity_kwh?: number;
  connector_type_id?: number;
  created_at: string;
  updated_at?: string;
  
  // Relations
  connector_types?: ConnectorType;
}

export interface CreateVehicleRequest {
  user_id: number;
  plate_number: string;
  make?: string;
  model?: string;
  year?: number;
  color?: string;
  battery_capacity_kwh?: number;
  connector_type_id?: number;
}

export interface UpdateVehicleRequest {
  plate_number?: string;
  make?: string;
  model?: string;
  year?: number;
  color?: string;
  battery_capacity_kwh?: number;
  connector_type_id?: number;
}

class VehicleApiService {
  private baseUrl = `${API_BASE_URL}/vehicles`;

  /**
   * Get all vehicles for a user
   */
  async getUserVehicles(userId: number): Promise<Vehicle[]> {
    console.log('🚗 Fetching vehicles for user:', userId);
    const response = await fetch(`${this.baseUrl}?user_id=${userId}`);

    if (!response.ok) {
      console.error('❌ Failed to fetch vehicles:', response.status);
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch vehicles');
    }

    const result = await response.json();
    console.log('✅ Vehicles fetched:', result.data?.length || 0, 'vehicles');
    console.log('📋 Vehicle details:', result.data);
    return result.data || [];
  }

  /**
   * Get vehicle by ID
   */
  async getVehicleById(vehicleId: number): Promise<Vehicle> {
    const response = await fetch(`${this.baseUrl}/${vehicleId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch vehicle');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Create a new vehicle
   */
  async createVehicle(data: CreateVehicleRequest): Promise<Vehicle> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create vehicle');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Update an existing vehicle
   */
  async updateVehicle(vehicleId: number, data: UpdateVehicleRequest): Promise<Vehicle> {
    const response = await fetch(`${this.baseUrl}/${vehicleId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update vehicle');
    }

    const result = await response.json();
    return result.data;
  }

  /**
   * Delete a vehicle
   */
  async deleteVehicle(vehicleId: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${vehicleId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete vehicle');
    }
  }

  /**
   * Get all available connector types
   */
  async getConnectorTypes(): Promise<ConnectorType[]> {
    console.log("🔌 Fetching connector types from:", `${this.baseUrl}/meta/connector-types`);
    const response = await fetch(`${this.baseUrl}/meta/connector-types`);

    if (!response.ok) {
      console.error("❌ Failed to fetch connector types:", response.status);
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch connector types');
    }

    const result = await response.json();
    console.log("✅ Connector types result:", result);
    return result.data;
  }

  /**
   * Format vehicle display name
   */
  formatVehicleName(vehicle: Vehicle): string {
    const parts = [];
    if (vehicle.year) parts.push(vehicle.year);
    if (vehicle.make) parts.push(vehicle.make);
    if (vehicle.model) parts.push(vehicle.model);
    
    return parts.length > 0 ? parts.join(' ') : vehicle.plate_number;
  }

  /**
   * Format battery capacity with unit
   */
  formatBatteryCapacity(capacity?: number): string {
    return capacity ? `${capacity} kWh` : 'N/A';
  }
}

export const vehicleApi = new VehicleApiService();
