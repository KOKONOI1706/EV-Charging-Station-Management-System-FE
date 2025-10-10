import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  MapPin,
  Search,
  Zap,
  Clock,
  Star,
  Navigation,
  Filter,
  Map,
  List
} from "lucide-react";
import { Station } from "../services/supabaseService";
import { StationStatusService } from "../services/stationStatusService";
import { vietnamStations } from "../data/vietnamStations";
import { ColorCodingNotification } from "./ColorCodingNotification";
import { StationMapView } from "./StationMapView";
import { StationDetailView } from "./StationDetailView";
import { useLanguage } from "../hooks/useLanguage";

interface StationFinderProps {
  onBookStation: (station: Station) => void;
}

export function StationFinder({ onBookStation }: StationFinderProps) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [stations, setStations] = useState<Station[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'list' | 'map' | 'detail'>('map'); // Default to map view for testing
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);

  useEffect(() => {
    const loadStations = async () => {
      try {
        setIsLoading(true);
        // Use Vietnam stations to focus on Thủ Đức area
        const stationData = vietnamStations;
        console.log(`🇻🇳 StationFinder loaded ${stationData.length} Vietnam stations:`, stationData.map((s: Station) => ({ name: s.name, lat: s.lat, lng: s.lng })));
        setStations(stationData);
      } catch (error) {
        console.error("Failed to load stations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStations();
  }, []);

  const handleStationSelect = (station: Station) => {
    onBookStation(station);
  };

  const handleViewDetails = (station: Station) => {
    setSelectedStation(station);
    setCurrentView('detail');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedStation(null);
  };

  const handleBookChargingPoint = (station: Station, chargingPointId?: string) => {
    // In a real app, you could pass the specific charging point ID to the booking modal
    onBookStation(station);
  };

  const filteredStations = stations.filter((station) => {
    const matchesSearch = station.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase()) ||
      station.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      selectedFilter === "all" ||
      (selectedFilter === "available" && station.available_spots > 0) ||
      (selectedFilter === "fast" && station.power_kw >= 150);
    return matchesSearch && matchesFilter;
  });

  console.log(`🔍 StationFinder filtered ${filteredStations.length} stations from ${stations.length} total`);
  
  // Debug: Show station names in browser title for debugging
  useEffect(() => {
    if (stations.length > 0) {
      document.title = `EV Stations (${stations.length}) - Vietnam Focus`;
      console.log('🎯 Station names for debugging:', stations.map(s => s.name).join(', '));
    }
  }, [stations]);

  const renderListView = () => (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Search and Filters */}
      <div className="lg:w-1/3 space-y-6">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="space-y-2">
            <label className="font-medium flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              {t.filterStations}
            </label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter("all")}
                className={
                  selectedFilter === "all"
                    ? "bg-green-600 hover:bg-green-700"
                    : ""
                }
              >
                {t.all}
              </Button>
              <Button
                variant={
                  selectedFilter === "available" ? "default" : "outline"
                }
                size="sm"
                onClick={() => setSelectedFilter("available")}
                className={
                  selectedFilter === "available"
                    ? "bg-green-600 hover:bg-green-700"
                    : ""
                }
              >
                {t.available}
              </Button>
              <Button
                variant={selectedFilter === "fast" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter("fast")}
                className={
                  selectedFilter === "fast"
                    ? "bg-green-600 hover:bg-green-700"
                    : ""
                }
              >
                {t.fastCharging}
              </Button>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Results</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Found {filteredStations.length} charging station
              {filteredStations.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Station List */}
      <div className="lg:w-2/3">
        <ColorCodingNotification />
        <div className="grid gap-6">
          {filteredStations.map((station) => (
            <Card
              key={station.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
            >
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold">{station.name}</h3>
                      <Badge
                        style={{ backgroundColor: StationStatusService.getStationDisplayStatus(station, 'Tesla Model 3').color, color: 'white' }}
                      >
                        {StationStatusService.getStationDisplayStatus(station, 'Tesla Model 3').statusText}
                      </Badge>
                    </div>

                    <div className="flex items-center text-gray-600 mb-3">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span className="text-sm">{station.address}</span>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center">
                        <Navigation className="w-4 h-4 mr-2 text-blue-600" />
                        <span>{station.distance}</span>
                      </div>
                      <div className="flex items-center">
                        <Zap className="w-4 h-4 mr-2 text-green-600" />
                        <span>{station.power}</span>
                      </div>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 mr-2 text-yellow-500" />
                        <span>{station.rating}/5 {t.rating}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-purple-600" />
                        <span>{station.available_spots}/{station.total_spots} ports</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 lg:w-48">
                    <div className="text-right lg:text-left mb-2">
                      <span className="text-2xl font-bold text-green-600">
                        {station.price}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(station)}
                        className="flex-1"
                      >
                        View Layout
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleStationSelect(station)}
                        disabled={station.available_spots === 0}
                        className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
                      >
                        {t.bookNow}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredStations.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No stations found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your search criteria or filters.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <section id="stations" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading charging stations...</p>
          </div>
        </div>
      </section>
    );
  }

  // Show station detail view
  if (currentView === 'detail' && selectedStation) {
    return (
      <section id="stations" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <StationDetailView
            station={selectedStation}
            onBack={handleBackToList}
            onBookChargingPoint={handleBookChargingPoint}
          />
        </div>
      </section>
    );
  }

  return (
    <section id="stations" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">{t.findChargingStations}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t.findChargingStationsDesc}
          </p>
        </div>

        <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as 'list' | 'map')}>
          <div className="flex justify-center mb-8">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="list" className="flex items-center gap-2">
                <List className="w-4 h-4" />
                List View
              </TabsTrigger>
              <TabsTrigger value="map" className="flex items-center gap-2">
                <Map className="w-4 h-4" />
                Map View
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="list">
            {renderListView()}
          </TabsContent>

          <TabsContent value="map">
            <StationMapView
              stations={filteredStations}
              onStationSelect={handleStationSelect}
              onViewDetails={handleViewDetails}
            />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}