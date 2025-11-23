import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import {
  Package,
  Calendar,
  Zap,
  Clock,
  AlertCircle,
  Loader2,
  XCircle,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface UserPackageCardProps {
  userId: number;
  onPackageCancelled?: () => void;
}

interface ActivePackage {
  has_active_package: boolean;
  package_name?: string;
  package_id?: number;
  start_date?: string;
  end_date?: string;
  aggregated?: {
    discount_rate?: number;
    bonus_minutes?: number;
    max_sessions?: number;
    [key: string]: any;
  };
}

export function UserPackageCard({ userId, onPackageCancelled }: UserPackageCardProps) {
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [activePackage, setActivePackage] = useState<ActivePackage | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchActivePackage();
  }, [userId]);

  const fetchActivePackage = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/benefits/active/${userId}`);
      const result = await response.json();
      
      console.log('📦 Active package response:', result);
      
      if (result.success && result.data) {
        console.log('📦 Package data:', result.data);
        setActivePackage(result.data);
      } else {
        setActivePackage(null);
      }
    } catch (err) {
      console.error('Error fetching active package:', err);
      setError('Không thể tải thông tin gói');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPackage = async () => {
    setCancelling(true);
    try {
      const response = await fetch(`${API_BASE_URL}/packages/cancel/${userId}`, {
        method: 'POST',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Không thể hủy gói');
      }

      toast.success(result.message || 'Đã hủy gói thành công');
      setShowCancelDialog(false);
      setActivePackage(null);
      
      // Callback to parent
      if (onPackageCancelled) {
        onPackageCancelled();
      }
    } catch (err: any) {
      console.error('Error cancelling package:', err);
      toast.error(err.message || 'Có lỗi xảy ra khi hủy gói');
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffMs = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!activePackage || !activePackage.has_active_package) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Gói dịch vụ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="mb-4">Bạn chưa có gói dịch vụ nào</p>
            <Button onClick={() => window.location.href = '/pricing'}>
              Xem các gói
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const daysRemaining = activePackage.end_date ? getDaysRemaining(activePackage.end_date) : 0;
  const benefits = activePackage.aggregated || {};

  console.log('📦 Package data:', activePackage);
  console.log('📦 Benefits to display:', benefits);

  // Count how many numeric benefits we have
  const numericBenefits = [
    (benefits.discount_rate || 0) > 0,
    (benefits.bonus_minutes || 0) > 0,
    (benefits.max_sessions || 0) > 0
  ].filter(Boolean).length;

  console.log('📊 Numeric benefits count:', numericBenefits);

  return (
    <>
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-green-600" />
              <CardTitle className="text-green-900">Gói đang sử dụng</CardTitle>
            </div>
            <Badge variant="default" className="bg-green-600">
              <CheckCircle className="w-3 h-3 mr-1" />
              Active
            </Badge>
          </div>
          <CardDescription className="text-green-700 font-semibold text-lg">
            {activePackage.package_name}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Package Duration */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-700 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Bắt đầu:
              </span>
              <span className="font-medium text-green-900">
                {activePackage.start_date ? formatDate(activePackage.start_date) : '-'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-700 flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Kết thúc:
              </span>
              <span className="font-medium text-green-900">
                {activePackage.end_date ? formatDate(activePackage.end_date) : '-'}
              </span>
            </div>
            
            {daysRemaining > 0 && (
              <div className="bg-green-100 rounded-lg p-3 mt-2">
                <p className="text-sm text-green-800 font-medium text-center">
                  Còn <span className="text-xl font-bold">{daysRemaining}</span> ngày
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Benefits Summary */}
          {numericBenefits > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-green-900 text-sm flex items-center gap-1">
                <Zap className="w-4 h-4" />
                Quyền lợi đang nhận:
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {(benefits.discount_rate || 0) > 0 && (
                  <div className="bg-white rounded p-2 border border-green-200">
                    <p className="text-gray-600">Giảm giá sạc</p>
                    <p className="font-bold text-green-600">{benefits.discount_rate}%</p>
                  </div>
                )}
                {(benefits.bonus_minutes || 0) > 0 && (
                  <div className="bg-white rounded p-2 border border-green-200">
                    <p className="text-gray-600">Phút miễn phí</p>
                    <p className="font-bold text-green-600">{benefits.bonus_minutes} phút</p>
                  </div>
                )}
                {(benefits.max_sessions || 0) > 0 && (
                  <div className="bg-white rounded p-2 border border-green-200">
                    <p className="text-gray-600">Phiên sạc/tháng</p>
                    <p className="font-bold text-green-600">{benefits.max_sessions} phiên</p>
                  </div>
                )}
              </div>
              
              {/* Boolean benefits as badges below */}
              <div className="flex flex-wrap gap-1 mt-2">
                {benefits.priority_support && (
                  <Badge variant="secondary" className="text-xs">
                    ⭐ Hỗ trợ ưu tiên
                  </Badge>
                )}
                {benefits.support_24_7 && (
                  <Badge variant="secondary" className="text-xs">
                    🕐 Hỗ trợ 24/7
                  </Badge>
                )}
                {benefits.booking_priority && (
                  <Badge variant="secondary" className="text-xs">
                    📅 Ưu tiên đặt lịch
                  </Badge>
                )}
                {benefits.free_start_fee && (
                  <Badge variant="secondary" className="text-xs">
                    💰 Miễn phí khởi động
                  </Badge>
                )}
                {benefits.energy_tracking && (
                  <Badge variant="secondary" className="text-xs">
                    📊 Theo dõi năng lượng
                  </Badge>
                )}
                {benefits.after_limit_discount && (
                  <Badge variant="secondary" className="text-xs">
                    🔄 Giảm giá sau hết lượt
                  </Badge>
                )}
              </div>
            </div>
          )}

          <Separator />

          {/* Cancel Button */}
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => setShowCancelDialog(true)}
            disabled={cancelling}
          >
            <XCircle className="w-4 h-4 mr-2" />
            Hủy gói
          </Button>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Lưu ý: Hủy gói sẽ dừng ngay lập tức và không được hoàn tiền
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận hủy gói</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn hủy gói <strong>{activePackage.package_name}</strong>?
              <br /><br />
              <strong className="text-red-600">Lưu ý:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li>Gói sẽ bị hủy ngay lập tức</li>
                <li>Không được hoàn lại tiền</li>
                <li>Tất cả quyền lợi sẽ bị mất</li>
                <li>Bạn có thể mua gói mới ngay sau khi hủy</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-3">
            <AlertDialogCancel disabled={cancelling} className="flex-1">
              No
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelPackage}
              disabled={cancelling}
              className="bg-red-600 hover:bg-red-700 flex-1"
            >
              {cancelling ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang hủy...
                </>
              ) : (
                "Yes"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
