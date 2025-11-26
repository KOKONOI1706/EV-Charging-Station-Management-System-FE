/**
 * ===============================================================
 * SUPABASE CLIENT (FRONTEND - ANON KEY)
 * ===============================================================
 * Khởi tạo Supabase client cho frontend với anon key
 * 
 * Chức năng:
 * - 🔑 Sử dụng anon key (public, bị giới hạn bởi RLS)
 * - 🔄 Auto-refresh token
 * - 💾 Persist session (localStorage)
 * - 🔗 Detect session trong URL (OAuth callback)
 * 
 * Configuration:
 * - supabaseUrl: URL của Supabase project (từ .env)
 * - supabaseAnonKey: Anon key (từ .env)
 *   * Anon key là public key, có thể expose ra frontend
 *   * Bị giới hạn bởi Row Level Security (RLS) policies
 * 
 * Options:
 * - auth.autoRefreshToken: true
 *   → Tự động refresh token khi sắp hết hạn
 * - auth.persistSession: true
 *   → Lưu session vào localStorage (user không cần login lại)
 * - auth.detectSessionInUrl: true
 *   → Tự động detect session từ URL (OAuth redirect)
 * 
 * Anon key vs Service role key:
 * - Anon key: Public, dùng trong frontend, bị RLS giới hạn
 * - Service role key: Secret, chỉ dùng backend, bypass RLS
 * 
 * Environment variables (.env):
 * - VITE_SUPABASE_URL=https://your-project.supabase.co
 * - VITE_SUPABASE_ANON_KEY=eyJhbGc...
 * 
 * Note: Vite sử dụng prefix VITE_ cho env vars
 * 
 * Database types:
 * - Interface định nghĩa structure của tables
 * - Generate bằng Supabase CLI:
 *   ```bash
 *   npx supabase gen types typescript --project-id <project-id>
 *   ```
 * - Cung cấp type safety cho queries
 * 
 * Tables:
 * 1. users:
 *    - id, email, name, role
 *    - created_at, updated_at
 * 
 * 2. stations:
 *    - id, name, address, latitude, longitude
 *    - status, charger_type, price
 *    - amenities, total_spots, available_spots
 * 
 * 3. bookings:
 *    - id, user_id, station_id
 *    - start_time, end_time
 *    - status, total_cost
 * 
 * Usage:
 * ```typescript
 * import { supabase } from '@/lib/supabase';
 * 
 * // Query
 * const { data, error } = await supabase
 *   .from('stations')
 *   .select('*')
 *   .eq('status', 'available');
 * 
 * // Auth
 * const { user } = await supabase.auth.getUser();
 * ```
 * 
 * Security:
 * - Anon key CÓ THỂ public (không cần giấu)
 * - RLS policies bảo vệ data
 * - Chỉ service role key mới cần giữ bí mật
 * 
 * Dependencies:
 * - @supabase/supabase-js: Supabase SDK
 */

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