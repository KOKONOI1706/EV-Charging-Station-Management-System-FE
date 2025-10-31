import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'pending' | 'completed' | 'failed' | 'error' | 'not_found'>('pending');
  const [message, setMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(3);

  useEffect(() => {
    const orderId = searchParams.get('orderId');
    const resultCode = searchParams.get('resultCode');
    const amount = searchParams.get('amount');

    // Basic quick UX: if resultCode is present and indicates failure, show message
    if (resultCode && resultCode !== '0') {
      setStatus('failed');
      setMessage('Thanh toán không thành công. Vui lòng thử lại.');
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
        const res = await fetch(`${API_BASE_URL}/payments/momo/status/${encodeURIComponent(orderId)}`);
        if (res.status === 404) {
          setStatus('not_found');
          setMessage('Thanh toán đã được xử lý nhưng không tìm thấy thông tin (404).');
          return;
        }

        const data = await res.json();
        if (!data.success) {
          setStatus('error');
          setMessage(data.error || 'Không thể xác minh thanh toán.');
          return;
        }

        const st = data.data?.status;
        if (st === 'Completed') {
          setStatus('completed');
          setMessage(`Thanh toán thành công (${amount || ''} VND). Cảm ơn bạn!`);
          
          // Show success toast
          toast.success('🎉 Thanh toán thành công!', {
            description: 'Bạn sẽ được chuyển về trang chủ sau 3 giây...'
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
          setStatus('pending');
          setMessage('Thanh toán đang chờ xử lý. Vui lòng chờ vài giây và làm mới trang.');
        } else {
          setStatus('failed');
          setMessage('Thanh toán thất bại hoặc bị hủy.');
        }
      } catch (err: any) {
        console.error('Verify error:', err);
        setStatus('error');
        setMessage('Lỗi khi liên hệ máy chủ để xác minh thanh toán.');
      }
    };

    verify();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-xl w-full bg-white shadow rounded p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Kết quả thanh toán</h2>

        {status === 'pending' && (
          <div>
            <p className="text-gray-700 mb-4">Đang xác minh thanh toán...</p>
            <div className="loader inline-block" aria-hidden />
            <p className="text-sm text-gray-500 mt-3">Nếu mất nhiều thời gian, bạn có thể tải lại trang.</p>
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
            <p className="text-yellow-700 mb-2">{message}</p>
            <p className="text-sm text-gray-500">Có thể backend chưa nhận được IPN từ MoMo. Đợi vài giây và làm mới trang.</p>
            <div className="mt-3">
              <button onClick={() => window.location.reload()} className="text-gray-700 underline">Làm mới</button>
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
