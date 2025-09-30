import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import {
  Users,
  Calendar,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Download,
  MapPin,
  Phone
} from "lucide-react";
import { Station, Booking, MockDatabaseService } from "../data/mockDatabase";
import { useLanguage } from "../hooks/useLanguage";
import { toast } from "sonner@2.0.3";

export function StaffDashboard() {
  const { t } = useLanguage();
  const [stations, setStations] = useState<Station[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [stationsData, bookingsData] = await Promise.all([
        MockDatabaseService.getStations(),
        MockDatabaseService.getUserBookings("user_001") // In real app, get all bookings
      ]);
      setStations(stationsData);
      setBookings(bookingsData);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const updateStationStatus = async (stationId: string, newStatus: string) => {
    try {
      // In real app, this would call an API
      toast.success(`Station ${newStatus} status updated`);
      loadData();
    } catch (error) {
      toast.error("Failed to update station status");
    }
  };

  const filteredStations = stations.filter(station =>
    station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    station.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const todayBookings = bookings.filter(booking => {
    const today = new Date();
    const bookingDate = new Date(booking.date);
    return bookingDate.toDateString() === today.toDateString();
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational":
        return "bg-green-100 text-green-800";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800";
      case "offline":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t.staffDashboard}</h1>
        <p className="text-gray-600">Manage stations, bookings, and customer support</p>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Stations</p>
                <p className="text-2xl font-bold">
                  {stations.filter(s => s.available > 0).length}
                </p>
              </div>
              <Zap className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Bookings</p>
                <p className="text-2xl font-bold">{todayBookings.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Stations</p>
                <p className="text-2xl font-bold">{stations.length}</p>
              </div>
              <MapPin className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Maintenance Needed</p>
                <p className="text-2xl font-bold">2</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="stations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="stations">{t.stationManagement}</TabsTrigger>
          <TabsTrigger value="bookings">{t.bookingManagement}</TabsTrigger>
          <TabsTrigger value="reports">{t.reports}</TabsTrigger>
        </TabsList>

        {/* Station Management */}
        <TabsContent value="stations">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{t.stationManagement}</CardTitle>
                <Button className="bg-green-600 hover:bg-green-700">
                  {t.addStation}
                </Button>
              </div>
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search stations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredStations.map((station) => (
                  <div key={station.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{station.name}</h3>
                        <p className="text-sm text-gray-600">{station.address}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor("operational")}>
                          {t.operational}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedStation(station)}
                        >
                          {t.edit}
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Available:</span>
                        <span className="font-medium ml-1">{station.available}/{station.total}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Power:</span>
                        <span className="font-medium ml-1">{station.power}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Rating:</span>
                        <span className="font-medium ml-1">{station.rating}/5</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Price:</span>
                        <span className="font-medium ml-1">{station.price}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Booking Management */}
        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <CardTitle>{t.bookingManagement}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking ID</TableHead>
                    <TableHead>Station</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">{booking.id}</TableCell>
                      <TableCell>{booking.station.name}</TableCell>
                      <TableCell>
                        {new Date(booking.date).toLocaleDateString()} {booking.time}
                      </TableCell>
                      <TableCell>{booking.duration}h</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports */}
        <TabsContent value="reports">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Usage Report</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Sessions Today</span>
                    <span className="font-bold">{todayBookings.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Revenue Today</span>
                    <span className="font-bold">$1,245.50</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Average Session Duration</span>
                    <span className="font-bold">2.5 hours</span>
                  </div>
                  <Button className="w-full" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    {t.generateReport}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Station Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stations.slice(0, 3).map((station) => (
                    <div key={station.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{station.name}</p>
                        <p className="text-sm text-gray-600">Utilization: 78%</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">$456.20</p>
                        <p className="text-sm text-gray-600">Today</p>
                      </div>
                    </div>
                  ))}
                  <Button className="w-full" variant="outline">
                    View All Stations
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}