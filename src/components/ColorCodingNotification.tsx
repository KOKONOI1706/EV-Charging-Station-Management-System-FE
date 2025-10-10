import React from 'react';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { CheckCircle } from 'lucide-react';

export const ColorCodingNotification: React.FC = () => {
  return (
    <Card className="border-green-200 bg-green-50 mb-4">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-green-800 mb-2">
              🚗 Hệ Thống Trạm Sạc Thông Minh - Thủ Đức & TP.HCM
            </h3>
            <p className="text-sm text-green-700 mb-3">
              Tìm và sử dụng trạm sạc VinFast, Tesla và các xe điện khác dễ dàng:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Badge className="bg-green-500 hover:bg-green-600 text-white text-xs">
                🟢 Có sẵn
              </Badge>
              <Badge className="bg-red-500 hover:bg-red-600 text-white text-xs">
                🔴 Đã đầy
              </Badge>
              <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs">
                🟡 Sắp có chỗ
              </Badge>
              <Badge className="bg-gray-500 hover:bg-gray-600 text-white text-xs">
                🔘 Bảo trì
              </Badge>
            </div>
            <p className="text-xs text-green-600 mt-2">
              🇻🇳 Thủ Đức, TP.HCM | ✨ Hỗ trợ VinFast, Tesla và các xe điện phổ biến
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ColorCodingNotification;