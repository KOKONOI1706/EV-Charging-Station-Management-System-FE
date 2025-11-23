import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import {
  CreditCard,
  AlertCircle,
  Loader2,
  Gift
} from 'lucide-react';
import { PaymentMethodSelector, PaymentMethod } from './PaymentMethodSelector';
import { toast } from 'sonner';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

interface PackagePaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  packageData: {
    package_id: number;
    name: string;
    price: number;
    description?: string;
    duration_days?: number;
  };
  user_id: number;
  onPaymentSuccess?: () => void;
}

export function PackagePaymentModal({
  open,
  onOpenChange,
  packageData,
  user_id,
  onPaymentSuccess
}: PackagePaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('momo');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate end date from duration_days
  const getEndDate = () => {
    if (!packageData.duration_days) return null;
    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + packageData.duration_days);
    return endDate;
  };

  const endDate = getEndDate();

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      let methodId: number;

      // Map payment method to method_id
      switch (selectedMethod) {
        case 'momo':
          methodId = 1; // MoMo
          break;
        case 'vnpay':
          methodId = 2; // VNPay
          break;
        case 'zalopay':
          methodId = 3; // ZaloPay
          break;
        case 'card':
          methodId = 4; // Credit/Debit Card
          break;
        default:
          methodId = 1;
      }

      // For MoMo: initiate payment which redirects to MoMo
      if (selectedMethod === 'momo') {
        const response = await fetch(`${API_BASE_URL}/payments/momo/package/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            package_id: packageData.package_id,
            amount: packageData.price,
            user_id: user_id,
            currency: 'VND',
            description: `Thanh toán gói ${packageData.name}`,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          
          // Handle specific error for active package exists
          if (response.status === 409 && errorData.error === 'active_package_exists') {
            throw new Error(errorData.message || 'Bạn đang có gói active. Vui lòng chờ hết hạn trước khi mua gói mới.');
          }
          
          throw new Error(errorData.error || 'Không thể tạo thanh toán MoMo');
        }

        const result = await response.json();
        console.log('✅ MoMo payment response:', result);
        console.log('📊 Response structure:', {
          hasData: !!result.data,
          hasPayUrl: !!result.data?.payment_url,
          hasPayUrlAlt: !!result.data?.payUrl,
          keys: result.data ? Object.keys(result.data) : []
        });

        // Redirect to MoMo payment URL (support both payment_url and payUrl)
        const paymentUrl = result.data?.payment_url || result.data?.payUrl;
        
        if (paymentUrl) {
          console.log('🚀 Redirecting to MoMo:', paymentUrl);
          window.location.href = paymentUrl;
        } else {
          console.error('❌ No payment URL in response:', result);
          throw new Error('Không nhận được URL thanh toán từ MoMo');
        }
      } else {
        // For other methods: call purchase API directly (simulate success)
        const response = await fetch(`${API_BASE_URL}/purchase`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id,
            package_id: packageData.package_id,
            method_id: methodId,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Mua gói thất bại');
        }

        const result = await response.json();
        
        toast.success('✅ Mua gói thành công!');
        console.log('Purchase result:', result);
        
        onOpenChange(false);
        if (onPaymentSuccess) {
          onPaymentSuccess();
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Không xác định';
      console.error('Payment error:', err);
      setError(errorMsg);
      toast.error(`❌ Lỗi: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-green-600" />
            Thanh toán gói {packageData.name}
          </DialogTitle>
          <DialogDescription>
            Chọn phương thức thanh toán và hoàn tất mua gói
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Package Info */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 space-y-2 border border-green-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Gói</span>
              <span className="font-semibold text-lg">{packageData.name}</span>
            </div>
            {packageData.description && (
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-gray-700">Mô tả</span>
                <span className="text-sm text-gray-600 text-right">{packageData.description}</span>
              </div>
            )}
            {packageData.duration_days && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Thời hạn</span>
                  <span className="text-sm">{packageData.duration_days} ngày</span>
                </div>
                <div className="flex justify-between items-start gap-2">
                  <span className="text-sm font-medium text-gray-700">Ngày bắt đầu</span>
                  <span className="text-sm text-right">{formatDateTime(new Date())}</span>
                </div>
                {endDate && (
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-sm font-medium text-gray-700">Ngày kết thúc</span>
                    <span className="text-sm text-right text-green-600 font-medium">{formatDateTime(endDate)}</span>
                  </div>
                )}
              </>
            )}
            <Separator className="my-2" />
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Tổng thanh toán</span>
              <span className="text-2xl font-bold text-green-600">
                {formatCurrency(packageData.price)}
              </span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 font-medium text-gray-700">
              <CreditCard className="w-4 h-4" />
              Phương thức thanh toán
            </label>
            <PaymentMethodSelector 
              selectedMethod={selectedMethod}
              onMethodChange={setSelectedMethod}
              disabled={loading}
            />
          </div>

          {/* Error Alert */}
          {error && (
            <Alert className="border-red-500 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {/* Info Box */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>Lưu ý:</strong> Thanh toán sẽ được xử lý ngay lập tức. Gói sẽ được kích hoạt sau khi thanh toán thành công.
            </AlertDescription>
          </Alert>
        </div>

        {/* Footer */}
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button
            onClick={handlePayment}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Thanh toán {formatCurrency(packageData.price)}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
