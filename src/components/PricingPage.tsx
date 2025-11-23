import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Separator } from "./ui/separator";
import { Check, Zap, Calculator, TrendingUp, Users, Loader2 } from "lucide-react";
import { PRICING_PLANS } from "../data/mockDatabase";
import { useLanguage } from "../hooks/useLanguage";
import { LanguageSelector } from "./LanguageSelector";
import { getPackages, ServicePackage } from "../services/packageService";
import { AuthService } from "../services/authService";
import { useNavigate } from "react-router-dom";

interface PricingPageProps {
  onGetStarted: (planId: string) => void;
}

export function PricingPage({ onGetStarted }: PricingPageProps) {
  const [isAnnual, setIsAnnual] = useState(false);
  const { t } = useLanguage();
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadPackages();
  }, []);

  // Check if user just logged in and had selected a plan before
  useEffect(() => {
    const selectedPlanId = sessionStorage.getItem('selectedPlanId');
    if (selectedPlanId) {
      // User is logged in and there's a saved plan selection
      const currentUser = AuthService.getCurrentUser();
      if (currentUser) {
        // Clear the stored plan ID
        sessionStorage.removeItem('selectedPlanId');
        // Auto-proceed with the selected plan
        onGetStarted(selectedPlanId);
      }
    }
  }, [onGetStarted]);

  const loadPackages = async () => {
    try {
      setLoading(true);
      const data = await getPackages();
      console.log('All packages from API:', data);
      // Filter only active packages (case-insensitive)
      const activePackages = data.filter(pkg => pkg.status?.toLowerCase() === 'active');
      console.log('Filtered active packages:', activePackages);
      
      // Sort packages: ensure Plus/middle-priced package is in the middle for "Most Popular"
      const sortedPackages = activePackages.sort((a, b) => a.price - b.price);
      
      setPackages(sortedPackages);
    } catch (error) {
      console.error('Failed to load packages:', error);
      // Keep packages empty to show error state or fallback
      setPackages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChoosePlan = (planId: string) => {
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser) {
      // User not logged in, save plan ID and redirect to auth page
      sessionStorage.setItem('selectedPlanId', planId);
      navigate('/auth');
    } else {
      // User logged in, proceed with package selection
      onGetStarted(planId);
    }
  };

  // Convert database package benefits to feature list
  const benefitsToFeatures = (benefits: ServicePackage['benefits']): string[] => {
    const features: string[] = [];
    
    if (benefits.discount_rate) {
      features.push(`${benefits.discount_rate}% discount on all charging`);
    }
    if (benefits.bonus_minutes) {
      features.push(`${benefits.bonus_minutes} minutes free charging time`);
    }
    if (benefits.max_sessions) {
      features.push(`Up to ${benefits.max_sessions} sessions per month`);
    }
    if (benefits.priority_support) {
      features.push('Priority customer support');
    }
    if (benefits.support_24_7) {
      features.push('24/7 premium support');
    }
    if (benefits.booking_priority) {
      features.push('Priority booking access');
    }
    if (benefits.free_start_fee) {
      features.push('No start fee');
    }
    if (benefits.energy_tracking) {
      features.push('Advanced energy tracking');
    }
    if (benefits.after_limit_discount) {
      features.push(`${benefits.after_limit_discount}% discount after session limit`);
    }
    
    // Add other benefit keys dynamically
    Object.entries(benefits).forEach(([key, value]) => {
      if (typeof value === 'string' && !key.includes('discount') && !key.includes('minutes') && !key.includes('sessions')) {
        features.push(value);
      }
    });
    
    return features;
  };

  return (
    <div className="min-h-screen">
      {/* Language Selector - Top Right of Screen */}
      <div className="w-full px-8 py-6 text-right">
        <div className="inline-block">
          <LanguageSelector />
        </div>
      </div>
      
      <div className="container mx-auto px-4 pb-8">
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
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      ) : packages.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-xl text-gray-600 mb-4">
            Không có gói dịch vụ nào. Vui lòng kiểm tra backend hoặc thêm gói trong Quản lý gói.
          </p>
          <p className="text-sm text-gray-500">
            Backend URL: http://localhost:5000/api/packages
          </p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {packages.map((plan) => {
            // For database packages, use package data
            const planName = plan.name;
            const planDesc = plan.description || '';
            const monthlyFee = plan.price;
            const discountRate = plan.benefits?.discount_rate || 0;
            const features = benefitsToFeatures(plan.benefits);
            
            // Mark middle-priced package as popular (if we have 3 packages)
            const popular = packages.length === 3 && packages[1].package_id === plan.package_id;
            
            // Price is already in VND from database
            const price = isAnnual ? monthlyFee * 12 * 0.8 : monthlyFee; // 20% discount for annual
            const period = isAnnual ? "year" : "month";
            const key = plan.package_id.toString();
          
          return (
            <Card
              key={key}
              className={`relative ${
                popular
                  ? "border-green-500 shadow-lg scale-105"
                  : "border-gray-200"
              }`}
            >
              {popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-green-600 text-white px-4 py-1">
                    {t.mostPopular}
                  </Badge>
                </div>
              )}
              
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl mb-2">{planName}</CardTitle>
                  <p className="text-gray-600 mb-4">{planDesc}</p>
                <div className="space-y-2">
                  <div className="text-4xl font-bold">
                    {new Intl.NumberFormat('vi-VN').format(price)}₫
                    <span className="text-lg font-normal text-gray-500">
                      {` ${t.pricingPlanPricePer}${period === 'month' ? t.monthly.toLowerCase() : t.annual.toLowerCase()}`}
                    </span>
                  </div>
                  {discountRate > 0 && (
                    <p className="text-green-600 font-medium">
                      {discountRate}% {t.save.toLowerCase()} all charging
                    </p>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleChoosePlan(key)}
                  className={
                    popular
                      ? "w-full bg-green-600 hover:bg-green-700"
                      : "w-full"
                  }
                  variant={popular ? "default" : "outline"}
                >
                  {monthlyFee === 0 ? t.getStartedFree : t.choosePlan2}
                </Button>
              </CardContent>
            </Card>
          );
        })}
        </div>
      )}

      {/* Savings Calculator */}
      <Card className="mb-16">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-6 h-6 text-green-600" />
            {t.savingsCalculator}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h3 className="font-semibold">{t.lightUser} (100 kWh/month)</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>{PRICING_PLANS[0].name}:</span>
                  <span>875.000₫/{t.monthly.toLowerCase()}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>{PRICING_PLANS[1].name}:</span>
                  <span>1.037.000₫/{t.monthly.toLowerCase()}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>{PRICING_PLANS[2].name}:</span>
                  <span>1.200.000₫/{t.monthly.toLowerCase()}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">{t.regularUser} (300 kWh/month)</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>{PRICING_PLANS[0].name}:</span>
                  <span>2.625.000₫/{t.monthly.toLowerCase()}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>{PRICING_PLANS[1].name}:</span>
                  <span>2.612.000₫/{t.monthly.toLowerCase()}</span>
                </div>
                <div className="flex justify-between text-green-600 font-medium">
                  <span>{PRICING_PLANS[2].name}:</span>
                  <span>2.600.000₫/{t.monthly.toLowerCase()}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">{t.heavyUser} (500 kWh/month)</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>{PRICING_PLANS[0].name}:</span>
                  <span>4.375.000₫/{t.monthly.toLowerCase()}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>{PRICING_PLANS[1].name}:</span>
                  <span>4.187.000₫/{t.monthly.toLowerCase()}</span>
                </div>
                <div className="flex justify-between text-green-600 font-medium">
                  <span>{PRICING_PLANS[2].name}:</span>
                  <span>4.000.000₫/{t.monthly.toLowerCase()}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle>{t.faqTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">{t.faqChangePlanTitle}</h3>
            <p className="text-gray-600 text-sm">{t.faqChangePlanDesc}</p>
          </div>
          <Separator />
          <div>
            <h3 className="font-semibold mb-2">{t.faqRefundsTitle}</h3>
            <p className="text-gray-600 text-sm">{t.faqRefundsDesc}</p>
          </div>
          <Separator />
          <div>
            <h3 className="font-semibold mb-2">{t.faqPaymentsTitle}</h3>
            <p className="text-gray-600 text-sm">{t.faqPaymentsDesc}</p>
          </div>
          <Separator />
          <div>
            <h3 className="font-semibold mb-2">{t.faqHiddenFeesTitle}</h3>
            <p className="text-gray-600 text-sm">{t.faqHiddenFeesDesc}</p>
          </div>
        </CardContent>
      </Card>
    </div>
    </div>
  );
}