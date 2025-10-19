import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthService } from "../services/authService";
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  UserCog,
  LogOut
} from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { toast } from "sonner";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>("");
  
  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user) {
      setUserName(user.name);
    }
  }, []);

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      toast.success("Đăng xuất thành công");
      navigate("/");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi đăng xuất");
    }
  };

  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-white flex flex-col items-center py-6">
      {/* Avatar and User Info */}
      <div className="flex flex-col items-center space-y-4 mb-8">
        <Avatar className="w-24 h-24">
          <AvatarImage src="/avatar-placeholder.png" alt="Admin Avatar" />
          <AvatarFallback className="bg-gray-700 text-xl">
            {userName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="text-center">
          <p className="font-semibold">{userName}</p>
          <p className="text-sm text-gray-400">Admin</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex flex-col w-full px-4 space-y-2">
        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) =>
            `flex items-center px-4 py-2 rounded hover:bg-gray-700 transition-colors ${
              isActive ? "bg-gray-700 font-semibold" : ""
            }`
          }
        >
          <LayoutDashboard className="w-5 h-5 mr-3" />
          Dashboard
        </NavLink>

        <NavLink
          to="/admin/packages"
          className={({ isActive }) =>
            `flex items-center px-4 py-2 rounded hover:bg-gray-700 transition-colors ${
              isActive ? "bg-gray-700 font-semibold" : ""
            }`
          }
        >
          <Package className="w-5 h-5 mr-3" />
          Quản lý gói
        </NavLink>

        <NavLink
          to="/admin/users"
          className={({ isActive }) =>
            `flex items-center px-4 py-2 rounded hover:bg-gray-700 transition-colors ${
              isActive ? "bg-gray-700 font-semibold" : ""
            }`
          }
        >
          <Users className="w-5 h-5 mr-3" />
          Quản lý người dùng
        </NavLink>

        <NavLink
          to="/admin/profile"
          className={({ isActive }) =>
            `flex items-center px-4 py-2 rounded hover:bg-gray-700 transition-colors ${
              isActive ? "bg-gray-700 font-semibold" : ""
            }`
          }
        >
          <UserCog className="w-5 h-5 mr-3" />
          Thông tin cá nhân
        </NavLink>
      </nav>

    </aside>
  );
};

export default Sidebar;