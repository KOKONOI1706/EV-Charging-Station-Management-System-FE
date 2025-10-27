-- Supabase Database Setup for EV Charging Station Management System
-- Run these SQL commands in your Supabase SQL editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (extends auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'staff', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create stations table
CREATE TABLE IF NOT EXISTS stations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zipCode TEXT NOT NULL,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance')),
  charger_type TEXT NOT NULL,
  price_per_kwh DECIMAL(10, 4) NOT NULL,
  power_kw INTEGER NOT NULL,
  connector TEXT NOT NULL,
  amenities TEXT[] DEFAULT '{}',
  total_spots INTEGER NOT NULL DEFAULT 1,
  available_spots INTEGER NOT NULL DEFAULT 1,
  rating DECIMAL(3, 2) DEFAULT 4.0,
  network TEXT NOT NULL,
  operating_hours TEXT NOT NULL,
  phone TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create reservations table
CREATE TABLE IF NOT EXISTS reservations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  station_id UUID REFERENCES stations(id) ON DELETE CASCADE NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  duration_hours INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in-progress', 'completed', 'cancelled')),
  total_cost DECIMAL(10, 2) NOT NULL,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  payment_method TEXT,
  payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stations_location ON stations(lat, lng);
CREATE INDEX IF NOT EXISTS idx_stations_status ON stations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_station_id ON reservations(station_id);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);

-- Create update triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stations_updated_at 
  BEFORE UPDATE ON stations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at 
  BEFORE UPDATE ON reservations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO stations (name, address, city, state, zipCode, lat, lng, charger_type, price_per_kwh, power_kw, connector, amenities, total_spots, available_spots, rating, network, operating_hours, phone, image_url) VALUES
('Downtown Charging Hub', '123 Main St', 'Los Angeles', 'CA', '90210', 34.0522, -118.2437, 'fast', 0.35, 150, 'CCS, CHAdeMO', '{"WiFi", "Restrooms", "Coffee Shop", "24/7 Security"}', 8, 3, 4.8, 'ChargeTech', '24/7', '(555) 123-0001', 'https://images.unsplash.com/photo-1751355356724-7df0dda28b2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpYyUyMHZlaGljbGUlMjBjaGFyZ2luZyUyMHN0YXRpb24lMjBtb2Rlcm58ZW58MXx8fHwxNzU4Njc4NDg3fDA&ixlib=rb-4.1.0&q=80&w=1080'),

('Mall Charging Center', '456 Shopping Blvd', 'Los Angeles', 'CA', '90211', 34.0522, -118.2537, 'ultra_fast', 0.42, 250, 'CCS, Tesla', '{"Shopping Mall", "Food Court", "Parking Validation", "Covered Parking"}', 12, 6, 4.6, 'ChargeTech', '10:00 AM - 10:00 PM', '(555) 123-0002', 'https://images.unsplash.com/photo-1751355356724-7df0dda28b2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpYyUyMHZlaGljbGUlMjBjaGFyZ2luZyUyMHN0YXRpb24lMjBtb2Rlcm58ZW58MXx8fHwxNzU4Njc4NDg3fDA&ixlib=rb-4.1.0&q=80&w=1080'),

('Airport Express Station', '789 Airport Way', 'Los Angeles', 'CA', '90045', 33.9425, -118.4081, 'ultra_fast', 0.45, 350, 'CCS, CHAdeMO, Tesla', '{"Airport Access", "Valet Service", "Express Charging", "Travel Lounge"}', 20, 12, 4.9, 'ChargeTech', '24/7', '(555) 123-0003', 'https://images.unsplash.com/photo-1751355356724-7df0dda28b2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpYyUyMHZlaGljbGUlMjBjaGFyZ2luZyUyMHN0YXRpb24lMjBtb2Rlcm58ZW58MXx8fHwxNzU4Njc4NDg3fDA&ixlib=rb-4.1.0&q=80&w=1080'),

('Green Energy Station', '321 Eco Drive', 'Los Angeles', 'CA', '90212', 34.0722, -118.2437, 'fast', 0.30, 100, 'CCS, Type2', '{"Solar Powered", "EV Maintenance", "Green Certification", "Nature Trail"}', 6, 4, 4.7, 'ChargeTech', '6:00 AM - 10:00 PM', '(555) 123-0004', 'https://images.unsplash.com/photo-1751355356724-7df0dda28b2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpYyUyMHZlaGljbGUlMjBjaGFyZ2luZyUyMHN0YXRpb24lMjBtb2Rlcm58ZW58MXx8fHwxNzU4Njc4NDg3fDA&ixlib=rb-4.1.0&q=80&w=1080'),

('Highway Rest Stop', '654 Interstate Hwy', 'Los Angeles', 'CA', '90213', 34.1522, -118.2437, 'fast', 0.38, 150, 'CCS, CHAdeMO', '{"Rest Area", "Convenience Store", "Pet Area", "Truck Parking"}', 15, 8, 4.4, 'ChargeTech', '24/7', '(555) 123-0005', 'https://images.unsplash.com/photo-1751355356724-7df0dda28b2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpYyUyMHZlaGljbGUlMjBjaGFyZ2luZyUyMHN0YXRpb24lMjBtb2Rlcm58ZW58MXx8fHwxNzU4Njc4NDg3fDA&ixlib=rb-4.1.0&q=80&w=1080'),

('University Campus Station', '987 College Ave', 'Los Angeles', 'CA', '90214', 34.0722, -118.2337, 'standard', 0.25, 50, 'Type2, CCS', '{"Student Discount", "Library Access", "Study Areas", "Campus Shuttle"}', 10, 5, 4.5, 'ChargeTech', '6:00 AM - 12:00 AM', '(555) 123-0006', 'https://images.unsplash.com/photo-1751355356724-7df0dda28b2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpYyUyMHZlaGljbGUlMjBjaGFyZ2luZyUyMHN0YXRpb24lMjBtb2Rlcm58ZW58MXx8fHwxNzU4Njc4NDg3fDA&ixlib=rb-4.1.0&q=80&w=1080');

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Everyone can view stations
CREATE POLICY "Anyone can view stations" ON stations
  FOR SELECT USING (true);

-- Only staff and admin can modify stations
CREATE POLICY "Staff and admin can modify stations" ON stations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('staff', 'admin')
    )
  );

-- Users can view their own reservations
CREATE POLICY "Users can view own reservations" ON reservations
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own reservations
CREATE POLICY "Users can create own reservations" ON reservations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own reservations
CREATE POLICY "Users can update own reservations" ON reservations
  FOR UPDATE USING (auth.uid() = user_id);

-- Staff and admin can view all reservations
CREATE POLICY "Staff and admin can view all reservations" ON reservations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('staff', 'admin')
    )
  );

-- Create a function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();