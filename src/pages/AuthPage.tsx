import { useNavigate } from "react-router-dom";
import { AuthPage } from "../components/AuthPage";
import { useAuth } from "../contexts/AuthContext";

export default function AuthRoute() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSuccess = (user: any) => {
    login(user);
    // Redirect to home page after successful login/registration
    navigate("/");
  };

  return <AuthPage onSuccess={handleSuccess} onBack={() => navigate("/")} />;
}
