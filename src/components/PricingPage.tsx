/**
 * ===============================================================
 * PRICING PAGE COMPONENT (COMPONENT TRANG GIÁ)
 * ===============================================================
 * Component hiển thị các gói dịch vụ (pricing plans)
 * 
 * Chức năng:
 * - 💰 Hiển thị 3 pricing plans (Basic, Plus, Premium)
 * - 🔄 Toggle Monthly/Annual billing
 * - 🌐 Multi-language support (EN/VI)
 * - 🎯 Highlight "Popular" plan
 * - ✅ Feature comparison
 * - 🚀 "Get Started" CTA buttons
 * 
 * Props:
 * - onGetStarted: (planId) => void - Callback khi click button
 * 
 * State:
 * - isAnnual: Boolean (false=Monthly, true=Annual)
 * 
 * Plans (từ PRICING_PLANS):
 * 
 * 1. Basic:
 *    - Monthly: $29.99
 *    - Annual: $299.99 (save $60)
 *    - Features:
 *      * Giảm 10% mỗi lần sạc
 *      * Miễn phí idle fee
 *      * Hỗ trợ 24/7
 *      * Tích điểm rewards
 * 
 * 2. Plus (Popular):
 *    - Monthly: $49.99
 *    - Annual: $499.99 (save $100)
 *    - All Basic features +
 *      * Giảm 15%
 *      * Ưu tiên booking
 *      * Guest passes
 * 
 * 3. Premium:
 *    - Monthly: $79.99
 *    - Annual: $799.99 (save $160)
 *    - All Plus features +
 *      * Giảm 20%
 *      * VIP support
 *      * Valet service
 *      * Airport lounge
 * 
 * Billing toggle:
 * - Switch Monthly/Annual
 * - Badge "Save 17%" khi chọn Annual
 * - Price tự động update
 * 
 * Language support:
 * - useLanguage hook
 * - getPlanText(planId) → Return translated text
 * - LanguageSelector top-right
 * 
 * Card design:
 * - Popular plan có border green + "Most Popular" badge
 * - Gradient background từ green-50 → white → green-50
 * - Icon cho mỗi plan:
 *   * Basic: Zap ⚡
 *   * Plus: TrendingUp 📈
 *   * Premium: Users 👥
 * 
 * Features display:
 * - Check icon (✓) cho mỗi feature
 * - Green text cho highlights
 * - Bullet list
 * 
 * Get Started button:
 * - Green cho popular plan
 * - Outline cho others
 * - Hover effects
 * - Call onGetStarted(planId)
 * 
 * Header:
 * - Title: "Choose Your Plan" / "Chọn Gói Của Bạn"
 * - Description: Multi-language
 * - Gradient text green
 * 
 * Dependencies:
 * - PRICING_PLANS data
 * - useLanguage hook
 * - LanguageSelector component
 */

import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Separator } from "./ui/separator";
import { Check, Zap, Calculator, TrendingUp, Users } from "lucide-react";
import { PRICING_PLANS } from "../data/mockDatabase";
import { useLanguage } from "../hooks/useLanguage";
import { LanguageSelector } from "./LanguageSelector";

interface PricingPageProps {
  onGetStarted: (planId: string) => void;
}

export function PricingPage({ onGetStarted }: PricingPageProps) {
  const [isAnnual, setIsAnnual] = useState(false);
  const { t } = useLanguage();

  // (calculateSavings removed - not used in current UI)

  const getPlanText = (planId: string, fallbackPlan?: any) => {
    switch (planId) {
      case 'basic':
        return {
          name: t.planBasicName,
          description: t.planBasicDescription,
          features: [
            t.planBasicFeature1,
            t.planBasicFeature2,
            t.planBasicFeature3,
            t.planBasicFeature4,
          ],
        };
      case 'plus':
        return {
          name: t.planPlusName,
          description: t.planPlusDescription,
          features: [
            t.planPlusFeature1,
            t.planPlusFeature2,
            t.planPlusFeature3,
            t.planPlusFeature4,
            t.planPlusFeature5,
          ],
        };
      case 'premium':
        return {
          name: t.planPremiumName,
          description: t.planPremiumDescription,
          features: [
            t.planPremiumFeature1,
            t.planPremiumFeature2,
            t.planPremiumFeature3,
            t.planPremiumFeature4,
            t.planPremiumFeature5,
            t.planPremiumFeature6,
          ],
        };
      default:
        return {
          name: planId,
          description: '',
          features: fallbackPlan?.features || [],
        };
    }
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
      <div className="grid lg:grid-cols-3 gap-8 mb-16">
        {PRICING_PLANS.map((plan) => {
          // Convert USD to VND (1 USD = 25,000 VND)
          const priceVND = plan.monthlyFee * 25000;
          const price = isAnnual ? priceVND * 12 * 0.8 : priceVND; // 20% discount for annual
          const period = isAnnual ? "year" : "month";
          
          return (
            <Card
              key={plan.id}
              className={`relative ${
                plan.popular
                  ? "border-green-500 shadow-lg scale-105"
                  : "border-gray-200"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-green-600 text-white px-4 py-1">
                    {t.mostPopular}
                  </Badge>
                </div>
              )}
              
                <CardHeader className="text-center pb-4">
                  {
                    (() => {
                      const p = getPlanText(plan.id);
                      return (
                        <>
                          <CardTitle className="text-2xl mb-2">{p.name}</CardTitle>
                          <p className="text-gray-600 mb-4">{p.description}</p>
                        </>
                      );
                    })()
                  }
                <div className="space-y-2">
                  <div className="text-4xl font-bold">
                    {new Intl.NumberFormat('vi-VN').format(price)}₫
                    <span className="text-lg font-normal text-gray-500">
                      {` ${t.pricingPlanPricePer}${period === 'month' ? t.monthly.toLowerCase() : t.annual.toLowerCase()}`}
                    </span>
                  </div>
                  {plan.discountRate > 0 && (
                    <p className="text-green-600 font-medium">
                      {plan.discountRate}% {t.save.toLowerCase()} all charging
                    </p>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {getPlanText(plan.id, plan).features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => onGetStarted(plan.id)}
                  className={
                    plan.popular
                      ? "w-full bg-green-600 hover:bg-green-700"
                      : "w-full"
                  }
                  variant={plan.popular ? "default" : "outline"}
                >
                  {plan.monthlyFee === 0 ? t.getStartedFree : t.choosePlan2}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

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