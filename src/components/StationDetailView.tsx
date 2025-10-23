import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  ArrowLeft, 
  Zap, 
  Clock, 
  User, 
  Wrench, 
  MapPin,
  Phone,
  Star,
  Car,
  Coffee,
  // Restroom,
  ShoppingBag,
  Info,
  Navigation
} from 'lucide-react';
import { Station, ChargingPoint } from '../data/mockDatabase';

interface StationDetailViewProps {
  station: Station;
  onBack: () => void;
  onBookChargingPoint: (station: Station, chargingPointId?: string) => void;
}

export function StationDetailView({ station, onBack, onBookChargingPoint }: StationDetailViewProps) {
  const [selectedChargingPoint, setSelectedChargingPoint] = useState<ChargingPoint | null>(null);

  const getStatusColor = (status: ChargingPoint['status']) => {
    switch (status) {
      case 'available':
        return 'bg-green-500 hover:bg-green-600';
      case 'in-use':
        return 'bg-red-500';
      case 'maintenance':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-gray-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getStatusText = (status: ChargingPoint['status']) => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'in-use':
        return 'In Use';
      case 'maintenance':
        return 'Maintenance';
      case 'offline':
        return 'Offline';
      default:
        return 'Unknown';
    }
  };

  const getFacilityIcon = (type: string) => {
    switch (type) {
      case 'restroom':
        return <Info className="w-4 h-4" />;
      case 'cafe':
        return <Coffee className="w-4 h-4" />;
      case 'shop':
        return <ShoppingBag className="w-4 h-4" />;
      case 'parking':
        return <Car className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const renderStationLayout = () => {
    const { layout, chargingPoints } = station;
    const cellSize = 60; // Size of each grid cell in pixels
    
    return (
      <div className="relative bg-gray-50 rounded-lg p-4 overflow-auto">
        <div 
          className="relative mx-auto"
          style={{ 
            width: layout.width * cellSize, 
            height: layout.height * cellSize,
            minWidth: layout.width * cellSize,
            minHeight: layout.height * cellSize
          }}
        >
          {/* Grid Background */}
          <div className="absolute inset-0 opacity-20">
            <svg width="100%" height="100%">
              <defs>
                <pattern id="layout-grid" width={cellSize} height={cellSize} patternUnits="userSpaceOnUse">
                  <path d={`M ${cellSize} 0 L 0 0 0 ${cellSize}`} fill="none" stroke="#gray" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#layout-grid)" />
            </svg>
          </div>

          {/* Facilities */}
          {layout.facilities.map((facility, index) => (
            <div
              key={index}
              className="absolute bg-blue-100 border-2 border-blue-300 rounded-lg flex items-center justify-center"
              style={{
                left: facility.x * cellSize,
                top: facility.y * cellSize,
                width: facility.width * cellSize,
                height: facility.height * cellSize
              }}
            >
              <div className="text-center">
                <div className="text-blue-600 mb-1">
                  {getFacilityIcon(facility.type)}
                </div>
                <span className="text-xs text-blue-700 capitalize">{facility.type}</span>
              </div>
            </div>
          ))}

          {/* Entrances */}
          {layout.entrances.map((entrance, index) => (
            <div
              key={index}
              className="absolute bg-green-200 border-2 border-green-400 rounded-lg flex items-center justify-center"
              style={{
                left: entrance.direction === 'west' ? -20 : entrance.direction === 'east' ? layout.width * cellSize : entrance.x * cellSize,
                top: entrance.direction === 'north' ? -20 : entrance.direction === 'south' ? layout.height * cellSize : entrance.y * cellSize,
                width: entrance.direction === 'north' || entrance.direction === 'south' ? 40 : 20,
                height: entrance.direction === 'east' || entrance.direction === 'west' ? 40 : 20
              }}
            >
              <Navigation className="w-4 h-4 text-green-600" />
            </div>
          ))}

          {/* Charging Points */}
          {chargingPoints.map((point) => (
            <div
              key={point.id}
              className={`absolute rounded-lg border-2 cursor-pointer transition-all duration-200 transform hover:scale-105 ${
                selectedChargingPoint?.id === point.id 
                  ? 'border-blue-500 z-20 scale-105' 
                  : 'border-white z-10'
              } ${getStatusColor(point.status)} ${
                point.status === 'available' ? 'hover:shadow-lg' : 'cursor-not-allowed'
              }`}
              style={{
                left: point.position.x * cellSize + 5,
                top: point.position.y * cellSize + 5,
                width: cellSize - 10,
                height: cellSize - 10
              }}
              onClick={() => point.status === 'available' && setSelectedChargingPoint(point)}
            >
              {/* Charging Point Content */}
              <div className="w-full h-full flex flex-col items-center justify-center text-white text-xs font-medium">
                <Zap className="w-4 h-4 mb-1" />
                <span>#{point.number}</span>
                <span className="text-xs">{point.powerKw}kW</span>
              </div>

              {/* Status Indicator */}
              <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-white border-2 border-current flex items-center justify-center">
                {point.status === 'available' && <div className="w-2 h-2 rounded-full bg-green-500" />}
                {point.status === 'in-use' && <User className="w-2 h-2 text-red-500" />}
                {point.status === 'maintenance' && <Wrench className="w-2 h-2 text-yellow-500" />}
                {point.status === 'offline' && <div className="w-2 h-2 rounded-full bg-gray-500" />}
              </div>

              {/* Selected Point Details */}
              {selectedChargingPoint?.id === point.id && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white rounded-lg shadow-lg p-3 min-w-48 z-30 border">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">Charging Point #{point.number}</h4>
                      <Badge className={
                        point.status === 'available' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }>
                        {getStatusText(point.status)}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex justify-between">
                        <span>Power:</span>
                        <span className="font-medium">{point.powerKw} kW</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Connector:</span>
                        <span className="font-medium">{point.connectorType}</span>
                      </div>
                      {point.currentUser && (
                        <div className="flex justify-between">
                          <span>Current User:</span>
                          <span className="font-medium">{point.currentUser}</span>
                        </div>
                      )}
                      {point.estimatedTimeRemaining && (
                        <div className="flex justify-between">
                          <span>Est. Time:</span>
                          <span className="font-medium">{point.estimatedTimeRemaining} min</span>
                        </div>
                      )}
                    </div>
                    {point.status === 'available' && (
                      <Button 
                        size="sm" 
                        className="w-full bg-green-600 hover:bg-green-700 mt-2"
                        onClick={() => onBookChargingPoint(station, point.id)}
                      >
                        Book This Point
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const availablePoints = station.chargingPoints.filter(point => point.status === 'available');
  const inUsePoints = station.chargingPoints.filter(point => point.status === 'in-use');
  const maintenancePoints = station.chargingPoints.filter(point => point.status === 'maintenance');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Map
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{station.name}</h1>
          <p className="text-gray-600">{station.address}</p>
        </div>
        <Button 
          className="bg-green-600 hover:bg-green-700"
          onClick={() => onBookChargingPoint(station)}
        >
          Book Any Available
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Station Layout */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Station Layout
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderStationLayout()}
              
              {/* Legend */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-3">Legend</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-500"></div>
                    <span>Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-red-500"></div>
                    <span>In Use</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-yellow-500"></div>
                    <span>Maintenance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-blue-100 border border-blue-300"></div>
                    <span>Facilities</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Station Info */}
        <div className="space-y-6">
          {/* Status Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Status Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Available:</span>
                  <Badge className="bg-green-100 text-green-800">
                    {availablePoints.length} points
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">In Use:</span>
                  <Badge className="bg-red-100 text-red-800">
                    {inUsePoints.length} points
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Maintenance:</span>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    {maintenancePoints.length} points
                  </Badge>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Points:</span>
                    <span className="font-bold">{station.total}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Station Details */}
          <Card>
            <CardHeader>
              <CardTitle>Station Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-green-600" />
                  <span>Power: {station.power}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>Rating: {station.rating}/5</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>{station.operatingHours}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-purple-600" />
                  <span>{station.phone}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Amenities */}
          <Card>
            <CardHeader>
              <CardTitle>Amenities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {station.amenities.map((amenity, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {amenity}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => onBookChargingPoint(station)}
                >
                  Book Now
                </Button>
                <Button variant="outline" className="w-full">
                  Get Directions
                </Button>
                <Button variant="outline" className="w-full">
                  Call Station
                </Button>
                <Button variant="outline" className="w-full">
                  Report Issue
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}