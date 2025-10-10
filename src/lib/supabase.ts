import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database types (you can generate these with Supabase CLI)
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: 'customer' | 'staff' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          role?: 'customer' | 'staff' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: 'customer' | 'staff' | 'admin'
          updated_at?: string
        }
      }
      stations: {
        Row: {
          id: string
          name: string
          address: string
          city: string
          state: string
          zipCode: string
          lat: number
          lng: number
          status: 'available' | 'occupied' | 'maintenance'
          charger_type: string
          price_per_kwh: number
          power_kw: number
          connector: string
          amenities: string[]
          total_spots: number
          available_spots: number
          rating: number
          network: string
          operating_hours: string
          phone: string
          image_url?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address: string
          city: string
          state: string
          zipCode: string
          lat: number
          lng: number
          status?: 'available' | 'occupied' | 'maintenance'
          charger_type: string
          price_per_kwh: number
          power_kw: number
          connector: string
          amenities?: string[]
          total_spots: number
          available_spots?: number
          rating?: number
          network: string
          operating_hours: string
          phone: string
          image_url?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string
          city?: string
          state?: string
          zipCode?: string
          lat?: number
          lng?: number
          status?: 'available' | 'occupied' | 'maintenance'
          charger_type?: string
          price_per_kwh?: number
          power_kw?: number
          connector?: string
          amenities?: string[]
          total_spots?: number
          available_spots?: number
          rating?: number
          network?: string
          operating_hours?: string
          phone?: string
          image_url?: string
          updated_at?: string
        }
      }
      reservations: {
        Row: {
          id: string
          user_id: string
          station_id: string
          start_time: string
          end_time: string
          duration_hours: number
          status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled'
          total_cost: number
          payment_status: 'pending' | 'paid' | 'failed'
          payment_method?: string
          payment_id?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          station_id: string
          start_time: string
          end_time: string
          duration_hours: number
          status?: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled'
          total_cost?: number
          payment_status?: 'pending' | 'paid' | 'failed'
          payment_method?: string
          payment_id?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          station_id?: string
          start_time?: string
          end_time?: string
          duration_hours?: number
          status?: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled'
          total_cost?: number
          payment_status?: 'pending' | 'paid' | 'failed'
          payment_method?: string
          payment_id?: string
          updated_at?: string
        }
      }
    }
  }
}