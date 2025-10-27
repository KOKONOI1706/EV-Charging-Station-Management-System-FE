// Mock Database Service for EV Charging System - DEPRECATED
// This file has been replaced with Supabase integration

// Use SupabaseService for all data operations
export { SupabaseService as DatabaseService } from '../services/supabaseService';

// Legacy types for backward compatibility
export type { Station, Reservation as Booking, User } from '../services/supabaseService';
