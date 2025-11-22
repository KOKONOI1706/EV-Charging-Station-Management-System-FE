import { useState } from "react";
import { PricingPage as P } from "../components/PricingPage";
import { PackagePaymentModal } from "../components/PackagePaymentModal";
import { AuthService } from "../services/authService";
import { getPackages, ServicePackage } from "../services/packageService";
import { toast } from "sonner";

export default function PricingRoute() {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<ServicePackage | null>(null);
  const [packages, setPackages] = useState<ServicePackage[]>([]);

  const handleGetStarted = async (planId: string) => {
    try {
      // Get current user
      const user = AuthService.getCurrentUser();
      if (!user) {
        toast.error("Vui lòng đăng nhập để mua gói");
        return;
      }

      // Fetch packages if not loaded yet
      let pkgs = packages;
      if (pkgs.length === 0) {
        pkgs = await getPackages();
        setPackages(pkgs);
      }

      // Find package by ID (planId is package_id converted to string)
      const pkg = pkgs.find(p => p.package_id.toString() === planId);
      
      if (!pkg) {
        toast.error("Không tìm thấy gói dịch vụ");
        return;
      }

      setSelectedPackage(pkg);
      setShowPaymentModal(true);
    } catch (error) {
      console.error("Error loading package:", error);
      toast.error("Không thể tải thông tin gói");
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    setSelectedPackage(null);
    toast.success("Mua gói thành công!");
    // Optionally redirect to dashboard
    // window.location.href = "/dashboard";
  };

  return (
    <>
      <P onGetStarted={handleGetStarted} />
      
      {selectedPackage && (
        <PackagePaymentModal
          open={showPaymentModal}
          onOpenChange={setShowPaymentModal}
          packageData={{
            package_id: selectedPackage.package_id,
            name: selectedPackage.name,
            price: selectedPackage.price,
            description: selectedPackage.description,
            duration_days: selectedPackage.duration_days,
          }}
          user_id={parseInt(AuthService.getCurrentUser()?.id || "0")}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
}
