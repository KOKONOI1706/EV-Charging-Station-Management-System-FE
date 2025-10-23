import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { PricingPage as P } from "../components/PricingPage";
import { toast } from "sonner";

export default function PricingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleGetStarted = (planId: number) => {
    if (!isAuthenticated) {
      toast.error("Bạn cần đăng nhập để mua gói dịch vụ");
      navigate("/auth");
      return;
    }
    toast.success(`Đã chọn gói ${planId}`);
  };

  return <P onGetStarted={handleGetStarted} />;
}