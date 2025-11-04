import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'pending' | 'completed' | 'failed' | 'error' | 'not_found'>('pending');
  const [message, setMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(3);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const manualUpdateDone = useRef<boolean>(false);

  useEffect(() => {
    const orderId = searchParams.get('orderId');
    const resultCode = searchParams.get('resultCode');
    const amount = searchParams.get('amount');
    const message = searchParams.get('message');

    console.log('🎯 Callback URL params:', { orderId, resultCode, amount, message });

    // Basic quick UX: if resultCode is present and indicates failure, show message
    if (resultCode && resultCode !== '0') {
      setStatus('failed');
      setMessage(`Thanh toán không thành công. ${message || 'Vui lòng thử lại.'}`);
      return;
    }

    if (!orderId) {
      setStatus('error');
      setMessage('Không có orderId trong tham số URL.');
      return;
    }

    // Try to verify status with backend endpoint
    const verify = async () => {
      try {
        console.log(`🔍 Verifying payment for orderId: ${orderId} (attempt ${retryCount + 1})`);
        
        // 🚨 WORKAROUND: If resultCode=0 (success from MoMo) but backend hasn't received IPN yet,
        // manually update the payment status to Completed (ONLY ONCE!)
        if (resultCode === '0' && !manualUpdateDone.current) {
          console.log('💡 MoMo returned success (resultCode=0), updating payment status manually...');
          manualUpdateDone.current = true; // Mark as done to prevent re-calling
          
          try {
            const updateRes = await fetch(`${API_BASE_URL}/payments/momo/manual-complete`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderId, resultCode, amount, message })
            });
            
            if (updateRes.ok) {
              const updateData = await updateRes.json();
              console.log('✅ Payment manually updated to Completed:', updateData);
            } else {
              const errorData = await updateRes.json();
              console.error('❌ Failed to update payment:', errorData);
            }
          } catch (err) {
            console.error('⚠️ Failed to manually update payment:', err);
          }
          
          // Wait 1 second before checking status to let DB update
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        const res = await fetch(`${API_BASE_URL}/payments/momo/status/${encodeURIComponent(orderId)}`);
        
        console.log('📡 API Response status:', res.status);
        
        if (res.status === 404) {
          setStatus('not_found');
          setMessage('Thanh toán chưa được xử lý bởi backend. Đang chờ IPN từ MoMo...');
          setDebugInfo({ orderId, status: 404, note: 'Payment record not found in database' });
          
          // Auto-retry after 3 seconds if not found (max 5 attempts)
          if (retryCount < 5) {
            setTimeout(() => {
              setRetryCount(retryCount + 1);
              verify();
            }, 3000);
          }
          return;
        }

        const data = await res.json();
        console.log('📦 API Response data:', data);
        
        setDebugInfo({ orderId, response: data });
        
        if (!data.success) {
          setStatus('error');
          setMessage(data.error || 'Không thể xác minh thanh toán.');
          return;
        }

        const st = data.data?.status;
        console.log('💳 Payment status:', st);
        
        if (st === 'Completed') {
          setStatus('completed');
          setMessage(`Thanh toán thành công (${amount || ''} VND). Cảm ơn bạn!`);
          
          // ✅ Backend automatically marks session as 'Completed' when payment succeeds
          // No need to call stopSession() here anymore
          console.log('✅ Payment completed! Session automatically updated by backend.');
          
          // Show success toast
          toast.success('🎉 Thanh toán thành công!', {
            description: 'Bạn sẽ được chuyển về dashboard sau 3 giây...'
          });
          
          // Countdown and redirect to dashboard after 3 seconds
          let timeLeft = 3;
          setCountdown(timeLeft);
          
          const countdownInterval = setInterval(() => {
            timeLeft--;
            setCountdown(timeLeft);
            
            if (timeLeft <= 0) {
              clearInterval(countdownInterval);
              navigate('/dashboard');
            }
          }, 1000);
          
          return () => clearInterval(countdownInterval);
        } else if (st === 'Pending') {
          console.log('⏳ Payment still pending, will retry...');
          setStatus('pending');
          setMessage(`Thanh toán đang chờ xử lý (lần thử ${retryCount + 1}/10)...`);
          
          // Auto-retry after 3 seconds if still pending (max 10 attempts = 30 seconds)
          if (retryCount < 10) {
            setTimeout(() => {
              setRetryCount(retryCount + 1);
              verify();
            }, 3000);
          } else {
            setStatus('error');
            setMessage('Thanh toán đang chờ quá lâu. Vui lòng kiểm tra lại trong lịch sử giao dịch.');
          }
        } else if (st === 'Failed') {
          setStatus('failed');
          setMessage('Thanh toán thất bại hoặc bị hủy.');
        } else {
          setStatus('error');
          setMessage(`Trạng thái không xác định: ${st}`);
        }
      } catch (err: any) {
        console.error('Verify error:', err);
        setStatus('error');
        setMessage('Lỗi khi liên hệ máy chủ để xác minh thanh toán.');
      }
    };

    verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]); // ✅ REMOVED retryCount to prevent infinite loop

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-xl w-full bg-white shadow rounded p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Kết quả thanh toán</h2>

        {status === 'pending' && (
          <div>
            <div className="mb-4">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-700 mb-2 font-semibold">{message || 'Đang xác minh thanh toán...'}</p>
              <p className="text-sm text-gray-500">MoMo đang xử lý giao dịch của bạn</p>
            </div>
            
            {debugInfo && (
              <div className="bg-gray-100 rounded p-3 text-left text-xs mb-4">
                <p className="font-semibold mb-1">Debug Info:</p>
                <p>Order ID: {debugInfo.orderId}</p>
                {debugInfo.response && (
                  <p>Status: {debugInfo.response.data?.status || 'N/A'}</p>
                )}
              </div>
            )}
            
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Nếu thanh toán không cập nhật sau 30 giây:
              </p>
              <div className="flex gap-2 justify-center">
                <button 
                  onClick={() => window.location.reload()} 
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  Làm mới trang
                </button>
                <Link
                  to="/dashboard"
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm inline-block"
                >
                  Về Dashboard
                </Link>
              </div>
            </div>
          </div>
        )}

        {status === 'completed' && (
          <div>
            <div className="mb-4">
              <svg className="w-20 h-20 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-2xl font-bold text-green-600 mb-2">Thanh toán thành công!</h3>
              <p className="text-gray-700 mb-4">{message}</p>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-green-800">
                Đang chuyển hướng về trang chủ trong <span className="font-bold text-xl">{countdown}</span> giây...
              </p>
            </div>
            
            <div className="flex gap-3 justify-center">
              <Link 
                to="/dashboard" 
                className="inline-block px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Về trang chủ ngay
              </Link>
              <Link 
                to="/user-history" 
                className="inline-block px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Xem lịch sử
              </Link>
            </div>
          </div>
        )}

        {status === 'failed' && (
          <div>
            <p className="text-red-600 font-semibold mb-2">{message}</p>
            <div className="mt-3">
              <Link to="/" className="text-blue-600 hover:underline mr-4">Quay về</Link>
              <button onClick={() => window.location.reload()} className="text-gray-700 underline">Thử lại</button>
            </div>
          </div>
        )}

        {status === 'not_found' && (
          <div>
            <div className="mb-4">
              <svg className="w-16 h-16 text-yellow-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-xl font-bold text-yellow-700 mb-2">Đang xử lý thanh toán</h3>
              <p className="text-yellow-700 mb-2">{message}</p>
              <p className="text-sm text-gray-600">
                Hệ thống đang chờ xác nhận từ MoMo. Tự động thử lại sau {retryCount < 5 ? '3' : '...'} giây.
              </p>
            </div>
            
            {debugInfo && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-left text-xs mb-4">
                <p className="font-semibold mb-1">Thông tin:</p>
                <p>Mã đơn: {debugInfo.orderId}</p>
                <p>Lần thử: {retryCount + 1}/5</p>
              </div>
            )}
            
            <div className="flex gap-2 justify-center mt-4">
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
              >
                Làm mới ngay
              </button>
              <Link
                to="/dashboard"
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Về Dashboard
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div>
            <p className="text-red-600 mb-2">{message}</p>
            <p className="text-sm text-gray-500">Liên hệ bộ phận hỗ trợ nếu vấn đề vẫn tiếp diễn.</p>
          </div>
        )}
      </div>
    </div>
  );
}
