import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Check, Zap, Loader2, TrendingUp, Users } from "lucide-react";

import { ServicePackage, getPackages } from "../services/packageService";

interface PricingPageProps {
  onGetStarted: (planId: number) => void;
}

export function PricingPage({ onGetStarted }: PricingPageProps) {
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const data = await getPackages();
        const processedData = data
          .filter(pkg => pkg.status === 'Active')
          .map(pkg => ({
            ...pkg,
            benefits: typeof pkg.benefits === 'string' 
              ? JSON.parse(pkg.benefits) 
              : Array.isArray(pkg.benefits) 
                ? pkg.benefits 
                : []
          }));
        setPackages(processedData);
      } catch (error) {
        console.error('Error fetching packages:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">
          <span className="text-green-600">Gói dịch vụ của chúng tôi</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Chọn gói dịch vụ phù hợp với nhu cầu sạc xe của bạn
        </p>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      ) : (
        /* Pricing Cards */
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {packages.map((pkg, index) => (
            <Card
              key={pkg.package_id}
              className={`relative ${
                index === 1
                  ? "border-green-500 shadow-lg scale-105"
                  : "border-gray-200"
              }`}
            >
              {index === 1 && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-green-600 text-white px-4 py-1">
                    Phổ biến nhất
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl mb-2">{pkg.name}</CardTitle>
                <div className="space-y-2">
                  <div className="text-4xl font-bold">
                    {pkg.price}đ
                    <span className="text-lg font-normal text-gray-500">
                      {pkg.duration_days ? ` / ${pkg.duration_days} ngày` : ''}
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Package descriptions removed per request */}
                
                <div>
                  <h4 className="font-semibold mb-3">Quyền lợi gói:</h4>
                  <ul className="space-y-3">
                    {pkg.benefits?.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  onClick={() => onGetStarted(pkg.package_id)}
                  className={
                    index === 1
                      ? "w-full bg-green-600 hover:bg-green-700"
                      : "w-full"
                  }
                  variant={index === 1 ? "default" : "outline"}
                >
                  Mua ngay
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Network Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-16">
        <Card>
          <CardContent className="p-6 text-center">
            <Zap className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <div className="text-2xl font-bold mb-1">500+</div>
            <div className="text-sm text-gray-600">Trạm sạc</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <div className="text-2xl font-bold mb-1">99.5%</div>
            <div className="text-sm text-gray-600">Thời gian hoạt động</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Users className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <div className="text-2xl font-bold mb-1">50K+</div>
            <div className="text-sm text-gray-600">Khách hàng</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-orange-600 font-bold">⚡</span>
            </div>
            <div className="text-2xl font-bold mb-1">2M+</div>
            <div className="text-sm text-gray-600">Lượt sạc</div>
          </CardContent>
        </Card>
      </div>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle>Câu hỏi thường gặp</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Làm thế nào để thay đổi gói?</h3>
            <p className="text-gray-600 text-sm">
              Bạn có thể dễ dàng nâng cấp hoặc hạ cấp gói dịch vụ của mình bất cứ lúc nào trong trang cá nhân.
            </p>
          </div>
          <Separator />
          <div>
            <h3 className="font-semibold mb-2">Chính sách hoàn tiền?</h3>
            <p className="text-gray-600 text-sm">
              Chúng tôi cung cấp hoàn tiền đầy đủ trong vòng 7 ngày kể từ ngày mua nếu bạn không hài lòng với dịch vụ.
            </p>
          </div>
          <Separator />
          <div>
            <h3 className="font-semibold mb-2">Có phí ẩn không?</h3>
            <p className="text-gray-600 text-sm">
              Không, giá niêm yết là tổng số tiền bạn phải trả. Không có phí ẩn hay chi phí bổ sung.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}