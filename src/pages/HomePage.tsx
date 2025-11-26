/**
 * ===============================================================
 * HOME PAGE
 * ===============================================================
 * Trang chủ của ứng dụng - điểm đến đầu tiên của người dùng
 * 
 * Cấu trúc:
 * 1. Header: Thanh điều hướng với menu và auth button
 * 2. Hero Section: Banner chính với CTA buttons
 * 3. Station Finder: Công cụ tìm trạm sạc và đặt chỗ
 * 4. Footer: Thông tin liên hệ và links
 * 
 * Tính năng:
 * - 🔐 Hỗ trợ cả user đã đăng nhập và guest
 * - 👤 Tự động tạo guest user ID cho người chưa đăng nhập
 * - 📜 Smooth scroll đến Station Finder khi click "Tìm trạm sạc"
 * - 🧭 Navigation đến các trang khác: pricing, support, dashboard
 * 
 * Guest User:
 * - Guest user ID được tạo ngẫu nhiên và lưu trong localStorage
 * - Format: "guest-{timestamp}-{random}"
 * - Cho phép guest tìm trạm và xem thông tin (không đặt chỗ)
 * - localStorage key: 'guest-user-id'
 * 
 * Navigation handlers:
 * - handleAuthClick: Mở trang /auth nếu chưa đăng nhập
 * - handleFindStations: Smooth scroll đến #station-finder
 * - handleLearnMore: Điều hướng đến /pricing
 * - onNavigate: Routing đến pricing/support/dashboard/home
 * 
 * Props cho components:
 * - Header: isAuthenticated, userName, currentView='home'
 * - Hero: onFindStations, onLearnMore (CTA callbacks)
 * - StationFinderWithReservation: userId (authenticated user ID hoặc guestUserId)
 * - Footer: onNavigate callback
 * 
 * Dependencies:
 * - react-router-dom: Navigation
 * - AuthContext: Kiểm tra authentication state
 * - localStorage: Lưu guest user ID
 */

// Import React Router
import { useNavigate } from "react-router-dom";

// Import React hooks
import { useState, useEffect } from "react";

// Import components
import { Header } from "../components/Header";                                       // Thanh điều hướng
import { Hero } from "../components/Hero";                                           // Banner chính
import { StationFinderWithReservation } from "../components/StationFinderWithReservation"; // Tìm trạm + đặt chỗ
import { Footer } from "../components/Footer";                                       // Footer

// Import AuthContext để kiểm tra authentication
import { useAuth } from "../contexts/AuthContext";

/**
 * Component HomePage - Trang chủ của ứng dụng
 */
export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [guestUserId, setGuestUserId] = useState<string>('');

  useEffect(() => {
    // Generate or retrieve guest user ID
    let guestId = localStorage.getItem('guest-user-id');
    if (!guestId) {
      guestId = `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('guest-user-id', guestId);
    }
    setGuestUserId(guestId);
  }, []);

  const handleAuthClick = () => {
    if (!isAuthenticated) navigate('/auth');
  };

  const handleFindStations = () => {
    // Scroll to StationFinder section
    const stationFinderSection = document.getElementById('station-finder');
    if (stationFinderSection) {
      stationFinderSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleLearnMore = () => {
    // Navigate to pricing page to see more details
    navigate('/pricing');
  };

  return (
    <div className="min-h-screen bg-white">
      <Header
        onAuthClick={handleAuthClick}
        isAuthenticated={isAuthenticated}
        userName={user?.name}
        onNavigate={(v: any) => {
          if (v === 'pricing') navigate('/pricing');
          else if (v === 'support') navigate('/support');
          else if (v === 'dashboard') navigate('/dashboard');
          else navigate('/');
        }}
        currentView="home"
      />

      <main>
        <Hero onFindStations={handleFindStations} onLearnMore={handleLearnMore} />
        <div id="station-finder">
          {guestUserId && (
            <StationFinderWithReservation 
              userId={isAuthenticated ? (user?.id || guestUserId) : guestUserId} 
            />
          )}
        </div>
      </main>

      <Footer onNavigate={(v: any) => {
        if (v === 'pricing') navigate('/pricing');
        else if (v === 'support') navigate('/support');
        else if (v === 'dashboard') navigate('/dashboard');
        else navigate('/');
      }} />
    </div>
  );
}
