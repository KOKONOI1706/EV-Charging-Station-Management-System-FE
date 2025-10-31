import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import {
  CreditCard,
  Zap,
  Clock,
  AlertCircle,
  CheckCircle,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { PaymentMethodSelector, PaymentMethod } from './PaymentMethodSelector';
import { toast } from 'sonner';

// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: number;
  sessionData: {
    stationName: string;
    pointName: string;
    startTime: string;
    endTime: string;
    energyConsumed: number;
    duration: string; // formatted duration string like "1h 23m"
    amount: number;
    pricePerKwh: number;
  };
  onPaymentSuccess?: () => void;
}

export function PaymentModal({
  open,
  onOpenChange,
  sessionId,
  sessionData,
  onPaymentSuccess
}: PaymentModalProps) {
  console.log('🎨 PaymentModal rendered:', {
    open,
    sessionId,
    hasSessionData: !!sessionData,
    sessionData
  });

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('momo');
  const [loading, setLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      let response;
      
      // Call appropriate payment API based on selected method
      switch (selectedMethod) {
        case 'momo':
          response = await fetch(`${API_BASE_URL}/payments/momo/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              session_id: sessionId,
              amount: sessionData.amount,
              currency: 'VND',
              description: `Thanh toán phiên sạc #${sessionId} - ${sessionData.stationName}`
            })
          });
          break;
          
        case 'vnpay':
          // TODO: Implement VNPay integration
          toast.info('VNPay đang được phát triển');
          setLoading(false);
          return;
          
        case 'zalopay':
          // TODO: Implement ZaloPay integration
          toast.info('ZaloPay đang được phát triển');
          setLoading(false);
          return;
          
        case 'card':
          // TODO: Implement Card payment integration
          toast.info('Thanh toán thẻ đang được phát triển');
          setLoading(false);
          return;
          
        default:
          throw new Error('Phương thức thanh toán không hợp lệ');
      }

      const data = await response.json();

      if (data.success) {
        // For MoMo and similar e-wallets
        if (data.data.payment_url) {
          setPaymentUrl(data.data.payment_url);
          setQrCodeUrl(data.data.qrCodeUrl);
          
          // Option 1: Redirect to payment page
          // window.open(data.data.payment_url, '_blank');
          
          // Option 2: Show QR code and poll for status
          if (data.data.qrCodeUrl) {
            toast.info('Vui lòng quét mã QR để thanh toán');
            startPaymentPolling(data.data.order_id);
          } else {
            // Redirect if no QR code
            window.location.href = data.data.payment_url;
          }
        }
      } else {
        throw new Error(data.error || 'Có lỗi xảy ra khi tạo thanh toán');
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'Không thể kết nối đến cổng thanh toán');
    } finally {
      setLoading(false);
    }
  };

  // Poll payment status every 3 seconds
  const startPaymentPolling = (orderId: string) => {
    let attempts = 0;
    const maxAttempts = 40; // 2 minutes max
    
    const pollInterval = setInterval(async () => {
      attempts++;
      
      try {
        const response = await fetch(`${API_BASE_URL}/payments/momo/status/${orderId}`);
        const data = await response.json();
        
        if (data.success && data.data.status === 'Completed') {
          clearInterval(pollInterval);
          toast.success('Thanh toán thành công! 🎉');
          onPaymentSuccess?.();
          onOpenChange(false);
        } else if (data.success && data.data.status === 'Failed') {
          clearInterval(pollInterval);
          setError('Thanh toán thất bại. Vui lòng thử lại.');
        } else if (attempts >= maxAttempts) {
          clearInterval(pollInterval);
          setError('Hết thời gian chờ thanh toán. Vui lòng kiểm tra lại.');
        }
      } catch (err) {
        console.error('Poll error:', err);
      }
    }, 3000);

    // Cleanup on unmount
    return () => clearInterval(pollInterval);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <CreditCard className="w-6 h-6 text-green-600" />
            Thanh toán phiên sạc
          </DialogTitle>
          <DialogDescription className="sr-only">
            Thanh toán cho phiên sạc xe điện của bạn
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Session Summary */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-green-600" />
              Thông tin phiên sạc
            </h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Trạm sạc:</span>
                <span className="font-medium">{sessionData.stationName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Điểm sạc:</span>
                <span className="font-medium">{sessionData.pointName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Bắt đầu:</span>
                <span className="font-medium">{formatDateTime(sessionData.startTime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Kết thúc:</span>
                <span className="font-medium">{formatDateTime(sessionData.endTime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Thời gian:</span>
                <span className="font-medium flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {sessionData.duration}
                </span>
              </div>
            </div>
          </div>

          {/* Charging Details */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-green-900">Chi tiết tiêu thụ điện</h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-green-700">Điện năng sử dụng:</span>
                <span className="font-semibold text-green-900">
                  {sessionData.energyConsumed.toFixed(2)} kWh
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Đơn giá:</span>
                <span className="font-medium text-green-900">
                  {formatCurrency(sessionData.pricePerKwh)}/kWh
                </span>
              </div>
              
              <Separator className="my-2" />
              
              <div className="flex justify-between items-center">
                <span className="text-green-800 font-semibold">Tổng tiền:</span>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(sessionData.amount)}
                  </div>
                  <span className="text-xs text-green-700">
                    (Đã bao gồm VAT)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <PaymentMethodSelector
            selectedMethod={selectedMethod}
            onMethodChange={setSelectedMethod}
            disabled={loading || !!paymentUrl}
          />

          {/* QR Code Display */}
          {qrCodeUrl && !error && (
            <div className="bg-white border-2 border-green-500 rounded-lg p-6 text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-green-700">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">Quét mã QR để thanh toán</span>
              </div>
              
              <div className="bg-white p-4 rounded-lg inline-block">
                <img 
                  src={qrCodeUrl} 
                  alt="Payment QR Code"
                  className="w-64 h-64 mx-auto"
                />
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Mở ứng dụng {selectedMethod === 'momo' ? 'MoMo' : selectedMethod.toUpperCase()} và quét mã QR
                </p>
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                  <span className="text-xs text-gray-500">Đang chờ xác nhận thanh toán...</span>
                </div>
              </div>
              
              {paymentUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(paymentUrl, '_blank')}
                  className="mt-4"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Hoặc thanh toán trên trang web
                </Button>
              )}
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <Alert className="border-red-500 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          {!qrCodeUrl && (
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
                className="flex-1"
              >
                Hủy
              </Button>
              <Button
                onClick={handlePayment}
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Thanh toán {formatCurrency(sessionData.amount)}
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
