import { supabase } from '../lib/supabase';

export interface Station {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  lat: number;
  lng: number;
  status: 'active' | 'maintenance' | 'offline';
  charger_type: string;
  price_per_kwh: number;
  power_kw: number;
  connector: string;
  amenities: string[];
  total_spots: number;
  available_spots: number;
  rating: number;
  network: string;
  operating_hours: string;
  phone: string;
  image_url?: string;
  distance?: string;
  price?: string;
  power?: string;
  // Extended fields for advanced status tracking
  next_available_in_minutes?: number;
  last_updated?: string;
  current_users?: number;
  estimated_completion_times?: number[];
  vehicle_compatibility?: string[];
}

export interface Reservation {
  id: string;
  user_id: string;
  station_id: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  total_cost: number;
  payment_status: 'pending' | 'paid' | 'failed';
  payment_method?: string;
  payment_id?: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'customer' | 'staff' | 'admin';
  created_at: string;
  updated_at: string;
}

export class SupabaseService {
  // Fetch all stations from Supabase
  static async fetchStations(): Promise<Station[]> {
    try {
      const { data, error } = await supabase
        .from('stations')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching stations:', error);
        throw error;
      }

      // Transform data to match frontend interface
      return data.map(station => ({
        ...station,
        distance: '0.0 mi', // Calculate based on user location
        price: `$${station.price_per_kwh}/kWh`,
        power: `${station.power_kw}kW`,
        available: station.available_spots,
        total: station.total_spots,
        pricePerKwh: station.price_per_kwh,
        powerKw: station.power_kw,
        image: station.image_url || 'https://images.unsplash.com/photo-1751355356724-7df0dda28b2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpYyUyMHZlaGljbGUlMjBjaGFyZ2luZyUyMHN0YXRpb24lMjBtb2Rlcm58ZW58MXx8fHwxNzU4Njc4NDg3fDA&ixlib=rb-4.1.0&q=80&w=1080',
        operatingHours: station.operating_hours
      }));
    } catch (error) {
      console.error('Error in fetchStations:', error);
      return [];
    }
  }

  // Fetch single station by ID
  static async fetchStationById(id: string): Promise<Station | null> {
    try {
      const { data, error } = await supabase
        .from('stations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching station:', error);
        return null;
      }

      return {
        ...data,
        distance: '0.0 mi',
        price: `$${data.price_per_kwh}/kWh`,
        power: `${data.power_kw}kW`,
        available: data.available_spots,
        total: data.total_spots,
        pricePerKwh: data.price_per_kwh,
        powerKw: data.power_kw,
        image: data.image_url || 'https://images.unsplash.com/photo-1751355356724-7df0dda28b2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpYyUyMHZlaGljbGUlMjBjaGFyZ2luZyUyMHN0YXRpb24lMjBtb2Rlcm58ZW58MXx8fHwxNzU4Njc4NDg3fDA&ixlib=rb-4.1.0&q=80&w=1080',
        operatingHours: data.operating_hours
      };
    } catch (error) {
      console.error('Error in fetchStationById:', error);
      return null;
    }
  }

  // Reserve a station
  static async reserveStation(
    stationId: string, 
    userId: string, 
    startTime: string, 
    endTime: string, 
    durationHours: number
  ): Promise<Reservation | null> {
    try {
      // First, get station details to calculate cost
      const station = await this.fetchStationById(stationId);
      if (!station) {
        throw new Error('Station not found');
      }

      const totalCost = station.price_per_kwh * durationHours * 50; // Assuming 50kWh per hour

      const { data, error } = await supabase
        .from('reservations')
        .insert({
          user_id: userId,
          station_id: stationId,
          start_time: startTime,
          end_time: endTime,
          duration_hours: durationHours,
          total_cost: totalCost,
          status: 'pending',
          payment_status: 'pending'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating reservation:', error);
        throw error;
      }

      // Update station availability
      await this.updateStationAvailability(stationId, -1);

      return data;
    } catch (error) {
      console.error('Error in reserveStation:', error);
      return null;
    }
  }

  // Update station availability
  static async updateStationAvailability(stationId: string, change: number): Promise<void> {
    try {
      // Get current station data
      const { data: station, error: fetchError } = await supabase
        .from('stations')
        .select('available_spots')
        .eq('id', stationId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      const newAvailableSpots = Math.max(0, station.available_spots + change);

      const { error: updateError } = await supabase
        .from('stations')
        .update({ 
          available_spots: newAvailableSpots,
          updated_at: new Date().toISOString()
        })
        .eq('id', stationId);

      if (updateError) {
        throw updateError;
      }
    } catch (error) {
      console.error('Error updating station availability:', error);
    }
  }

  // Process payment (update reservation status)
  static async processPayment(
    reservationId: string, 
    paymentMethod: string, 
    paymentId: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('reservations')
        .update({
          payment_status: 'paid',
          payment_method: paymentMethod,
          payment_id: paymentId,
          status: 'confirmed',
          updated_at: new Date().toISOString()
        })
        .eq('id', reservationId);

      if (error) {
        console.error('Error processing payment:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in processPayment:', error);
      return false;
    }
  }

  // Get user reservations
  static async getUserReservations(userId: string): Promise<Reservation[]> {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          stations (
            name,
            address,
            city
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reservations:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserReservations:', error);
      return [];
    }
  }

  // Search stations with filters
  static async searchStations(
    query?: string,
    filters?: {
      maxDistance?: number;
      minPower?: number;
      connector?: string;
      availability?: boolean;
    }
  ): Promise<Station[]> {
    try {
      let supabaseQuery = supabase.from('stations').select('*');

      if (query) {
        supabaseQuery = supabaseQuery.or(`name.ilike.%${query}%,address.ilike.%${query}%,city.ilike.%${query}%`);
      }

      if (filters?.availability) {
        supabaseQuery = supabaseQuery.gt('available_spots', 0);
      }

      if (filters?.minPower) {
        supabaseQuery = supabaseQuery.gte('power_kw', filters.minPower);
      }

      if (filters?.connector) {
        supabaseQuery = supabaseQuery.ilike('connector', `%${filters.connector}%`);
      }

      const { data, error } = await supabaseQuery.order('name');

      if (error) {
        console.error('Error searching stations:', error);
        return [];
      }

      return data.map(station => ({
        ...station,
        distance: '0.0 mi',
        price: `$${station.price_per_kwh}/kWh`,
        power: `${station.power_kw}kW`,
        available: station.available_spots,
        total: station.total_spots,
        pricePerKwh: station.price_per_kwh,
        powerKw: station.power_kw,
        image: station.image_url || 'https://images.unsplash.com/photo-1751355356724-7df0dda28b2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpYyUyMHZlaGljbGUlMjBjaGFyZ2luZyUyMHN0YXRpb24lMjBtb2Rlcm58ZW58MXx8fHwxNzU4Njc4NDg3fDA&ixlib=rb-4.1.0&q=80&w=1080',
        operatingHours: station.operating_hours
      }));
    } catch (error) {
      console.error('Error in searchStations:', error);
      return [];
    }
  }

  // Get current user
  static async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        return null;
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (userError) {
        console.error('Error fetching user data:', userError);
        return null;
      }

      return userData;
    } catch (error) {
      console.error('Error in getCurrentUser:', error);
      return null;
    }
  }

  // Real-time station updates
  static subscribeToStationUpdates(callback: (payload: any) => void) {
    return supabase
      .channel('stations')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'stations' 
      }, callback)
      .subscribe();
  }

  // Real-time reservation updates
  static subscribeToReservationUpdates(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('user_reservations')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'reservations',
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe();
  }
}