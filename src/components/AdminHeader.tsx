import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { LanguageSelector } from "./LanguageSelector";

const AdminHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0">
      <div className="flex flex-row items-center justify-between py-3 px-8">
        
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-full"></div>
          </div>
          <button 
            onClick={() => navigate("/admin")}
            className="text-xl font-semibold hover:text-green-600 transition-colors"
          >
            ChargeTech
          </button>
        </div>

        {/* Right Section */}
        <div className="flex flex-row items-center gap-6 text-gray-700">
          {/* Language Selector */}
          <LanguageSelector />

          {/* User */}
          <div className="flex flex-row items-center gap-1">
            <span role="img" aria-label="user">👤</span>
            <span>Chào mừng, {user?.name || 'Admin'}</span>
          </div>

          {/* Logout Button */}
          <button 
            onClick={handleLogout}
            className="bg-gray-900 text-white px-4 py-1.5 rounded-md hover:bg-green-600 transition"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;