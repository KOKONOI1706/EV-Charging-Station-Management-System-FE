import React from "react";

export default function AdminHeader() {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white shadow-sm border-b">
      {/* Logo */}
      <div className="flex items-center space-x-2">
        <img src="/logo.svg" alt="ChargeTech Logo" className="h-8 w-8" />
        <span className="text-xl font-semibold text-gray-800">ChargeTech Admin</span>
      </div>

      {/* Right Side */}
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-600">VN Tiếng Việt</span>
        <span className="text-sm text-gray-700 font-medium">Chào mừng, Michael Chen</span>
        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
          Đăng xuất
        </button>
      </div>
    </header>
  );
}
