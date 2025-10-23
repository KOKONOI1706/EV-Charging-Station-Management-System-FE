import { useNavigate } from "react-router-dom";
import { AuthPage } from "../components/AuthPage";
import { useAuth } from "../contexts/AuthContext";
import { User } from "../data/mockDatabase";

export default function AuthRoute() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSuccess = (user: User) => {
    login(user);
    
    // Redirect based on user role from database
    switch (user.role) {
      case "admin":
        navigate("/admin");
        break;
      case "staff":
        navigate("/staff");
        break;
      case "customer":
      default:
        navigate("/dashboard");
        break;
    }
  };

  return <AuthPage onSuccess={handleSuccess} onBack={() => navigate("/")} />;
}
