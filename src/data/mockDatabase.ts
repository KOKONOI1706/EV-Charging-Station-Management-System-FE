// Mock Database Service for EV Charging System - DEPRECATED
// This file has been replaced with Supabase integration

// Mock Database Service for EV Charging System - DEPRECATED
// This file has been replaced with Supabase integration

// Use SupabaseService for all data operations
import { SupabaseService } from '../services/supabaseService';
export { SupabaseService as DatabaseService } from '../services/supabaseService';

// Create a simple wrapper without spread operator to avoid conflicts
const createMockDatabaseService = () => {
  return {
    getStations: async () => {
      console.log("MockDatabaseService.getStations called");
      return await SupabaseService.fetchStations();
    },
    getUserBookings: async (userId: string) => {
      console.log("MockDatabaseService.getUserBookings called with:", userId);
      return await SupabaseService.getUserReservations(userId);
    },
    // Add other SupabaseService methods individually if needed
    fetchStations: SupabaseService.fetchStations,
    getUserReservations: SupabaseService.getUserReservations,
    reserveStation: SupabaseService.reserveStation,
    processPayment: SupabaseService.processPayment
  };
};

// Re-export MockDatabaseService for backward compatibility
export const MockDatabaseService = createMockDatabaseService();

// Debug log
console.log("MockDatabaseService created:", MockDatabaseService);
console.log("getStations method exists:", typeof MockDatabaseService.getStations);

// Legacy types for backward compatibility
export type { Station, Reservation as Booking, User } from '../services/supabaseService';

// Pricing plans for the application
export const PRICING_PLANS = [
  {
    id: "basic",
    name: "Basic Plan",
    price: "Free",
    monthlyFee: 0,
    discountRate: 0,
    description: "Perfect for occasional users",
    features: [
      "Access to public charging stations",
      "Basic booking functionality",
      "Mobile app access",
      "Standard customer support"
    ],
    buttonText: "Get Started",
    popular: false
  },
  {
    id: "premium",
    name: "Premium Plan",
    price: "$9.99/month",
    monthlyFee: 9.99,
    discountRate: 15,
    description: "Best value for frequent users",
    features: [
      "All Basic features",
      "15% discount on all charging",
      "Priority station access",
      "Advanced booking options",
      "Real-time station status",
      "24/7 premium support",
      "Monthly charging credits"
    ],
    buttonText: "Choose Premium",
    popular: true
  },
  {
    id: "business",
    name: "Business Plan",
    price: "$49.99/month",
    monthlyFee: 49.99,
    discountRate: 25,
    description: "Enterprise solution for fleets",
    features: [
      "All Premium features",
      "25% discount on all charging",
      "Fleet management tools",
      "Corporate dashboard",
      "Bulk booking capabilities",
      "Custom reporting",
      "Dedicated account manager",
      "API access"
    ],
    buttonText: "Contact Sales",
    popular: false
  }
];
