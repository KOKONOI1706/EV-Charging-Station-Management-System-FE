import { useNavigate } from "react-router-dom";
import { AuthPage } from "../components/AuthPage";
import { useAuth } from "../contexts/AuthContext";

export default function AuthRoute() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSuccess = (user: any) => {
    login(user);
    // Redirect based on user role
    switch (user.role) {
      case "admin":
        navigate("/admin");
        break;
      case "staff":
        navigate("/staff");
        break;
      default:
        navigate("/dashboard");
    }
  };

  return <AuthPage onSuccess={handleSuccess} onBack={() => navigate("/")} />;
}
