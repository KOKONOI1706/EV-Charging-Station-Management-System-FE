/**
 * ===============================================================
 * PRICING PAGE ROUTE
 * ===============================================================
 * Route wrapper cho PricingPage component
 * 
 * Chức năng:
 * - 💰 Hiển thị các gói dịch vụ (pricing plans)
 * - 📊 So sánh features của từng gói
 * - 🎯 CTA button "Get Started" (onGetStarted callback)
 * 
 * Props:
 * - onGetStarted: Callback khi user click button đăng ký gói
 *   (Hiện tại empty function, TODO: implement đăng ký gói)
 * 
 * URL: /pricing
 * 
 * Dependencies:
 * - PricingPage component: Component hiển thị pricing plans
 */

import { PricingPage as P } from "../components/PricingPage";

export default function PricingRoute() {
  return <P onGetStarted={() => {}} />;
}
