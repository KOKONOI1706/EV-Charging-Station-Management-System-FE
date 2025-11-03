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
  BarChart3,
} from 'lucide-react';
import { chargingSessionApi, ChargingSession } from '../api/chargingSessionApi';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ChargingHistoryProps {
  limit?: number;
}

export function ChargingHistory({ limit = 10 }: ChargingHistoryProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<ChargingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

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
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/personal-report')}
              className="flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              Personal Report
            </Button>
            {total > sessions.length && (
              <Button 
                variant="link" 
                size="sm"
                onClick={() => navigate('/user-history')}
              >
                View All ({total})
              </Button>
            )}
          </div>
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
                      <p className="text-gray-500 text-xs">Date</p>
                      <p className="font-medium">
                        {new Date(session.start_time).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="flex items-center text-sm">
                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                    <div>
                      <p className="text-gray-500 text-xs">Duration</p>
                      <p className="font-medium">{duration}</p>
                    </div>
                  </div>

                  {/* Energy */}
                  <div className="flex items-center text-sm">
                    <Battery className="w-4 h-4 mr-2 text-green-600" />
                    <div>
                      <p className="text-gray-500 text-xs">Energy</p>
                      <p className="font-medium">
                        {session.energy_consumed_kwh.toFixed(1)} kWh
                      </p>
                    </div>
                  </div>

                  {/* Cost */}
                  <div className="flex items-center text-sm">
                    <DollarSign className="w-4 h-4 mr-2 text-purple-600" />
                    <div>
                      <p className="text-gray-500 text-xs">Cost</p>
                      <p className="font-medium">
                        {chargingSessionApi.formatCost(session.cost)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Session Details */}
                <div className="border-t pt-3 space-y-1 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Charging Point</span>
                    <span className="font-medium">
                      {session.charging_points?.name || `Point #${session.point_id}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Power</span>
                    <span className="font-medium">
                      {session.charging_points?.power_kw || 0} kW
                    </span>
                  </div>
                  {session.vehicles && (
                    <div className="flex justify-between">
                      <span>Vehicle</span>
                      <span className="font-medium">
                        {session.vehicles.plate_number}
                      </span>
                    </div>
                  )}
                  {session.idle_minutes > 0 && (
                    <div className="flex justify-between text-orange-600">
                      <span>Idle Time</span>
                      <span className="font-medium">
                        {session.idle_minutes} min (+{chargingSessionApi.formatCost(session.idle_fee)})
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    View Receipt
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="group-hover:bg-gray-100"
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
            <div className="mt-4 text-center">
              <Button 
                variant="outline" 
                onClick={() => navigate('/personal-report')}
                className="flex items-center gap-2 mx-auto"
              >
                <BarChart3 className="w-4 h-4" />
                View Detailed Report
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
