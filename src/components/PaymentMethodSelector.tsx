import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Badge } from './ui/badge';
import { Check, CreditCard, Wallet } from 'lucide-react';

export type PaymentMethod = 'momo' | 'vnpay' | 'zalopay' | 'card';

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod;
  onMethodChange: (method: PaymentMethod) => void;
  disabled?: boolean;
}

const paymentMethods = [
  {
    id: 'momo' as PaymentMethod,
    name: 'MoMo',
    description: 'Ví điện tử MoMo',
    icon: '/payment-icons/momo.png',
    color: 'bg-pink-50 border-pink-200',
    iconBg: 'bg-pink-100',
    recommended: true,
    features: ['Thanh toán nhanh', 'Quét mã QR', 'Hoàn tiền 2%']
  },
  {
    id: 'vnpay' as PaymentMethod,
    name: 'VNPay',
    description: 'Cổng thanh toán VNPay',
    icon: '/payment-icons/vnpay.png',
    color: 'bg-blue-50 border-blue-200',
    iconBg: 'bg-blue-100',
    recommended: false,
    features: ['ATM/Visa/Master', 'Bảo mật cao']
  },
  {
    id: 'zalopay' as PaymentMethod,
    name: 'ZaloPay',
    description: 'Ví điện tử ZaloPay',
    icon: '/payment-icons/zalopay.png',
    color: 'bg-cyan-50 border-cyan-200',
    iconBg: 'bg-cyan-100',
    recommended: false,
    features: ['Liên kết Zalo', 'Ưu đãi đặc biệt']
  },
  {
    id: 'card' as PaymentMethod,
    name: 'Thẻ tín dụng/ghi nợ',
    description: 'Visa, Mastercard, JCB',
    icon: '/payment-icons/card.png',
    color: 'bg-gray-50 border-gray-200',
    iconBg: 'bg-gray-100',
    recommended: false,
    features: ['Tất cả các loại thẻ', 'Thanh toán quốc tế']
  }
];

export function PaymentMethodSelector({ 
  selectedMethod, 
  onMethodChange,
  disabled = false 
}: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-3">
      <Label className="text-base font-semibold">
        Chọn phương thức thanh toán
      </Label>
      
      <RadioGroup
        value={selectedMethod}
        onValueChange={(value) => onMethodChange(value as PaymentMethod)}
        disabled={disabled}
        className="space-y-3"
      >
        {paymentMethods.map((method) => (
          <div key={method.id} className="relative">
            <RadioGroupItem
              value={method.id}
              id={method.id}
              className="peer sr-only"
            />
            <Label
              htmlFor={method.id}
              className={`
                flex cursor-pointer rounded-lg border-2 p-4 transition-all
                ${selectedMethod === method.id 
                  ? 'border-green-500 bg-green-50 shadow-sm' 
                  : method.color
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-green-300'}
              `}
            >
              <div className="flex items-start gap-4 w-full">
                {/* Payment Icon */}
                <div className={`
                  w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0
                  ${selectedMethod === method.id ? 'bg-green-100' : method.iconBg}
                `}>
                  {method.id === 'momo' && (
                    <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                      M
                    </div>
                  )}
                  {method.id === 'vnpay' && (
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                      VN
                    </div>
                  )}
                  {method.id === 'zalopay' && (
                    <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                      Z
                    </div>
                  )}
                  {method.id === 'card' && (
                    <CreditCard className="w-6 h-6 text-gray-600" />
                  )}
                </div>

                {/* Payment Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900">
                      {method.name}
                    </span>
                    {method.recommended && (
                      <Badge className="bg-green-500 hover:bg-green-600 text-xs">
                        Khuyên dùng
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    {method.description}
                  </p>
                  
                  {/* Features */}
                  <div className="flex flex-wrap gap-1.5">
                    {method.features.map((feature, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-0.5 bg-white rounded-full border border-gray-200 text-gray-600"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Selected Indicator */}
                {selectedMethod === method.id && (
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}
              </div>
            </Label>
          </div>
        ))}
      </RadioGroup>

      {/* Security Notice */}
      <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg mt-4">
        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Check className="w-3 h-3 text-white" />
        </div>
        <div className="text-xs text-blue-800">
          <strong>Bảo mật & An toàn:</strong> Tất cả giao dịch được mã hóa SSL 256-bit. 
          Thông tin thanh toán của bạn được bảo vệ an toàn.
        </div>
      </div>
    </div>
  );
}
