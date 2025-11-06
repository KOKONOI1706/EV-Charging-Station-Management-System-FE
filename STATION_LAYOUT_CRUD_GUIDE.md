# Station Layout CRUD Implementation Guide

## Overview
This guide explains the implementation of the Station Layout CRUD (Create, Read, Update, Delete) feature that integrates with the backend API instead of using hardcoded mock data.

## Features Implemented

### 1. **Frontend Components**

#### StationCRUDModal Component
Location: `src/components/StationCRUDModal.tsx`

A comprehensive modal for managing charging station data with three tabs:

**Basic Info Tab:**
- Station name, network
- Full address (address, city, state, zip code)
- GPS coordinates (latitude, longitude)
- Contact info (phone, operating hours)

**Details Tab:**
- Charging capacity (total points, available points)
- Power specifications (kW)
- Pricing (price per kWh)
- Connector types
- Station rating
- Amenities management (add/remove)

**Layout Design Tab:**
- Grid-based layout editor (customizable width x height)
- Visual layout preview with color-coded facilities
- Facility management:
  - Types: Restroom, Cafe, Shop, Parking
  - Position controls (X, Y coordinates)
  - Size controls (width, height)
- Entrance markers (visual indicators on grid)

#### Enhanced Admin Dashboard Integration
Location: `src/components/EnhancedAdminDashboard.tsx`

Updated Station Management tab with:
- **Create Station**: Add new stations with complete layout design
- **Edit Station**: Modify existing station details and layouts
- **View Station**: Read-only view of station information
- **Delete Station**: Remove stations with confirmation prompt
- Real-time data loading from backend API
- Auto-refresh after CRUD operations

### 2. **API Layer**

#### Station API Client
Location: `src/api/stationApi.ts`

New API functions added:

```typescript
// Create a new station
createStation(stationData: Partial<Station>): Promise<Station>

// Update existing station
updateStation(id: string, stationData: Partial<Station>): Promise<Station>

// Delete a station
deleteStation(id: string): Promise<void>
```

**Key Features:**
- Automatic data transformation between frontend and backend formats
- Layout serialization (converts layout object to JSON string for database storage)
- Layout deserialization (parses JSON string from database to layout object)
- Error handling with meaningful error messages
- Type-safe API calls

### 3. **Backend Updates**

#### Database Schema Addition
Location: `src/database/add_layout_column.sql`

Added `layout` column to `stations` table:
- Type: `JSONB` (flexible JSON storage)
- Indexed with GIN index for efficient queries
- Stores complete layout configuration including:
  - Grid dimensions (width, height)
  - Facility positions and types
  - Entrance locations and directions

#### API Endpoints
Location: `src/routes/stations.js`

Existing endpoints now support layout field:
- `POST /api/stations` - Create station with layout
- `PUT /api/stations/:id` - Update station with layout
- `DELETE /api/stations/:id` - Delete station
- `GET /api/stations` - Fetch all stations with layouts
- `GET /api/stations/:id` - Fetch single station with layout

## Data Flow

### Create Station Flow
```
User fills form → StationCRUDModal
  ↓
API call: createStation()
  ↓
POST /api/stations (with layout as JSON string)
  ↓
Supabase inserts data
  ↓
Response with created station
  ↓
Dashboard refreshes list
  ↓
Success toast notification
```

### Update Station Flow
```
User selects Edit → StationCRUDModal loads station data
  ↓
User modifies form/layout
  ↓
API call: updateStation(id, data)
  ↓
PUT /api/stations/:id (with updated layout)
  ↓
Supabase updates record
  ↓
Response with updated station
  ↓
Dashboard refreshes list
  ↓
Success toast notification
```

### Delete Station Flow
```
User clicks Delete → Confirmation prompt
  ↓
User confirms
  ↓
API call: deleteStation(id)
  ↓
DELETE /api/stations/:id
  ↓
Supabase removes record
  ↓
Dashboard refreshes list
  ↓
Success toast notification
```

## Layout Data Structure

### Frontend Format (TypeScript)
```typescript
{
  width: number;          // Grid width (3-12)
  height: number;         // Grid height (3-12)
  entrances: Array<{
    x: number;           // X coordinate
    y: number;           // Y coordinate
    direction: 'north' | 'south' | 'east' | 'west';
  }>;
  facilities: Array<{
    type: 'restroom' | 'cafe' | 'shop' | 'parking';
    x: number;           // Top-left X coordinate
    y: number;           // Top-left Y coordinate
    width: number;       // Facility width (1-4)
    height: number;      // Facility height (1-4)
  }>;
}
```

### Backend Format (JSONB)
Same structure stored as JSON in PostgreSQL:
```json
{
  "width": 6,
  "height": 4,
  "entrances": [
    { "x": 3, "y": 0, "direction": "north" }
  ],
  "facilities": [
    { "type": "restroom", "x": 1, "y": 1, "width": 1, "height": 1 },
    { "type": "cafe", "x": 4, "y": 1, "width": 1, "height": 1 }
  ]
}
```

## Installation & Setup

### 1. Database Migration
Run the SQL migration to add layout column:
```sql
-- In Supabase SQL Editor, run:
-- src/database/add_layout_column.sql
```

### 2. Backend Dependencies
No new dependencies required. The implementation uses existing:
- Express.js for routing
- Supabase client for database operations
- Native JSON handling for layout serialization

### 3. Frontend Dependencies
Already included in project:
- React for UI components
- Lucide React for icons
- Sonner for toast notifications
- shadcn/ui components (Dialog, Button, Input, etc.)

### 4. Environment Configuration
Ensure these environment variables are set:

**Frontend** (`.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

**Backend** (`.env`):
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
```

## Usage Examples

### Creating a New Station
1. Navigate to Admin Dashboard
2. Click "Station Management" tab
3. Click "Add Station" button
4. Fill in Basic Info tab (name, address, coordinates)
5. Fill in Details tab (capacity, power, pricing)
6. Design layout in Layout Design tab:
   - Set grid dimensions
   - Add facilities by selecting type and position
   - Preview layout in real-time
7. Click "Create Station"
8. Station appears in list immediately

### Editing Station Layout
1. Find station in Station Management tab
2. Click "Edit" button on station card
3. Navigate to "Layout Design" tab
4. Modify grid dimensions if needed
5. Add/remove facilities:
   - Select facility type
   - Set position and size
   - Click "Add Facility to Layout"
   - Remove facilities with trash icon
6. Click "Save Changes"
7. Changes reflected immediately

### Viewing Station Details
1. Click "View Details" on any station card
2. Browse all three tabs (read-only mode)
3. View complete layout design with facilities
4. Click "Close" to exit

## API Testing

### Test Create Station
```bash
curl -X POST http://localhost:5000/api/stations \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Station",
    "address": "123 Test St",
    "city": "Test City",
    "state": "TS",
    "zip_code": "12345",
    "lat": 10.7769,
    "lng": 106.7009,
    "total_spots": 8,
    "available_spots": 8,
    "power_kw": 150,
    "connector_type": "CCS",
    "price_per_kwh": 5000,
    "layout": "{\"width\":6,\"height\":4,\"entrances\":[],\"facilities\":[]}"
  }'
```

### Test Update Station
```bash
curl -X PUT http://localhost:5000/api/stations/{station_id} \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Test Station",
    "layout": "{\"width\":8,\"height\":6,\"entrances\":[{\"x\":4,\"y\":0,\"direction\":\"north\"}],\"facilities\":[{\"type\":\"cafe\",\"x\":1,\"y\":1,\"width\":2,\"height\":2}]}"
  }'
```

### Test Delete Station
```bash
curl -X DELETE http://localhost:5000/api/stations/{station_id}
```

## Troubleshooting

### Issue: Layout not displaying correctly
**Solution**: Check that layout column exists in database:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'stations' AND column_name = 'layout';
```

### Issue: Layout data not saving
**Solution**: Verify JSON structure is valid:
```typescript
// Ensure layout is properly stringified
const layoutJson = JSON.stringify(formData.layout);
```

### Issue: API errors on create/update
**Solution**: Check backend logs and ensure:
- Supabase connection is active
- All required fields are provided
- Data types match database schema

### Issue: Modal not opening
**Solution**: Check React state management:
```typescript
// Ensure modal state is properly initialized
const [modalOpen, setModalOpen] = useState(false);
```

## Future Enhancements

1. **Drag-and-Drop Layout Editor**
   - Visual drag-and-drop for facilities
   - Real-time collision detection
   - Snap-to-grid functionality

2. **Layout Templates**
   - Pre-designed layout templates
   - Save custom layouts as templates
   - One-click template application

3. **3D Layout Visualization**
   - Three.js integration for 3D preview
   - Camera controls for better viewing
   - Export 3D models

4. **Layout Validation**
   - Ensure facilities don't overlap
   - Validate entrance accessibility
   - Check minimum spacing requirements

5. **Bulk Operations**
   - Import stations from CSV/JSON
   - Bulk update multiple stations
   - Export station data with layouts

## Support & Documentation

- **Component Documentation**: See inline JSDoc comments in source files
- **API Documentation**: Check Swagger/OpenAPI spec (if available)
- **Database Schema**: Refer to SQL migration files in `src/database/`
- **Type Definitions**: All TypeScript interfaces in `src/data/mockDatabase.ts`

## License
Part of EV Charging Station Management System - All Rights Reserved

---

**Last Updated**: November 7, 2025
**Version**: 1.0.0
**Author**: Development Team
