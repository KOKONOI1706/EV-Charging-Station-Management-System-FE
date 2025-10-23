import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Separator } from "./ui/separator";
import { Check, Zap, Calculator, TrendingUp, Users } from "lucide-react";
import { PRICING_PLANS } from "../data/mockDatabase";
import { useLanguage } from "../hooks/useLanguage";

interface PricingPageProps {
  onGetStarted: (planId: string) => void;
}

export function PricingPage({ onGetStarted }: PricingPageProps) {
  const [isAnnual, setIsAnnual] = useState(false);
  const { t } = useLanguage();

  const getAnnualPrice = (monthlyPrice: number) => {
    return monthlyPrice * 12 * 0.8; // 20% discount for annual
  };

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
    <div className="container mx-auto px-4 py-16">
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
          const price = isAnnual ? getAnnualPrice(plan.monthlyFee) : plan.monthlyFee;
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
                    ${price.toFixed(2)}
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
                  <span>$35.00/{t.monthly.toLowerCase()}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>{PRICING_PLANS[1].name}:</span>
                  <span>$41.49/{t.monthly.toLowerCase()}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>{PRICING_PLANS[2].name}:</span>
                  <span>$48.00/{t.monthly.toLowerCase()}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">{t.regularUser} (300 kWh/month)</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>{PRICING_PLANS[0].name}:</span>
                  <span>$105.00/{t.monthly.toLowerCase()}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>{PRICING_PLANS[1].name}:</span>
                  <span>$104.49/{t.monthly.toLowerCase()}</span>
                </div>
                <div className="flex justify-between text-green-600 font-medium">
                  <span>{PRICING_PLANS[2].name}:</span>
                  <span>$104.00/{t.monthly.toLowerCase()}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">{t.heavyUser} (500 kWh/month)</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>{PRICING_PLANS[0].name}:</span>
                  <span>$175.00/{t.monthly.toLowerCase()}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>{PRICING_PLANS[1].name}:</span>
                  <span>$167.49/{t.monthly.toLowerCase()}</span>
                </div>
                <div className="flex justify-between text-green-600 font-medium">
                  <span>{PRICING_PLANS[2].name}:</span>
                  <span>$160.00/{t.monthly.toLowerCase()}</span>
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
  );
}