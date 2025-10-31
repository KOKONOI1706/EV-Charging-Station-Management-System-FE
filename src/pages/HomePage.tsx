import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Header } from "../components/Header";
import { Hero } from "../components/Hero";
import { StationFinderWithReservation } from "../components/StationFinderWithReservation";
import { Footer } from "../components/Footer";
import { useAuth } from "../contexts/AuthContext";

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

  // Redirect admin users to admin page
  if (user?.role === "admin") {
    navigate("/admin");
    return null;
  }

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
