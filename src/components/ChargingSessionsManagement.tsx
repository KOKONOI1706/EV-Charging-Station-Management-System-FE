/**
 * ===============================================================
 * CHARGING SESSIONS MANAGEMENT COMPONENT
 * ===============================================================
 * Component quản lý tất cả charging sessions (Admin/Staff/Customer)
 * 
 * Chức năng:
 * - 📋 Hiển thị table danh sách tất cả sessions
 * - 🔍 Filter theo status (All, Active, Completed, Error)
 * - 📊 Thống kê: Total sessions, active, completed, energy, revenue
 * - 👁️ Xem chi tiết session (modal)
 * - 📝 Export to CSV/Excel (TODO)
 * - 📅 Sắp xếp theo ngày
 * 
 * Roles:
 * - Admin: Xem tất cả sessions của hệ thống
 * - Staff: Xem sessions của station được assign (filter theo stationId)
 * - Customer: Xem sessions của chính mình (filter theo userId)
 * 
 * Props:
 * - userRole: 'admin' | 'staff' | 'customer'
 * - userId: ID của customer (nếu role=customer)
 * - stationId: UUID của station (nếu role=staff)
 * 
 * Statistics:
 * - totalSessions: Tổng số sessions
 * - activeSessions: Sessions đang active
 * - completedSessions: Sessions đã hoàn thành
 * - totalEnergyConsumed: Tổng kWh
 * - totalRevenue: Tổng doanh thu (VND)
 * - averageSessionDuration: Thời gian trung bình (phút)
 * 
 * Table columns:
 * - Session ID
 * - User (name, email)
 * - Vehicle (plate_number)
 * - Station (name, address)
 * - Charging Point (name, power)
 * - Energy (kWh)
 * - Cost (VND)
 * - Status (badge với màu)
 * - Start time
 * - Duration
 * - Actions (View details)
 * 
 * Detail Modal:
 * - Full session info
 * - Payment info
 * - Battery tracking (nếu có)
 * - Idle fee breakdown
 * 
 * Dependencies:
 * - Backend API: /charging-sessions
 * - Toast: Thông báo lỗi
 */

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
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
  AlertTriangle
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

export const ChargingSessionsManagement: React.FC<ChargingSessionsManagementProps> = ({
  userRole,
  userId,
  stationId,
}) => {
  const [sessions, setSessions] = useState<ChargingSession[]>([]);
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedSession, setSelectedSession] = useState<ChargingSession | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const API_URL = "http://localhost:5000/api";

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

      const url = `${API_URL}/charging-sessions?${params}`;
      console.log('[ChargingSessionsManagement] Fetching URL:', url);
      
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch sessions");

      const result = await response.json();
      console.log('[ChargingSessionsManagement] API response:', result);
      
      setSessions(result.data || result);
      console.log('[ChargingSessionsManagement] Sessions set:', result.data?.length || 0, 'items');
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

      const url = `${API_URL}/charging-sessions/stats/summary?${params}`;
      console.log('[ChargingSessionsManagement] Fetching stats URL:', url);
      
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch stats");

      const result = await response.json();
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

      {/* Sessions Table */}
      {!loading && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {userRole === "admin" && "Tất cả phiên sạc"}
                {userRole === "staff" && "Phiên sạc tại trạm"}
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
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => viewSessionDetails(session)}
                        >
                          <Eye className="w-4 h-4" />
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
              <div className="p-4 border rounded-lg space-y-2">
                <h3 className="font-semibold">Chi phí</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Phí sạc điện:</span>
                    <span className="font-medium">
                      {formatCurrency(
                        selectedSession.cost - selectedSession.idle_fee
                      )}
                    </span>
                  </div>
                  {selectedSession.idle_minutes > 0 && (
                    <div className="flex justify-between text-orange-600">
                      <span>Phí chờ ({selectedSession.idle_minutes} phút):</span>
                      <span className="font-medium">
                        {formatCurrency(selectedSession.idle_fee)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t font-semibold text-base">
                    <span>Tổng cộng:</span>
                    <span className="text-green-600">
                      {formatCurrency(selectedSession.cost)}
                    </span>
                  </div>
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
    </div>
  );
};