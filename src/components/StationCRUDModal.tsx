import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Station } from '../data/mockDatabase';
import { Plus, Trash2, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { createStation, updateStation } from '../api/stationApi';
import { InteractiveStationLayout } from './InteractiveStationLayout';

interface StationCRUDModalProps {
  isOpen: boolean;
  onClose: () => void;
  station?: Station | null;
  mode: 'create' | 'edit' | 'view';
  onSave: (station: Station) => void;
}

export function StationCRUDModal({ isOpen, onClose, station, mode, onSave }: StationCRUDModalProps) {
  const [formData, setFormData] = useState<Partial<Station>>({
    name: '',
    address: '',
    city: 'Hồ Chí Minh',
    state: 'VN',
    zipCode: '700000',
    lat: 10.7769,
    lng: 106.7009,
    total: 8,
    available: 8,
    powerKw: 150,
    power: '150kW',
    pricePerKwh: 5000,
    price: '5,000 VNĐ/kWh',
    connector: 'CCS, Type 2',
    operatingHours: '24/7',
    phone: '+84 28',
    network: 'ChargeTech',
    rating: 4.5,
    amenities: [],
    status: 'active',
    layout: {
      width: 6,
      height: 4,
      entrances: [],
      facilities: []
    }
  });

  const [newAmenity, setNewAmenity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Convert between Station layout facilities and InteractiveStationLayout facilities
  const convertToInteractiveFacilities = (layoutFacilities?: NonNullable<Station['layout']>['facilities']) => {
    if (!layoutFacilities) return [];
    return layoutFacilities.map((f, index) => ({
      id: `facility-${f.type}-${f.x}-${f.y}-${index}`,
      type: f.type,
      name: `${f.type.charAt(0).toUpperCase() + f.type.slice(1)} ${index + 1}`,
      pos_x: f.x * 60 + 30, // Convert grid position to pixel position (60px cell size)
      pos_y: f.y * 60 + 30,
    }));
  };

  const convertFromInteractiveFacilities = (interactiveFacilities: any[]) => {
    const converted = interactiveFacilities.map((f) => {
      const gridX = Math.round((f.pos_x - 30) / 60);
      const gridY = Math.round((f.pos_y - 30) / 60);
      
      return {
        type: f.type,
        x: Math.max(0, gridX), // Don't allow negative, but allow expanding beyond current width
        y: Math.max(0, gridY), // Don't allow negative, but allow expanding beyond current height
        width: 1,
        height: 1,
      };
    });
    
    // Auto-expand layout bounds to include all facilities
    if (converted.length > 0) {
      const maxX = Math.max(...converted.map(f => f.x));
      const maxY = Math.max(...converted.map(f => f.y));
      const currentWidth = formData.layout?.width || 12;
      const currentHeight = formData.layout?.height || 10;
      
      // Update layout bounds if facilities are outside
      if (maxX >= currentWidth || maxY >= currentHeight) {
        const newWidth = Math.max(currentWidth, maxX + 2); // Add padding
        const newHeight = Math.max(currentHeight, maxY + 2);
        
        console.log('🔧 Auto-expanding layout bounds:', {
          old: { width: currentWidth, height: currentHeight },
          new: { width: newWidth, height: newHeight },
          reason: `Facility at (${maxX}, ${maxY})`
        });
        
        setFormData(prev => ({
          ...prev,
          layout: {
            ...prev.layout!,
            width: newWidth,
            height: newHeight,
          }
        }));
      }
    }
    
    return converted;
  };

  useEffect(() => {
    if (station) {
      setFormData({
        ...station,
        layout: station.layout || {
          width: 6,
          height: 4,
          entrances: [],
          facilities: []
        }
      });
    } else {
      // Reset form for create mode
      setFormData({
        name: '',
        address: '',
        city: 'Hồ Chí Minh',
        state: 'VN',
        zipCode: '700000',
        lat: 10.7769,
        lng: 106.7009,
        total: 8,
        available: 8,
        powerKw: 150,
        power: '150kW',
        pricePerKwh: 5000,
        price: '5,000 VNĐ/kWh',
        connector: 'CCS, Type 2',
        operatingHours: '24/7',
        phone: '+84 28',
        network: 'ChargeTech',
        rating: 4.5,
        amenities: [],
        status: 'active',
        layout: {
          width: 6,
          height: 4,
          entrances: [],
          facilities: []
        }
      });
    }
  }, [station, isOpen]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddAmenity = () => {
    if (newAmenity.trim()) {
      setFormData(prev => ({
        ...prev,
        amenities: [...(prev.amenities || []), newAmenity.trim()]
      }));
      setNewAmenity('');
    }
  };

  const handleRemoveAmenity = (index: number) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities?.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    // Validation
    if (!formData.name || !formData.address) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Only send fields that match the database schema exactly
      // Database schema from create_stations_table.sql:
      // - connector_type (NOT connector)
      // - lat, lng (NOT latitude, longitude)
      // - power_kw, price_per_kwh, total_spots, available_spots, operating_hours, zip_code (snake_case)
      const updatedData: any = {
        name: formData.name,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        lat: formData.lat,
        lng: formData.lng,
        total_spots: formData.total,
        available_spots: formData.available,
        power_kw: formData.powerKw,
        connector_type: formData.connector || 'CCS',
        price_per_kwh: formData.pricePerKwh,
        operating_hours: formData.operatingHours,
        phone: formData.phone,
        network: formData.network,
        status: formData.status || 'active'
      };
      
      // Add optional fields only if they have values
      if (formData.zipCode) updatedData.zip_code = formData.zipCode;
      if (formData.rating !== undefined) updatedData.rating = formData.rating;
      if (formData.amenities) updatedData.amenities = formData.amenities;
      
      // Add layout - this is important for persisting the station layout!
      if (formData.layout) {
        updatedData.layout = formData.layout;
        console.log('💾 Layout being saved:', {
          width: formData.layout.width,
          height: formData.layout.height,
          facilitiesCount: formData.layout.facilities?.length || 0,
          facilities: formData.layout.facilities,
          facilitiesPositions: formData.layout.facilities?.map(f => ({ type: f.type, x: f.x, y: f.y }))
        });
      } else {
        console.warn('⚠️ No layout in formData!');
      }

      console.log('📤 Saving station with data:', JSON.stringify(updatedData, null, 2));

      let savedStation: Station;

      if (mode === 'create') {
        // Create new station via API
        savedStation = await createStation(updatedData);
        toast.success('Station created successfully');
      } else {
        // Update existing station via API
        savedStation = await updateStation(station!.id, updatedData);
        console.log('✅ Station updated, response:', savedStation);
        toast.success('Station updated successfully');
      }

      console.log('📞 Calling onSave with station:', savedStation);
      onSave(savedStation);
      onClose();
    } catch (error) {
      console.error('Error saving station:', error);
      toast.error(mode === 'create' ? 'Failed to create station' : 'Failed to update station');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="w-screen h-screen flex flex-col p-0 m-0" 
        style={{ maxWidth: '95vw', maxHeight: '95vh', width: '95vw', height: '95vh' }}
      >
        <div className="px-4 pt-4">
          <DialogHeader>
            <DialogTitle>
              {mode === 'create' && 'Create New Station'}
              {mode === 'edit' && 'Edit Station'}
              {mode === 'view' && 'View Station Details'}
            </DialogTitle>
            <DialogDescription>
              {mode === 'create' && 'Add a new charging station to the network with complete details and layout design.'}
              {mode === 'edit' && 'Modify station information, amenities, and layout configuration.'}
              {mode === 'view' && 'View complete station information including layout and facilities.'}
            </DialogDescription>
          </DialogHeader>
        </div>

        <Tabs defaultValue="basic" className="w-full flex-1 flex flex-col overflow-hidden px-6">
          <TabsList className="grid w-full grid-cols-3 flex-shrink-0">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="details">Details & Amenities</TabsTrigger>
            <TabsTrigger value="layout">Layout & Charging Points</TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-4 flex-1 overflow-y-auto mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Station Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={mode === 'view'}
                  placeholder="e.g., Vincom Center Charging Station"
                />
              </div>
              <div>
                <Label htmlFor="network">Network</Label>
                <Input
                  id="network"
                  value={formData.network}
                  onChange={(e) => handleInputChange('network', e.target.value)}
                  disabled={mode === 'view'}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                disabled={mode === 'view'}
                placeholder="e.g., 72 Lê Thánh Tôn, Bến Nghé, Quận 1"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  disabled={mode === 'view'}
                />
              </div>
              <div>
                <Label htmlFor="state">State/Province</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  disabled={mode === 'view'}
                />
              </div>
              <div>
                <Label htmlFor="zipCode">Zip Code</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  disabled={mode === 'view'}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lat">Latitude</Label>
                <Input
                  id="lat"
                  type="number"
                  step="0.0001"
                  value={formData.lat}
                  onChange={(e) => handleInputChange('lat', parseFloat(e.target.value))}
                  disabled={mode === 'view'}
                />
              </div>
              <div>
                <Label htmlFor="lng">Longitude</Label>
                <Input
                  id="lng"
                  type="number"
                  step="0.0001"
                  value={formData.lng}
                  onChange={(e) => handleInputChange('lng', parseFloat(e.target.value))}
                  disabled={mode === 'view'}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  disabled={mode === 'view'}
                />
              </div>
              <div>
                <Label htmlFor="hours">Operating Hours</Label>
                <Input
                  id="hours"
                  value={formData.operatingHours}
                  onChange={(e) => handleInputChange('operatingHours', e.target.value)}
                  disabled={mode === 'view'}
                />
              </div>
            </div>
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-4 flex-1 overflow-y-auto mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="total">Total Charging Points</Label>
                <Input
                  id="total"
                  type="number"
                  value={formData.total}
                  onChange={(e) => handleInputChange('total', parseInt(e.target.value))}
                  disabled={mode === 'view'}
                />
              </div>
              <div>
                <Label htmlFor="available">Available Points</Label>
                <Input
                  id="available"
                  type="number"
                  value={formData.available}
                  onChange={(e) => handleInputChange('available', parseInt(e.target.value))}
                  disabled={mode === 'view'}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="powerKw">Power (kW)</Label>
                <Input
                  id="powerKw"
                  type="number"
                  value={formData.powerKw}
                  onChange={(e) => handleInputChange('powerKw', parseInt(e.target.value))}
                  disabled={mode === 'view'}
                />
              </div>
              <div>
                <Label htmlFor="pricePerKwh">Price per kWh (VNĐ)</Label>
                <Input
                  id="pricePerKwh"
                  type="number"
                  value={formData.pricePerKwh}
                  onChange={(e) => handleInputChange('pricePerKwh', parseInt(e.target.value))}
                  disabled={mode === 'view'}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="connector">Connector Types</Label>
              <Input
                id="connector"
                value={formData.connector}
                onChange={(e) => handleInputChange('connector', e.target.value)}
                disabled={mode === 'view'}
                placeholder="e.g., CCS, Type 2, CHAdeMO"
              />
            </div>

            <div>
              <Label htmlFor="rating">Rating (1-5)</Label>
              <Input
                id="rating"
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={formData.rating}
                onChange={(e) => handleInputChange('rating', parseFloat(e.target.value))}
                disabled={mode === 'view'}
              />
            </div>

            <div>
              <Label>Amenities</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  placeholder="Add amenity..."
                  disabled={mode === 'view'}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddAmenity()}
                />
                <Button 
                  type="button" 
                  onClick={handleAddAmenity}
                  disabled={mode === 'view'}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.amenities?.map((amenity, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {amenity}
                    {mode !== 'view' && (
                      <button 
                        onClick={() => handleRemoveAmenity(index)}
                        className="ml-1 hover:text-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Layout & Charging Points Tab - Combined */}
          <TabsContent value="layout" className="space-y-4 flex-1 overflow-y-auto mt-4">
            {station?.id ? (
              <div className="space-y-6 pb-4">
                {/* Interactive Charging Points Layout */}
                <Card>
                  <CardContent className="p-0">
                    <div style={{ height: '600px' }}>
                      <InteractiveStationLayout
                        stationId={station.id}
                        stationName={station.name}
                        isReadOnly={mode === 'view'}
                        facilities={convertToInteractiveFacilities(formData.layout?.facilities || [])}
                        onFacilitiesChange={(updatedFacilities) => {
                          setFormData(prev => ({
                            ...prev,
                            layout: {
                              ...prev.layout!,
                              facilities: convertFromInteractiveFacilities(updatedFacilities)
                            }
                          }));
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Zap className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">Save Station First</h3>
                  <p className="text-gray-600 mb-4">
                    Please save the station before managing charging points and layout.
                  </p>
                  <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                    Save Station
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>


        </Tabs>

        <div className="px-6 py-4 border-t flex-shrink-0">
          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              {mode === 'view' ? 'Close' : 'Cancel'}
            </Button>
            {mode !== 'view' && (
              <Button 
                onClick={handleSave} 
                className="bg-green-600 hover:bg-green-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Station' : 'Save Changes'}
              </Button>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
