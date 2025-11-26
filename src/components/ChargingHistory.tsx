/**
 * ===============================================================
 * CHARGING HISTORY COMPONENT
 * ===============================================================
 * Hiển thị lịch sử các phiên sạc đã hoàn thành của user
 * 
 * Chức năng:
 * - 📃 Hiển thị danh sách sessions status=Completed
 * - 📊 Thống kê: Energy consumed, chi phí, thời gian
 * - 📄 Xem hóa đơn (invoice) cho mỗi session
 * - 🖨️ In hóa đơn (print invoice)
 * - 📥 Tải hóa đơn (download PDF - TODO)
 * - 📍 Hiển thị station name, address
 * - ⏱️ Thời gian sạc (start_time → end_time)
 * 
 * Props:
 * - limit: Số sessions hiển thị (default 10)
 * 
 * Data fields:
 * - session_id: ID phiên sạc
 * - energy_consumed_kwh: Số kWh đã sạc
 * - cost: Tổng chi phí (VND)
 * - idle_fee: Phí idle (nếu có)
 * - start_time, end_time: Thời gian bắt đầu/kết thúc
 * - charging_points: Thông tin điểm sạc + station
 * - vehicles: Thông tin xe (biển số)
 * - invoice: Hóa đơn (invoice_id, total_amount, status)
 * 
 * Invoice Modal:
 * - Hiển thị chi tiết hóa đơn
 * - Thông tin trạm, thời gian, energy, giá
 * - Nút Print và Download
 * - Auto fetch/create invoice từ backend
 * 
 * Status colors:
 * - Completed: Green
 * - Active: Blue
 * - Error: Red
 * 
 * Dependencies:
 * - chargingSessionApi: Lấy sessions và invoices
 * - useAuth: Lấy current user
 * - Dialog: Modal hiển thị invoice
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  History,
  Battery,
  Clock,
  DollarSign,
  MapPin,
  Calendar,
  ChevronRight,
  Loader2,
  FileText,
  Download,
  Printer,
  Zap,
} from 'lucide-react';
import { chargingSessionApi, ChargingSession } from '../api/chargingSessionApi';
import { useAuth } from '../contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

interface ChargingHistoryProps {
  limit?: number;
}

export function ChargingHistory({ limit = 10 }: ChargingHistoryProps) {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ChargingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [selectedSession, setSelectedSession] = useState<ChargingSession | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchHistory = async () => {
      try {
        const userId = parseInt(user.id);
        const result = await chargingSessionApi.getSessions({
          user_id: userId,
          status: 'Completed',
          limit,
          offset: 0,
        });
        setSessions(result.sessions);
        setTotal(result.total);
      } catch (err) {
        console.error('Error fetching charging history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user, limit]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Active':
        return 'bg-blue-100 text-blue-800';
      case 'Error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewInvoice = async (session: ChargingSession) => {
    setSelectedSession(session);
    setIsInvoiceOpen(true);
    
    // Try to get or create invoice from backend
    try {
      const invoice = await chargingSessionApi.getOrCreateInvoice(session.session_id);
      // Update session with invoice data
      setSelectedSession({
        ...session,
        invoice: invoice,
      });
    } catch (error) {
      console.error('Failed to get invoice:', error);
      // Still show the modal with session data, but without real invoice_id
    }
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const handleDownloadInvoice = () => {
    // In production, this would generate a PDF
    alert('Tính năng tải về hóa đơn sẽ sớm được triển khai');
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          <span className="ml-3 text-gray-600">Loading history...</span>
        </CardContent>
      </Card>
    );
  }

  if (sessions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Charging History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No charging history yet</p>
            <p className="text-sm text-gray-400 mt-2">
              Your completed charging sessions will appear here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Charging History
          </CardTitle>
          {total > sessions.length && (
            <Button variant="link" size="sm">
              View All ({total})
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sessions.map((session) => {
            const station = session.charging_points?.stations;
            const duration = chargingSessionApi.formatDuration(
              session.start_time,
              session.end_time
            );

            return (
              <div
                key={session.session_id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">
                      {station?.name || 'Unknown Station'}
                    </h3>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-1" />
                      {station?.address || 'N/A'}
                    </div>
                  </div>
                  <Badge className={getStatusColor(session.status)}>
                    {session.status}
                  </Badge>
                </div>

                {/* Session Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {/* Date & Time */}
                  <div className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    <div>
                      <p className="text-gray-500 text-xs">Ngày</p>
                      <p className="font-medium">
                        {new Date(session.start_time).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: '2-digit',
                        })}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(session.start_time).toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="flex items-center text-sm">
                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                    <div>
                      <p className="text-gray-500 text-xs">Thời lượng</p>
                      <p className="font-medium">{duration}</p>
                      {session.end_time && (
                        <p className="text-xs text-gray-400">
                          {new Date(session.end_time).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Battery Progress (NEW) */}
                  {session.initial_battery_percent !== null && session.initial_battery_percent !== undefined && (
                    <div className="flex items-center text-sm">
                      <Battery className="w-4 h-4 mr-2 text-blue-600" />
                      <div>
                        <p className="text-gray-500 text-xs">Mức pin</p>
                        <p className="font-medium">
                          {session.initial_battery_percent.toFixed(0)}% → {session.target_battery_percent || 100}%
                        </p>
                        <p className="text-xs text-gray-400">
                          +{((session.target_battery_percent || 100) - session.initial_battery_percent).toFixed(0)}%
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Energy */}
                  <div className="flex items-center text-sm">
                    <Battery className="w-4 h-4 mr-2 text-green-600" />
                    <div>
                      <p className="text-gray-500 text-xs">Điện năng</p>
                      <p className="font-medium">
                        {session.energy_consumed_kwh !== null && session.energy_consumed_kwh !== undefined
                          ? session.energy_consumed_kwh.toFixed(1)
                          : (session.meter_end && session.meter_start
                              ? (session.meter_end - session.meter_start).toFixed(1)
                              : '0.0')} kWh
                      </p>
                      {session.vehicles?.battery_capacity_kwh && (
                        <p className="text-xs text-gray-400">
                          / {session.vehicles.battery_capacity_kwh} kWh
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Cost */}
                  <div className="flex items-center text-sm">
                    <DollarSign className="w-4 h-4 mr-2 text-purple-600" />
                    <div>
                      <p className="text-gray-500 text-xs">Chi phí</p>
                      <p className="font-medium">
                        {chargingSessionApi.formatCost(session.cost)}
                      </p>
                      {session.charging_points?.stations?.price_per_kwh && (
                        <p className="text-xs text-gray-400">
                          {chargingSessionApi.formatCost(session.charging_points.stations.price_per_kwh)}/kWh
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Session Details */}
                <div className="border-t pt-3 space-y-1 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Điểm sạc</span>
                    <span className="font-medium">
                      {session.charging_points?.name || `Point #${session.point_id}`} • {session.charging_points?.power_kw || 0} kW
                    </span>
                  </div>
                  {session.vehicles && (
                    <div className="flex justify-between">
                      <span>Xe</span>
                      <span className="font-medium">
                        {session.vehicles.plate_number}
                        {session.vehicles.battery_capacity_kwh && (
                          <span className="text-gray-400 ml-1">
                            ({session.vehicles.battery_capacity_kwh} kWh)
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                  {/* Meter Readings (NEW) */}
                  <div className="flex justify-between">
                    <span>Công tơ</span>
                    <span className="font-medium">
                      {session.meter_start.toFixed(2)} kWh → {session.meter_end?.toFixed(2) || 'N/A'} kWh
                    </span>
                  </div>
                  {/* Average Charging Rate (NEW) */}
                  {session.energy_consumed_kwh > 0 && duration && (
                    <div className="flex justify-between">
                      <span>Tốc độ TB</span>
                      <span className="font-medium text-green-600">
                        {(() => {
                          const durationMatch = duration.match(/(\d+)h\s*(\d+)m|(\d+)m/);
                          if (durationMatch) {
                            const hours = parseInt(durationMatch[1] || '0');
                            const minutes = parseInt(durationMatch[2] || durationMatch[3] || '0');
                            const totalHours = hours + minutes / 60;
                            const avgRate = totalHours > 0 ? session.energy_consumed_kwh / totalHours : 0;
                            return `${avgRate.toFixed(1)} kW`;
                          }
                          return 'N/A';
                        })()}
                      </span>
                    </div>
                  )}
                  {session.idle_minutes > 0 && (
                    <div className="flex justify-between text-orange-600">
                      <span>Thời gian chờ</span>
                      <span className="font-medium">
                        {session.idle_minutes} phút (+{chargingSessionApi.formatCost(session.idle_fee)})
                      </span>
                    </div>
                  )}
                  {/* Session ID for reference */}
                  <div className="flex justify-between text-gray-400">
                    <span>Mã phiên</span>
                    <span className="font-mono">#{session.session_id}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleViewInvoice(session)}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Xem hóa đơn
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="group-hover:bg-gray-100"
                    title="Xem chi tiết"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        {sessions.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {sessions.length}
                </p>
                <p className="text-xs text-gray-600">Sessions</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {sessions
                    .reduce((sum, s) => sum + s.energy_consumed_kwh, 0)
                    .toFixed(1)}
                </p>
                <p className="text-xs text-gray-600">Total kWh</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  {chargingSessionApi.formatCost(
                    sessions.reduce((sum, s) => sum + s.cost, 0)
                  )}
                </p>
                <p className="text-xs text-gray-600">Total Spent</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      {/* Invoice Dialog */}
      <Dialog open={isInvoiceOpen} onOpenChange={setIsInvoiceOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Hóa Đơn Sạc Xe Điện
            </DialogTitle>
          </DialogHeader>

          {selectedSession && (
            <div className="space-y-6">
              {/* Invoice Header */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">ChargeTech</h2>
                    <p className="text-sm text-gray-600">Hệ thống sạc xe điện thông minh</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">Mã hóa đơn</p>
                    <p className="text-lg font-mono font-bold">
                      {selectedSession.invoice 
                        ? chargingSessionApi.formatInvoiceNumber(selectedSession.invoice.invoice_id)
                        : `INV-${String(selectedSession.session_id).padStart(6, '0')}`
                      }
                    </p>
                    <Badge className={getStatusColor(selectedSession.status)}>
                      {selectedSession.status}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 mb-1">Khách hàng</p>
                    <p className="font-semibold">{user?.name || 'N/A'}</p>
                    <p className="text-gray-600">{user?.email || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-600 mb-1">Ngày phát hành</p>
                    <p className="font-semibold">
                      {new Date(selectedSession.invoice?.issued_at || selectedSession.start_time).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </p>
                    <p className="text-gray-600">
                      {new Date(selectedSession.invoice?.issued_at || selectedSession.start_time).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Station Information */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Thông tin trạm sạc
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tên trạm:</span>
                    <span className="font-medium">{selectedSession.charging_points?.stations?.name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Địa chỉ:</span>
                    <span className="font-medium text-right max-w-xs">{selectedSession.charging_points?.stations?.address || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Điểm sạc:</span>
                    <span className="font-medium">{selectedSession.charging_points?.name || `Point #${selectedSession.point_id}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Công suất:</span>
                    <span className="font-medium text-green-600">{selectedSession.charging_points?.power_kw || 0} kW</span>
                  </div>
                </div>
              </div>

              {/* Vehicle Information */}
              {selectedSession.vehicles && (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Thông tin xe
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Biển số:</span>
                      <span className="font-medium">{selectedSession.vehicles.plate_number}</span>
                    </div>
                    {selectedSession.vehicles.battery_capacity_kwh && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Dung lượng pin:</span>
                        <span className="font-medium">{selectedSession.vehicles.battery_capacity_kwh} kWh</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Charging Details */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Battery className="w-4 h-4" />
                  Chi tiết phiên sạc
                </h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-gray-600 text-xs">Bắt đầu</p>
                        <p className="font-medium">
                          {new Date(selectedSession.start_time).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-gray-600 text-xs">Kết thúc</p>
                        <p className="font-medium">
                          {selectedSession.end_time 
                            ? new Date(selectedSession.end_time).toLocaleString('vi-VN')
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-gray-600 text-xs">Thời lượng</p>
                        <p className="font-medium">
                          {chargingSessionApi.formatDuration(
                            selectedSession.start_time,
                            selectedSession.end_time
                          )}
                        </p>
                      </div>
                    </div>
                    {selectedSession.initial_battery_percent !== null && selectedSession.initial_battery_percent !== undefined && (
                      <div className="flex items-center gap-2">
                        <Battery className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="text-gray-600 text-xs">Mức pin</p>
                          <p className="font-medium">
                            {selectedSession.initial_battery_percent.toFixed(0)}% → {selectedSession.target_battery_percent || 100}%
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Công tơ bắt đầu:</span>
                      <span className="font-medium">{selectedSession.meter_start.toFixed(2)} kWh</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Công tơ kết thúc:</span>
                      <span className="font-medium">{selectedSession.meter_end?.toFixed(2) || 'N/A'} kWh</span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold text-green-700">
                      <span>Điện năng tiêu thụ:</span>
                      <span>{selectedSession.energy_consumed_kwh.toFixed(2)} kWh</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="border rounded-lg p-4 bg-gradient-to-br from-purple-50 to-pink-50">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Chi phí chi tiết
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Điện năng tiêu thụ:</span>
                    <span>{selectedSession.energy_consumed_kwh.toFixed(2)} kWh</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Đơn giá:</span>
                    <span>{chargingSessionApi.formatCost(selectedSession.charging_points?.stations?.price_per_kwh || 0)}/kWh</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b">
                    <span className="text-gray-600">Phí sạc:</span>
                    <span className="font-medium">
                      {chargingSessionApi.formatCost(
                        selectedSession.energy_consumed_kwh * (selectedSession.charging_points?.stations?.price_per_kwh || 0)
                      )}
                    </span>
                  </div>
                  
                  {selectedSession.idle_fee > 0 && (
                    <>
                      <div className="flex justify-between text-orange-600">
                        <span>Phí chờ ({selectedSession.idle_minutes} phút):</span>
                        <span>+{chargingSessionApi.formatCost(selectedSession.idle_fee)}</span>
                      </div>
                      <div className="border-b pb-2"></div>
                    </>
                  )}
                  
                  <div className="flex justify-between text-lg font-bold text-purple-700 pt-2">
                    <span>Tổng cộng:</span>
                    <span>{chargingSessionApi.formatCost(selectedSession.cost)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handlePrintInvoice}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  In hóa đơn
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleDownloadInvoice}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Tải xuống PDF
                </Button>
              </div>

              {/* Footer */}
              <div className="text-center text-xs text-gray-500 pt-4 border-t">
                <p>Cảm ơn bạn đã sử dụng dịch vụ ChargeTech!</p>
                <p className="mt-1">Mọi thắc mắc vui lòng liên hệ: support@chargetech.com | 1-800-CHARGE</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
