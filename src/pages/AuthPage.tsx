import { useNavigate } from "react-router-dom";
import { AuthPage } from "../components/AuthPage";
import { useAuth } from "../contexts/AuthContext";
import { User } from "../data/mockDatabase";

export default function AuthRoute() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSuccess = (user: User) => {
    login(user);
    
    // Check if user came from pricing page to select a package
    const selectedPlanId = sessionStorage.getItem('selectedPlanId');
    if (selectedPlanId) {
      // Clear the stored plan ID
      sessionStorage.removeItem('selectedPlanId');
      // Navigate to home page, which will then handle the package purchase
      navigate('/', { state: { planId: selectedPlanId } });
      return;
    }
    
    // Default redirect based on user role from database
    switch (user.role) {
      case "admin":
        navigate("/admin");
        break;
      case "staff":
        navigate("/staff");
        break;
      case "customer":
      default:
        // Customer goes to home page to find stations
        navigate("/");
        break;
    }
  };

  return <AuthPage onSuccess={handleSuccess} onBack={() => navigate("/")} />;
}
