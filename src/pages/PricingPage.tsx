import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Switch } from "../components/ui/switch";
import { Check, Zap, TrendingUp, Users } from "lucide-react";
import { useLanguage } from "../hooks/useLanguage";
import { LanguageSelector } from "../components/LanguageSelector";
import { getPackages, ServicePackage } from "../services/packageService";
import { Loader2 } from "lucide-react";

interface PricingPageProps {
  onGetStarted?: (packageId: number) => void;
}

export default function PricingPage({ onGetStarted }: PricingPageProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isAnnual, setIsAnnual] = useState(false);
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const data = await getPackages();
        // Only show active packages
        setPackages(data.filter(pkg => pkg.status === 'Active'));
      } catch (error) {
        console.error('Error fetching packages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  const handleGetStarted = (packageId: number) => {
    if (!isAuthenticated) {
      toast.error("Bạn cần đăng nhập để mua gói dịch vụ");
      navigate("/auth");
      return;
    }
    if (onGetStarted) {
      onGetStarted(packageId);
    } else {
      toast.success(`Đã chọn gói ${packageId}`);
    }
  };

  const getAnnualPrice = (price: number) => {
    return price * 12 * 0.8; // 20% discount for annual
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Language Selector - Top Right */}
      <div className="flex justify-end mb-4">
        <LanguageSelector />
      </div>
      
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">
          <span className="text-green-600">{t.choosePlan}</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">{t.choosePlanDesc}</p>
      </div>

      {/* Billing Toggle */}
      <div className="flex items-center justify-center mb-12">
        <span className={`mr-3 ${!isAnnual ? 'font-medium' : 'text-gray-500'}`}>
          {t.monthly}
        </span>
        <Switch
          checked={isAnnual}
          onCheckedChange={setIsAnnual}
          className="data-[state=checked]:bg-green-600"
        />
        <span className={`ml-3 ${isAnnual ? 'font-medium' : 'text-gray-500'}`}>
          {t.annual}
        </span>
        {isAnnual && (
          <Badge className="ml-2 bg-green-100 text-green-700">
            {t.save} 20%
          </Badge>
        )}
      </div>

      {/* Pricing Cards */}
      <div className="grid lg:grid-cols-3 gap-8 mb-16">
        {packages.map((pkg, index) => {
          const price = isAnnual ? getAnnualPrice(pkg.price) : pkg.price;
          const period = isAnnual ? "year" : "month";
          const isPopular = index === 1; // Middle package is popular
          
          return (
            <Card
              key={pkg.package_id}
              className={`relative ${
                isPopular
                  ? "border-green-500 shadow-lg scale-105"
                  : "border-gray-200"
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-green-600 text-white px-4 py-1">
                    {t.mostPopular}
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl mb-2">{pkg.name}</CardTitle>
                <p className="text-gray-600 mb-4">{pkg.description}</p>
                <div className="space-y-2">
                  <div className="text-4xl font-bold">
                    {price.toLocaleString()}đ
                    <span className="text-lg font-normal text-gray-500">
                      {` ${t.pricingPlanPricePer}${period === 'month' ? t.monthly.toLowerCase() : t.annual.toLowerCase()}`}
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {pkg.benefits?.features?.map((feature: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleGetStarted(pkg.package_id)}
                  className={
                    isPopular
                      ? "w-full bg-green-600 hover:bg-green-700"
                      : "w-full"
                  }
                  variant={isPopular ? "default" : "outline"}
                >
                  {t.choosePlan2}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Network Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-16">
        <Card>
          <CardContent className="p-6 text-center">
            <Zap className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <div className="text-2xl font-bold mb-1">500+</div>
            <div className="text-sm text-gray-600">{t.statsChargingStations}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <div className="text-2xl font-bold mb-1">99.5%</div>
            <div className="text-sm text-gray-600">{t.statsUptime}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Users className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <div className="text-2xl font-bold mb-1">50K+</div>
            <div className="text-sm text-gray-600">{t.statsActiveUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-orange-600 font-bold">⚡</span>
            </div>
            <div className="text-2xl font-bold mb-1">2M+</div>
            <div className="text-sm text-gray-600">{t.statsSessions}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}