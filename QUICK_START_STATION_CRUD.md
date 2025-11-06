# Quick Start Guide - Station Layout CRUD

## 🎯 How to Use the New Features

### For Administrators

#### 1. Creating a New Charging Station

1. **Login** as admin to the system
2. Navigate to **Admin Dashboard**
3. Click on the **"Station Management"** tab
4. Click the **"Add Station"** button (green button at top right)
5. Fill in the information across 3 tabs:

   **Basic Info Tab:**
   - Enter station name (required)
   - Enter full address (required)
   - Fill in city, state, zip code
   - Enter GPS coordinates (latitude/longitude)
   - Add phone number and operating hours

   **Details Tab:**
   - Set total charging points
   - Set available points
   - Enter power rating (kW)
   - Set price per kWh
   - Specify connector types (e.g., "CCS, Type 2")
   - Set rating (1-5)
   - Add amenities (WiFi, Restroom, Cafe, etc.)

   **Layout Design Tab:**
   - Set grid dimensions (width × height)
   - Add facilities:
     - Select facility type (Restroom, Cafe, Shop, Parking)
     - Set X position (0 to width-1)
     - Set Y position (0 to height-1)
     - Set size (width and height in grid units)
     - Click "Add Facility to Layout"
   - View real-time preview of the layout
   - Remove facilities if needed

6. Click **"Create Station"** button
7. ✅ Success! Your station is now live

#### 2. Editing an Existing Station

1. Go to **Station Management** tab
2. Find the station you want to edit
3. Click the **"Edit"** button on the station card
4. Make your changes in any of the 3 tabs
5. Click **"Save Changes"**
6. ✅ Station updated successfully

#### 3. Viewing Station Details

1. Go to **Station Management** tab
2. Find the station you want to view
3. Click **"View Details"** button
4. Browse through all 3 tabs (read-only mode)
5. Click **"Close"** when done

#### 4. Deleting a Station

1. Go to **Station Management** tab
2. Find the station you want to delete
3. Click the **red trash icon** button
4. Confirm the deletion in the popup
5. ✅ Station removed from system

## 📐 Understanding the Layout Grid

### Grid Coordinates
```
   0   1   2   3   4   5  (X-axis)
 ┌───┬───┬───┬───┬───┬───┐
0│   │   │   │   │   │   │
 ├───┼───┼───┼───┼───┼───┤
1│   │ R │   │   │ C │   │  R = Restroom at (1,1)
 ├───┼───┼───┼───┼───┼───┤  C = Cafe at (4,1)
2│   │   │   │   │   │   │
 ├───┼───┼───┼───┼───┼───┤
3│   │   │   │   │   │   │
 └───┴───┴───┴───┴───┴───┘
(Y-axis)
```

### Facility Colors
- 🔵 **Blue** = Restroom
- 🟠 **Orange** = Cafe
- 🟣 **Purple** = Shop
- 🟢 **Green** = Parking

### Example: Adding a Cafe
1. Select "Cafe" from facility type dropdown
2. Set X Position = 4 (column 4)
3. Set Y Position = 1 (row 1)
4. Set Width = 2 (2 grid units wide)
5. Set Height = 2 (2 grid units tall)
6. Click "Add Facility to Layout"
7. Cafe appears in orange on the preview grid

## 💡 Tips & Best Practices

### Layout Design
- **Start Simple**: Begin with a small grid (6×4) and expand if needed
- **Leave Space**: Don't fill every cell - leave room for charging points
- **Group Facilities**: Place related facilities (restroom + cafe) near each other
- **Mark Entrances**: Use entrance markers to show where drivers enter
- **Preview Often**: Check the layout preview after each change

### Station Information
- **Accurate Coordinates**: Use Google Maps to get precise GPS coordinates
- **Realistic Capacity**: Set total points based on physical space
- **Clear Amenities**: List all available facilities for drivers
- **Update Status**: Keep availability counts current

### Common Mistakes to Avoid
- ❌ Overlapping facilities (no collision detection yet)
- ❌ Facilities extending beyond grid boundaries
- ❌ Missing required fields (name, address)
- ❌ Incorrect GPS coordinates (check lat/lng range)
- ❌ Available points > Total points

## 🔍 Troubleshooting

### Problem: Can't see my new station
**Solution**: 
- Check if creation was successful (green toast notification)
- Refresh the page if needed
- Check browser console for errors

### Problem: Layout not displaying correctly
**Solution**:
- Verify facility positions are within grid bounds
- Check that X < width and Y < height
- Ensure facilities don't have negative positions

### Problem: Save button not working
**Solution**:
- Fill in all required fields (marked with *)
- Check that all numeric fields have valid numbers
- Verify internet connection for API calls

### Problem: Delete button not responding
**Solution**:
- Make sure you confirmed the deletion
- Check if you have admin permissions
- Refresh page and try again

## 🎬 Quick Demo Workflow

### Create a Sample Station
```
1. Click "Add Station"
2. Basic Info:
   - Name: "Test Charging Hub"
   - Address: "123 Main St"
   - City: "Ho Chi Minh"
   - Lat: 10.7769, Lng: 106.7009
3. Details:
   - Total Points: 8
   - Available: 8
   - Power: 150 kW
   - Price: 5000 VND/kWh
4. Layout:
   - Grid: 6×4
   - Add Restroom at (1,1) size 1×1
   - Add Cafe at (4,1) size 1×1
5. Click "Create Station"
6. ✅ Done!
```

## 📱 Access Requirements

- **Role**: Admin or Staff
- **Browser**: Modern browser (Chrome, Firefox, Safari, Edge)
- **Permissions**: Authenticated user with admin role
- **Connection**: Active internet connection

## 🆘 Getting Help

If you encounter issues:
1. Check this guide first
2. Review the detailed guide: `STATION_LAYOUT_CRUD_GUIDE.md`
3. Check browser console for error messages
4. Contact system administrator
5. Report bugs with screenshots

## 📚 Related Documentation

- **Full Implementation Guide**: `STATION_LAYOUT_CRUD_GUIDE.md`
- **Summary**: `STATION_CRUD_SUMMARY.md`
- **API Documentation**: Backend `/src/routes/stations.js`

---

**Last Updated**: November 7, 2025
**Version**: 1.0.0

Happy managing! 🎉
