import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { MockDatabaseService, MOCK_USERS } from "../data/mockDatabase";
import { apiFetch } from '../lib/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import staffApi from '../lib/staffApi';
import { AuthService } from '../services/authService';
import { usersApi, User } from '../api/usersApi';
import { vehicleApi, Vehicle } from '../api/vehicleApi';
import { getStationChargingPoints } from '../api/chargingPointsApi';
import { 
  Battery, 
  Calendar, 
  Clock, 
  DollarSign, 
  MapPin, 
  Zap,
  Activity,
  CheckCircle2,
  XCircle,
  Eye,
  AlertTriangle,
  Car
} from "lucide-react";
import { toast } from "sonner";

interface ChargingSession {
  session_id: number;
  user_id: number;
  vehicle_id: number;
  point_id: number;
  booking_id: number;
  start_time: string;
  end_time: string | null;
  meter_start: number;
  meter_end: number | null;
  energy_consumed_kwh: number;
  idle_minutes: number;
  idle_fee: number;
  cost: number;
  status: string;
  users?: {
    user_id: number;
    name: string;
    email: string;
    phone?: string;
  };
  vehicles?: {
    vehicle_id: number;
    plate_number: string;
    battery_capacity_kwh: number;
  };
  charging_points?: {
    point_id: number;
    name: string;
    power_kw: number;
    stations?: {
      station_id: number;
      name: string;
      address: string;
    };
  };
  payments?: {
    payment_id: number;
    amount: number;
    status: string;
    date: string;
  };
}

interface SessionStats {
  totalSessions: number;
  activeSessions: number;
  completedSessions: number;
  totalEnergyConsumed: number;
  totalRevenue: number;
  averageSessionDuration: number;
}

interface ChargingSessionsManagementProps {
  userRole: "admin" | "staff" | "customer";
  userId?: number;
  stationId?: string; // UUID for stations table
}

interface UnpaidInvoice {
  invoice_id: number;
  user_id: number;
  session_id: number;
  total_amount: number;
  issued_at: string;
  status: 'Issued';
}

export const ChargingSessionsManagement: React.FC<ChargingSessionsManagementProps> = ({
  userRole,
  userId,
  stationId,
}) => {
  // Staff-only start session form state
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [userVehicles, setUserVehicles] = useState<Vehicle[]>([]);
  const [unpaidInvoices, setUnpaidInvoices] = useState<UnpaidInvoice[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [chargingPoints, setChargingPoints] = useState<any[]>([]);
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ChargingSession[]>([]);
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedSession, setSelectedSession] = useState<ChargingSession | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [stopSessionDialogOpen, setStopSessionDialogOpen] = useState(false);
  const [sessionToStop, setSessionToStop] = useState<ChargingSession | null>(null);

  // Use centralized apiFetch which reads VITE_API_URL and attaches token

  // Load users for staff
  useEffect(() => {
    if (userRole === "staff") {
      loadUsers();
    }
  }, [userRole]);

  // Load charging points for staff
  useEffect(() => {
    if (userRole === "staff" && stationId && stationId !== "all") {
      loadChargingPoints();
    }
  }, [userRole, stationId]);

  // Load vehicles when user is selected
  useEffect(() => {
    if (userRole === "staff" && selectedUserId) {
      loadUserVehicles(selectedUserId);
      checkUnpaidInvoices(selectedUserId);
    } else {
      setUserVehicles([]);
      setUnpaidInvoices([]);
      setSelectedVehicleId(null);
    }
  }, [selectedUserId, userRole]);

  useEffect(() => {
    // Only fetch if we have the required IDs based on role
    if (userRole === "customer" && !userId) return;
    if (userRole === "staff" && (!stationId || stationId === "all")) {
      // Staff must select a specific station
      setLoading(false);
      setSessions([]);
      setStats(null);
      return;
    }
    
    fetchSessions();
    fetchStats();
  }, [statusFilter, userRole, userId, stationId]);

  const loadUsers = async () => {
    try {
      const result = await usersApi.getUsers({ role: 'customer', limit: 100 });
      setAvailableUsers(result.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
      // Fallback to mock data
      setAvailableUsers(MOCK_USERS || []);
    }
  };

  const loadChargingPoints = async () => {
    try {
      const points = await getStationChargingPoints(stationId!);
      setChargingPoints(points || []);
      if (points && points.length > 0) {
        setSelectedPointId(String(points[0].point_id));
      }
    } catch (error) {
      console.error('Error loading charging points:', error);
      // Fallback to mock
      try {
        const points = await MockDatabaseService.getChargingPointsByStationId(stationId!);
        setChargingPoints(points || []);
        if (points && points.length > 0) setSelectedPointId(points[0].id);
      } catch (e) {
        console.error('Failed to load points', e);
      }
    }
  };

  const loadUserVehicles = async (userId: string) => {
    try {
      const vehicles = await vehicleApi.getUserVehicles(parseInt(userId));
      setUserVehicles(vehicles || []);
      if (vehicles && vehicles.length > 0) {
        setSelectedVehicleId(String(vehicles[0].vehicle_id));
      } else {
        setSelectedVehicleId(null);
      }
    } catch (error) {
      console.error('Error loading user vehicles:', error);
      setUserVehicles([]);
      setSelectedVehicleId(null);
    }
  };

  const checkUnpaidInvoices = async (userId: string) => {
    try {
      setLoadingInvoices(true);
      const invoices = await staffApi.getUnpaidInvoices(userId);
      setUnpaidInvoices(invoices || []);
    } catch (error) {
      console.error('Error checking unpaid invoices:', error);
      setUnpaidInvoices([]);
    } finally {
      setLoadingInvoices(false);
    }
  };

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        role: userRole,
        ...(statusFilter !== "all" && { status: statusFilter }),
      });

      if (userRole === "customer" && userId) {
        params.append("userId", userId.toString());
      } else if (userRole === "staff" && stationId && stationId !== "all") {
        params.append("stationId", stationId); // Already a string (UUID)
        console.log('[ChargingSessionsManagement] Fetching for station:', stationId);
      } else if (userRole === "customer" || userRole === "staff") {
        // Missing required ID, don't fetch
        console.log('[ChargingSessionsManagement] Missing required ID, userRole:', userRole, 'stationId:', stationId);
        setLoading(false);
        return;
      }

      console.log('[ChargingSessionsManagement] Fetching sessions with params:', params.toString());
      const result = await apiFetch(`/charging-sessions?${params.toString()}`, { cache: 'no-cache' } as any);
      console.log('[ChargingSessionsManagement] API response:', result);
      setSessions(result.data || result);
      console.log('[ChargingSessionsManagement] Sessions set:', (result.data?.length) || (result?.length) || 0, 'items');
    } catch (error) {
      console.error("Error fetching sessions:", error);
      toast.error("Không thể tải danh sách phiên sạc");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Only fetch if we have required IDs
      if (userRole === "customer" && !userId) return;
      if (userRole === "staff" && (!stationId || stationId === "all")) {
        console.log('[ChargingSessionsManagement] Stats: Station not selected');
        return;
      }

      const params = new URLSearchParams({ role: userRole });

      if (userRole === "customer" && userId) {
        params.append("userId", userId.toString());
      } else if (userRole === "staff" && stationId && stationId !== "all") {
        params.append("stationId", stationId); // Already a string (UUID)
      }

      console.log('[ChargingSessionsManagement] Fetching stats with params:', params.toString());
      const result = await apiFetch(`/charging-sessions/stats/summary?${params.toString()}` as any);
      console.log('[ChargingSessionsManagement] Stats response:', result);
      setStats(result.data || result);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const viewSessionDetails = (session: ChargingSession) => {
    setSelectedSession(session);
    setDetailsOpen(true);
  };

  // STAFF: Start session
  const startSession = async () => {
    if (!selectedUserId || !selectedPointId || !stationId) {
      toast.error('Vui lòng chọn khách hàng và điểm sạc');
      return;
    }

    // Check for unpaid invoices
    if (unpaidInvoices.length > 0) {
      const totalDebt = unpaidInvoices.reduce((sum, inv) => sum + inv.total_amount, 0);
      toast.error(
        `Khách hàng còn ${unpaidInvoices.length} hóa đơn chưa thanh toán (Tổng: ${formatCurrency(totalDebt)}). Vui lòng thanh toán trước khi bắt đầu phiên sạc mới.`,
        { duration: 5000 }
      );
      return;
    }

    try {
      // Try backend staff endpoint first
      const payload = {
        userId: selectedUserId as string,
        vehicleId: selectedVehicleId || '0',
        stationId: stationId as string,
        pointId: selectedPointId as string,
        meter_start: 0,
      };

      console.debug('[ChargingSessionsManagement] auth token:', AuthService.getAuthToken());
      const newSession = await staffApi.staffStartSession(payload as any);
      toast.success('Bắt đầu phiên sạc thành công');
      
      // Show session info
      if (newSession) {
        setSelectedSession(newSession);
        setDetailsOpen(true);
      }
      
      fetchSessions();
      fetchStats();
      
      // Reset form
      setSelectedUserId(null);
      setSelectedVehicleId(null);
      return;
    } catch (err: any) {
      // If backend returns business rule (unpaid invoices), surface message
      const message = err?.message || String(err);
      if (message.toLowerCase().includes('invoice') || message.toLowerCase().includes('outstanding') || message.toLowerCase().includes('nợ')) {
        toast.error(message, { duration: 5000 });
        return;
      }

      console.warn('Staff API start failed, falling back to demo:', err);
      toast.error('Không thể bắt đầu phiên sạc: ' + message);
    }
  };

  // STAFF: Stop session
  const handleStopSessionClick = async (session: ChargingSession) => {
    // Check for unpaid invoices before allowing stop
    if (session.user_id) {
      try {
        const invoices = await staffApi.getUnpaidInvoices(String(session.user_id));
        if (invoices && invoices.length > 0) {
          const totalDebt = invoices.reduce((sum: number, inv: UnpaidInvoice) => sum + inv.total_amount, 0);
          toast.error(
            `Khách hàng còn ${invoices.length} hóa đơn chưa thanh toán (Tổng: ${formatCurrency(totalDebt)}). Vui lòng thanh toán trước khi dừng phiên sạc.`,
            { duration: 5000 }
          );
          setUnpaidInvoices(invoices);
          return;
        }
        setUnpaidInvoices([]);
      } catch (error) {
        console.error('Error checking unpaid invoices:', error);
        // Continue anyway if check fails
      }
    }
    setSessionToStop(session);
    setStopSessionDialogOpen(true);
  };

  const stopSession = async () => {
    if (!sessionToStop) return;

    try {
      // Try staff backend endpoint first
      const result = await staffApi.staffStopSession({ sessionId: String(sessionToStop.session_id) } as any);
      toast.success('Dừng phiên sạc thành công');
      
      // Show session details with fees
      if (result) {
        setSelectedSession(result);
        setDetailsOpen(true);
      }
      
      setStopSessionDialogOpen(false);
      setSessionToStop(null);
      fetchSessions();
      fetchStats();
      return;
    } catch (err: any) {
      const message = err?.message || String(err);
      if (message.toLowerCase().includes('invoice') || message.toLowerCase().includes('outstanding') || message.toLowerCase().includes('nợ')) {
        toast.error(message, { duration: 5000 });
        setStopSessionDialogOpen(false);
        setSessionToStop(null);
        return;
      }

      console.error('Staff API stop failed:', err);
      toast.error('Không thể dừng phiên sạc: ' + message);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: any; icon: any }> = {
      Active: { variant: "default", icon: <Activity className="w-3 h-3 mr-1" /> },
      Completed: { variant: "secondary", icon: <CheckCircle2 className="w-3 h-3 mr-1" /> },
      Cancelled: { variant: "destructive", icon: <XCircle className="w-3 h-3 mr-1" /> },
    };

    const config = statusConfig[status] || statusConfig.Active;
    return (
      <Badge variant={config.variant} className="flex items-center w-fit">
        {config.icon}
        {status}
      </Badge>
    );
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN");
  };

  const formatDuration = (start: string, end: string | null) => {
    if (!end) return "Đang sạc...";
    const duration = new Date(end).getTime() - new Date(start).getTime();
    const minutes = Math.floor(duration / 1000 / 60);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải dữ liệu phiên sạc...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {!loading && !stats && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
            <p className="text-lg font-semibold">Chưa chọn trạm</p>
          </CardContent>
        </Card>
      )}

      {/* Staff: Start Session Form */}
      {userRole === 'staff' && stationId && stationId !== 'all' && (
        <Card>
          <CardHeader>
            <CardTitle>Bắt đầu phiên sạc</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Unpaid Invoices Warning */}
            {selectedUserId && unpaidInvoices.length > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-red-900 mb-2">
                      Cảnh báo: Khách hàng còn {unpaidInvoices.length} hóa đơn chưa thanh toán
                    </h4>
                    <div className="space-y-1 text-sm text-red-800">
                      {unpaidInvoices.map((inv) => (
                        <div key={inv.invoice_id} className="flex justify-between">
                          <span>Hóa đơn #{inv.invoice_id}</span>
                          <span className="font-medium">{formatCurrency(inv.total_amount)}</span>
                        </div>
                      ))}
                      <div className="pt-2 mt-2 border-t border-red-300 flex justify-between font-semibold">
                        <span>Tổng nợ:</span>
                        <span>{formatCurrency(unpaidInvoices.reduce((sum, inv) => sum + inv.total_amount, 0))}</span>
                      </div>
                    </div>
                    <p className="text-sm text-red-700 mt-2">
                      Không thể bắt đầu phiên sạc mới cho đến khi thanh toán hết các hóa đơn trên.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
              <div>
                <label className="block text-sm mb-1">Khách hàng *</label>
                <Select 
                  value={selectedUserId || ''} 
                  onValueChange={(v: string) => {
                    setSelectedUserId(v || null);
                    setSelectedVehicleId(null);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn khách hàng" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUsers.map(u => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name} — {u.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm mb-1">Xe</label>
                <Select 
                  value={selectedVehicleId || ''} 
                  onValueChange={(v: string) => setSelectedVehicleId(v || null)}
                  disabled={!selectedUserId || userVehicles.length === 0}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={!selectedUserId ? "Chọn khách hàng trước" : userVehicles.length === 0 ? "Không có xe" : "Chọn xe"} />
                  </SelectTrigger>
                  <SelectContent>
                    {userVehicles.map(v => (
                      <SelectItem key={v.vehicle_id} value={String(v.vehicle_id)}>
                        {v.plate_number} {v.make && v.model ? `(${v.make} ${v.model})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm mb-1">Điểm sạc *</label>
                <Select value={selectedPointId || ''} onValueChange={(v: string) => setSelectedPointId(v || null)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn điểm sạc" />
                  </SelectTrigger>
                  <SelectContent>
                    {chargingPoints.map((p: any) => {
                      const pointId = p.point_id || p.id;
                      const pointName = p.name || `#${p.number || pointId}`;
                      const connectorType = p.connector_type || p.connectorType || 'Unknown';
                      const powerKw = p.power_kw || p.powerKw || 0;
                      return (
                        <SelectItem key={pointId} value={String(pointId)}>
                          {pointName} — {connectorType} ({powerKw} kW)
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Button 
                  onClick={startSession} 
                  className="w-full"
                  disabled={!selectedUserId || !selectedPointId || unpaidInvoices.length > 0}
                >
                  Bắt đầu sạc
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics Cards */}
      {!loading && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tổng phiên sạc</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSessions}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Đang hoạt động: {stats.activeSessions}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tổng điện năng</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalEnergyConsumed.toFixed(2)} kWh
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Hoàn thành: {stats.completedSessions}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {userRole === "customer" ? "Tổng chi phí" : "Doanh thu"}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.totalRevenue)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                TB: {stats.averageSessionDuration} phút/phiên
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Active Sessions Section for Staff */}
      {userRole === 'staff' && !loading && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Phiên sạc đang hoạt động ({sessions.filter(s => s.status === 'Active').length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sessions.filter(s => s.status === 'Active').length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Không có phiên sạc đang hoạt động
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Khách hàng</TableHead>
                      <TableHead>Điểm sạc</TableHead>
                      <TableHead>Bắt đầu</TableHead>
                      <TableHead>Thời gian</TableHead>
                      <TableHead>Điện năng (kWh)</TableHead>
                      <TableHead>Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.filter(s => s.status === 'Active').map((session) => (
                      <TableRow key={session.session_id}>
                        <TableCell className="font-medium">
                          #{session.session_id}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{session.users?.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {session.users?.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-yellow-500" />
                            <div>
                              <div>{session.charging_points?.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {session.charging_points?.power_kw} kW
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {formatDateTime(session.start_time)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">
                              {formatDuration(session.start_time, session.end_time)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Battery className="w-4 h-4 text-green-500" />
                            <span className="font-medium">
                              {session.energy_consumed_kwh.toFixed(2)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="flex gap-2 items-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => viewSessionDetails(session)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleStopSessionClick(session)}
                          >
                            Dừng sạc
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Sessions Table */}
      {!loading && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {userRole === "admin" && "Tất cả phiên sạc"}
                {userRole === "staff" && "Tất cả phiên sạc"}
                {userRole === "customer" && "Lịch sử sạc của bạn"}
              </CardTitle>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="Active">Đang sạc</SelectItem>
                <SelectItem value="Completed">Hoàn thành</SelectItem>
                <SelectItem value="Cancelled">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Đang tải...</div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Chưa có phiên sạc nào
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    {userRole !== "customer" && <TableHead>Khách hàng</TableHead>}
                    <TableHead>Trạm sạc</TableHead>
                    <TableHead>Điểm sạc</TableHead>
                    <TableHead>Bắt đầu</TableHead>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Điện năng (kWh)</TableHead>
                    <TableHead>Chi phí</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Chi tiết</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((session) => (
                    <TableRow key={session.session_id}>
                      <TableCell className="font-medium">
                        #{session.session_id}
                      </TableCell>
                      {userRole !== "customer" && (
                        <TableCell>
                          <div>
                            <div className="font-medium">{session.users?.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {session.users?.email}
                            </div>
                          </div>
                        </TableCell>
                      )}
                      <TableCell>
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 mt-1 text-muted-foreground flex-shrink-0" />
                          <div>
                            <div className="font-medium">
                              {session.charging_points?.stations?.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {session.charging_points?.stations?.address}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-yellow-500" />
                          <div>
                            <div>{session.charging_points?.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {session.charging_points?.power_kw} kW
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">
                            {formatDateTime(session.start_time)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">
                            {formatDuration(session.start_time, session.end_time)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Battery className="w-4 h-4 text-green-500" />
                          <span className="font-medium">
                            {session.energy_consumed_kwh.toFixed(2)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(session.cost)}
                      </TableCell>
                      <TableCell>{getStatusBadge(session.status)}</TableCell>
                      <TableCell className="flex gap-2 items-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => viewSessionDetails(session)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {userRole === 'staff' && session.status === 'Active' && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleStopSessionClick(session)}
                          >
                            Dừng sạc
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      )}

      {/* Session Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết phiên sạc #{selectedSession?.session_id}</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về phiên sạc
            </DialogDescription>
          </DialogHeader>

          {selectedSession && (
            <div className="space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <span className="font-medium">Trạng thái:</span>
                {getStatusBadge(selectedSession.status)}
              </div>

              {/* Customer Info (for staff/admin) */}
              {userRole !== "customer" && selectedSession.users && (
                <div className="p-4 border rounded-lg space-y-2">
                  <h3 className="font-semibold">Thông tin khách hàng</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Tên: {selectedSession.users.name}</div>
                    <div>Email: {selectedSession.users.email}</div>
                    {selectedSession.users.phone && (
                      <div>SĐT: {selectedSession.users.phone}</div>
                    )}
                  </div>
                </div>
              )}

              {/* Vehicle Info */}
              {selectedSession.vehicles && (
                <div className="p-4 border rounded-lg space-y-2">
                  <h3 className="font-semibold">Thông tin xe</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Biển số: {selectedSession.vehicles.plate_number}</div>
                    <div>
                      Dung lượng pin: {selectedSession.vehicles.battery_capacity_kwh} kWh
                    </div>
                  </div>
                </div>
              )}

              {/* Station & Point Info */}
              <div className="p-4 border rounded-lg space-y-2">
                <h3 className="font-semibold">Thông tin trạm sạc</h3>
                <div className="space-y-1 text-sm">
                  <div>Trạm: {selectedSession.charging_points?.stations?.name}</div>
                  <div>Địa chỉ: {selectedSession.charging_points?.stations?.address}</div>
                  <div>
                    Điểm sạc: {selectedSession.charging_points?.name} (
                    {selectedSession.charging_points?.power_kw} kW)
                  </div>
                </div>
              </div>

              {/* Charging Details */}
              <div className="p-4 border rounded-lg space-y-2">
                <h3 className="font-semibold">Chi tiết sạc</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Bắt đầu:</span>
                    <div className="font-medium">
                      {formatDateTime(selectedSession.start_time)}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Kết thúc:</span>
                    <div className="font-medium">
                      {selectedSession.end_time
                        ? formatDateTime(selectedSession.end_time)
                        : "Đang sạc..."}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Chỉ số đầu:</span>
                    <div className="font-medium">{selectedSession.meter_start} kWh</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Chỉ số cuối:</span>
                    <div className="font-medium">
                      {selectedSession.meter_end
                        ? `${selectedSession.meter_end} kWh`
                        : "-"}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Điện năng tiêu thụ:</span>
                    <div className="font-medium text-green-600">
                      {selectedSession.energy_consumed_kwh.toFixed(2)} kWh
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Thời gian:</span>
                    <div className="font-medium">
                      {formatDuration(
                        selectedSession.start_time,
                        selectedSession.end_time
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="p-4 border rounded-lg space-y-2 bg-green-50">
                <h3 className="font-semibold text-lg">Chi phí</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Phí sạc điện:</span>
                    <span className="font-semibold text-base">
                      {formatCurrency(
                        selectedSession.cost - (selectedSession.idle_fee || 0)
                      )}
                    </span>
                  </div>
                  {selectedSession.idle_minutes > 0 && selectedSession.idle_fee > 0 && (
                    <div className="flex justify-between items-center text-orange-700 bg-orange-50 p-2 rounded">
                      <span>
                        <span className="font-medium">Phí đậu/chờ:</span>
                        <span className="text-xs ml-2">({selectedSession.idle_minutes} phút)</span>
                      </span>
                      <span className="font-semibold text-base">
                        {formatCurrency(selectedSession.idle_fee)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between pt-3 border-t-2 border-green-200 font-bold text-lg">
                    <span className="text-gray-900">Tổng cộng:</span>
                    <span className="text-green-600">
                      {formatCurrency(selectedSession.cost)}
                    </span>
                  </div>
                  {selectedSession.status === 'Completed' && (
                    <div className="pt-2 text-xs text-gray-600">
                      * Phiên sạc đã hoàn thành. Hóa đơn sẽ được tạo tự động.
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Info */}
              {selectedSession.payments && (
                <div className="p-4 border rounded-lg space-y-2">
                  <h3 className="font-semibold">Thông tin thanh toán</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Số tiền: {formatCurrency(selectedSession.payments.amount)}</div>
                    <div>
                      Trạng thái:{" "}
                      <Badge
                        variant={
                          selectedSession.payments.status === "Completed"
                            ? "secondary"
                            : "default"
                        }
                      >
                        {selectedSession.payments.status}
                      </Badge>
                    </div>
                    <div className="col-span-2">
                      Ngày TT: {formatDateTime(selectedSession.payments.date)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Stop Session Confirmation Dialog */}
      <Dialog open={stopSessionDialogOpen} onOpenChange={setStopSessionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận dừng phiên sạc</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn dừng phiên sạc này?
            </DialogDescription>
          </DialogHeader>
          {sessionToStop && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm space-y-1">
                  <div><strong>Phiên sạc:</strong> #{sessionToStop.session_id}</div>
                  <div><strong>Khách hàng:</strong> {sessionToStop.users?.name || 'N/A'}</div>
                  <div><strong>Điểm sạc:</strong> {sessionToStop.charging_points?.name || 'N/A'}</div>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => {
                  setStopSessionDialogOpen(false);
                  setSessionToStop(null);
                }}>
                  Hủy
                </Button>
                <Button variant="destructive" onClick={stopSession}>
                  Xác nhận dừng
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};