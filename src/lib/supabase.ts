import { createClient } from '@supabase/supabase-js'

// Supabase configuration - Vite uses import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file')
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
          latitude: number
          longitude: number
          status: 'available' | 'occupied' | 'maintenance'
          charger_type: 'fast' | 'ultra_fast' | 'standard'
          price: number
          amenities: string[]
          total_spots: number
          available_spots: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address: string
          latitude: number
          longitude: number
          status?: 'available' | 'occupied' | 'maintenance'
          charger_type: 'fast' | 'ultra_fast' | 'standard'
          price: number
          amenities?: string[]
          total_spots: number
          available_spots?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string
          latitude?: number
          longitude?: number
          status?: 'available' | 'occupied' | 'maintenance'
          charger_type?: 'fast' | 'ultra_fast' | 'standard'
          price?: number
          amenities?: string[]
          total_spots?: number
          available_spots?: number
          updated_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          user_id: string
          station_id: string
          start_time: string
          end_time: string
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          total_cost: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          station_id: string
          start_time: string
          end_time: string
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          total_cost?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          station_id?: string
          start_time?: string
          end_time?: string
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          total_cost?: number
          updated_at?: string
        }
      }
    }
  }
}