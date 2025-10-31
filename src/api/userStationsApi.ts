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
