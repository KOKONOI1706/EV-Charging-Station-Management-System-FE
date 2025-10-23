import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const AuthRedirect = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      // If user has role "admin", redirect to /admin
      if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "staff") {
        navigate("/staff");
      } else if (user.role === "customer") {
        navigate("/"); // Chuyển về trang chủ cho customer
      }
    }
  }, [user, navigate]);

  return null;
};