# Quick Start Guide - Interactive Layout Editor

## 🚀 Quick Implementation (5 Minutes)

### Step 1: Run Database Migration (1 min)
Open Supabase SQL Editor and execute:
```bash
database/add_position_columns.sql
```

This adds `pos_x` and `pos_y` columns to your `charging_points` table and sets default grid positions.

### Step 2: Import Component (30 sec)
In your admin dashboard or station management page:

```tsx
import { InteractiveStationLayout } from './components/InteractiveStationLayout';
```

### Step 3: Use Component (30 sec)
Replace your old charging points UI with:

```tsx
<InteractiveStationLayout
  stationId="your-station-id"
  stationName="Your Station Name"
  isReadOnly={false}  // Set true for view-only mode
/>
```

### Step 4: Test (3 min)
1. ✅ Open the page - you should see all charging points on a 2D canvas
2. ✅ Drag a point - it should move smoothly
3. ✅ Click "Save Layout" - positions saved to database
4. ✅ Refresh page - positions should persist
5. ✅ Double-click canvas - add new point form appears
6. ✅ Click a point - edit panel appears
7. ✅ Right-click a point - delete confirmation appears

**That's it! You're done!** 🎉

---

## 📋 Integration Examples

### Example 1: Replace Tab Content in Modal

```tsx
// In StationCRUDModal.tsx
import { InteractiveStationLayout } from './InteractiveStationLayout';

<TabsContent value="charging-points">
  <InteractiveStationLayout
    stationId={station?.id || ''}
    stationName={station?.name || 'Unknown Station'}
    isReadOnly={mode === 'view'}
  />
</TabsContent>
```

### Example 2: Standalone Page

```tsx
// StationLayoutPage.tsx
import { InteractiveStationLayout } from '../components/InteractiveStationLayout';
import { useParams } from 'react-router-dom';

export function StationLayoutPage() {
  const { stationId } = useParams<{ stationId: string }>();
  const [station, setStation] = useState(null);

  useEffect(() => {
    // Fetch station details
    fetchStation(stationId).then(setStation);
  }, [stationId]);

  return (
    <div className="container mx-auto p-6 h-screen">
      <InteractiveStationLayout
        stationId={stationId}
        stationName={station?.name || 'Loading...'}
      />
    </div>
  );
}
```

### Example 3: Dashboard Widget (Read-Only)

```tsx
// Dashboard.tsx
<Card className="h-96">
  <CardHeader>
    <CardTitle>Station Layout Preview</CardTitle>
  </CardHeader>
  <CardContent>
    <InteractiveStationLayout
      stationId={selectedStation.id}
      stationName={selectedStation.name}
      isReadOnly={true}  // View-only mode
    />
  </CardContent>
</Card>
```

---

## 🎮 User Controls Cheat Sheet

| Action | How To |
|--------|--------|
| **Pan canvas** | Click and drag background |
| **Zoom in/out** | Use controls OR Ctrl + scroll |
| **Move point** | Drag the colored box |
| **Edit point** | Click the edit icon on point |
| **Add point** | Double-click empty space |
| **Delete point** | Right-click point → Confirm |
| **Save positions** | Click "Save Layout" button |
| **Auto arrange** | Click "Auto Arrange" button |
| **Reset** | Click "Reset" button |
| **Fit view** | Click fit-view icon in controls |

---

## 🎨 Customization Options

### Change Colors
Edit `STATUS_COLORS` in `InteractiveStationLayout.tsx`:
```typescript
const STATUS_COLORS = {
  Available: { bg: '#10b981', border: '#059669', text: '#ffffff' },
  'In Use': { bg: '#3b82f6', border: '#2563eb', text: '#ffffff' },
  // Add your custom colors...
};
```

### Change Grid Spacing
Modify the auto-arrange function:
```typescript
const handleAutoArrange = () => {
  const arrangedNodes = nodes.map((node, index) => ({
    ...node,
    position: {
      x: (index % 5) * 250,  // Change 250 to desired spacing
      y: Math.floor(index / 5) * 200,  // Change 200 to desired spacing
    },
  }));
  setNodes(arrangedNodes);
  setHasUnsavedChanges(true);
};
```

### Change Node Size
Modify `ChargingPointNode` component:
```typescript
<div
  style={{
    // ...existing styles
    minWidth: '180px',  // Change from 160px
    padding: '16px',    // Change from 12px
  }}
>
```

---

## ⚠️ Common Issues & Solutions

### Issue: Points appear at (0, 0)
**Cause**: Database migration not run or positions are NULL.
**Fix**: Run `database/add_position_columns.sql` in Supabase.

### Issue: Can't save layout
**Cause**: Backend not updated to accept `pos_x` and `pos_y`.
**Fix**: Ensure `chargingPoints.js` includes `pos_x` and `pos_y` in PUT endpoint.

### Issue: TypeScript errors on ChargingPoint
**Cause**: Interface not updated with position fields.
**Fix**: Check `chargingPointsApi.ts` has `pos_x?: number; pos_y?: number;` in interface.

### Issue: React Flow styles broken
**Cause**: CSS import missing.
**Fix**: Verify `import 'reactflow/dist/style.css';` is at top of component.

### Issue: Double-click not working
**Cause**: Conflicting event handlers.
**Fix**: Ensure `onPaneClick` closes panels but doesn't prevent `onDoubleClick`.

---

## 📦 Component Props Reference

```typescript
interface InteractiveStationLayoutProps {
  stationId: string;        // Required: Station ID to load charging points
  stationName: string;      // Required: Display name for header
  isReadOnly?: boolean;     // Optional: Disable editing (default: false)
}
```

---

## 🔧 API Endpoints Used

- `GET /api/charging-points?station_id={id}` - Load all points
- `GET /api/charging-points/connector-types/list` - Load connector types
- `POST /api/charging-points` - Create new point
- `PUT /api/charging-points/:id` - Update point (including pos_x, pos_y)
- `DELETE /api/charging-points/:id` - Delete point

---

## ✅ Pre-Launch Checklist

- [ ] Database migration executed successfully
- [ ] Backend accepts `pos_x` and `pos_y` in PUT requests
- [ ] Frontend API interface includes `pos_x` and `pos_y`
- [ ] React Flow installed (`npm install reactflow@11.10.4`)
- [ ] Component imported correctly
- [ ] Component receives valid `stationId` prop
- [ ] Backend API is running and accessible
- [ ] CORS configured if frontend/backend on different domains
- [ ] Test drag-and-drop functionality
- [ ] Test save/load persistence
- [ ] Test add/edit/delete operations

---

## 🎓 Learn More

- **React Flow Docs**: https://reactflow.dev/
- **Full Implementation Guide**: `docs/INTERACTIVE_LAYOUT_EDITOR.md`
- **Database Schema**: `database/add_position_columns.sql`
- **Backend API**: `src/routes/chargingPoints.js`
- **Frontend API**: `src/api/chargingPointsApi.ts`

---

**Need Help?** Check the comprehensive documentation in `INTERACTIVE_LAYOUT_EDITOR.md`

**Version**: 1.0.0
**Status**: ✅ Production Ready
