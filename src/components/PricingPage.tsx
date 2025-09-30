import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Separator } from "./ui/separator";
import { Check, Zap, Calculator, TrendingUp, Users } from "lucide-react";
import { PRICING_PLANS } from "../data/mockDatabase";

interface PricingPageProps {
  onGetStarted: (planId: string) => void;
}

export function PricingPage({ onGetStarted }: PricingPageProps) {
  const [isAnnual, setIsAnnual] = useState(false);

  const getAnnualPrice = (monthlyPrice: number) => {
    return monthlyPrice * 12 * 0.8; // 20% discount for annual
  };

  const calculateSavings = (monthlyFee: number, discountRate: number, usage: number) => {
    const baseCost = usage * 0.35; // Average rate without plan
    const discountedCost = usage * 0.35 * (1 - discountRate / 100);
    const monthlySavings = baseCost - discountedCost - monthlyFee;
    return Math.max(0, monthlySavings);
  };

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">
          Choose Your <span className="text-green-600">Charging Plan</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Save money and enjoy premium features with our flexible pricing plans.
          No contracts, cancel anytime.
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex items-center justify-center mb-12">
        <span className={`mr-3 ${!isAnnual ? 'font-medium' : 'text-gray-500'}`}>
          Monthly
        </span>
        <Switch
          checked={isAnnual}
          onCheckedChange={setIsAnnual}
          className="data-[state=checked]:bg-green-600"
        />
        <span className={`ml-3 ${isAnnual ? 'font-medium' : 'text-gray-500'}`}>
          Annual
        </span>
        {isAnnual && (
          <Badge className="ml-2 bg-green-100 text-green-700">
            Save 20%
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
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                <div className="space-y-2">
                  <div className="text-4xl font-bold">
                    ${price.toFixed(2)}
                    <span className="text-lg font-normal text-gray-500">
                      /{period}
                    </span>
                  </div>
                  {plan.discountRate > 0 && (
                    <p className="text-green-600 font-medium">
                      {plan.discountRate}% off all charging
                    </p>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
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
                  {plan.monthlyFee === 0 ? "Get Started Free" : "Choose Plan"}
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
            Savings Calculator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h3 className="font-semibold">Light User (100 kWh/month)</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Basic Plan:</span>
                  <span>$35.00/month</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Plus Plan:</span>
                  <span>$41.49/month</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Premium Plan:</span>
                  <span>$48.00/month</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Regular User (300 kWh/month)</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Basic Plan:</span>
                  <span>$105.00/month</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Plus Plan:</span>
                  <span>$104.49/month</span>
                </div>
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Premium Plan:</span>
                  <span>$104.00/month</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Heavy User (500 kWh/month)</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Basic Plan:</span>
                  <span>$175.00/month</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Plus Plan:</span>
                  <span>$167.49/month</span>
                </div>
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Premium Plan:</span>
                  <span>$160.00/month</span>
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
            <div className="text-sm text-gray-600">Charging Stations</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <div className="text-2xl font-bold mb-1">99.5%</div>
            <div className="text-sm text-gray-600">Uptime</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Users className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <div className="text-2xl font-bold mb-1">50K+</div>
            <div className="text-sm text-gray-600">Active Users</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-orange-600 font-bold">⚡</span>
            </div>
            <div className="text-2xl font-bold mb-1">2M+</div>
            <div className="text-sm text-gray-600">Sessions Completed</div>
          </CardContent>
        </Card>
      </div>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Can I change my plan anytime?</h3>
            <p className="text-gray-600 text-sm">
              Yes, you can upgrade, downgrade, or cancel your plan at any time. 
              Changes take effect at the start of your next billing cycle.
            </p>
          </div>
          <Separator />
          <div>
            <h3 className="font-semibold mb-2">Do you offer refunds?</h3>
            <p className="text-gray-600 text-sm">
              We offer a 30-day money-back guarantee for annual subscriptions. 
              Monthly subscriptions can be cancelled at any time without penalty.
            </p>
          </div>
          <Separator />
          <div>
            <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
            <p className="text-gray-600 text-sm">
              We accept all major credit cards, PayPal, and ACH bank transfers. 
              Payment is automatically processed at the beginning of each billing cycle.
            </p>
          </div>
          <Separator />
          <div>
            <h3 className="font-semibold mb-2">Are there any hidden fees?</h3>
            <p className="text-gray-600 text-sm">
              No hidden fees! The pricing shown includes all features listed. 
              You only pay for the electricity you use plus your plan fee.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}