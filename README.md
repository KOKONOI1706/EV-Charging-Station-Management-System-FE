# EV Charging Station Management System - Frontend

A modern React-based frontend for EV charging station management with real-time features, mapping, and payment integration.

## 🚀 Features

### Core Features
- **Station Discovery**: Interactive map with real-time station availability
- **Booking System**: Reserve charging stations with preferred time slots  
- **Payment Integration**: Support for Stripe and PayOS payment gateways
- **Real-time Updates**: Live station status and availability updates
- **Multi-language Support**: English and Vietnamese language options
- **Responsive Design**: Works on desktop, tablet, and mobile devices

### User Roles
- **Customer**: Book stations, view history, manage profile
- **Staff**: Monitor stations, manage bookings, customer support
- **Admin**: Full system management, analytics, user management

## 🛠️ Technology Stack

- **React 18** + TypeScript + Vite
- **Tailwind CSS** + shadcn/ui components
- **Supabase** - Real-time database (PostgreSQL)
- **Leaflet.js** - Interactive mapping
- **Stripe & PayOS** - Payment processing
- **Radix UI** - Accessible UI components
- **Lucide React** - Icon library
- **Sonner** - Toast notifications
- 📊 Analytics dashboards
- ⚡ Real-time booking management

## 📦 Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Stripe account (optional for payments)
- PayOS account (optional for Vietnamese payments)

### Installation Steps

1. **Clone and install dependencies**
   ```bash
   npm install
   ```

2. **Setup Supabase Database**
   - Create a new project at [supabase.com](https://supabase.com)
   - Run the SQL script `supabase-setup.sql` in your Supabase SQL editor
   - Get your project URL and anon key from Settings > API

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update your `.env` file:
   ```env
   # Supabase Configuration  
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key

   # Payment Configuration (optional)
   VITE_STRIPE_PUBLISHABLE_KEY=your-stripe-key
   VITE_PAYOS_CLIENT_ID=your-payos-id
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 🗄️ Database Setup

The `supabase-setup.sql` file creates:
- **users**: User profiles and roles
- **stations**: Charging station data with location info
- **reservations**: Booking and payment records
- **Sample data**: 6 charging stations in Los Angeles area

## 🎯 Key Components

### Services
- `supabaseService.ts` - Database operations with Supabase
- `mapService.ts` - Interactive mapping with Leaflet.js  
- `paymentService.ts` - Payment processing (Stripe/PayOS)

### Components
- `StationMap.tsx` - Interactive map with station markers
- `BookingModal.tsx` - Reservation and payment flow
- `StationFinder.tsx` - Search and filter stations

## 🔄 Migration from Mock Data

This app has been migrated to use Supabase instead of mock data:

### Changed Files
- ✅ `mockDatabase.ts` → `supabaseService.ts`
- ✅ Added real-time map integration  
- ✅ Added payment processing
- ✅ Added live station updates
- ✅ Database-driven booking system

### Key Features Added
1. **Real-time Updates**: Live station availability
2. **Interactive Maps**: Leaflet.js integration
3. **Online Payments**: Stripe and PayOS support
4. **Database Storage**: PostgreSQL with Supabase
5. **User Authentication**: Supabase Auth

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Environment Setup

The frontend expects the backend API to be running on `http://localhost:5000`.

To change this, update the API base URL in your environment configuration.

## Project Structure

```
src/
├── components/       # Reusable React components
│   ├── ui/          # Base UI components
│   └── ...
├── data/            # Mock data and services
├── hooks/           # Custom React hooks
├── contexts/        # React contexts
├── styles/          # Global styles
└── utils/           # Utility functions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build