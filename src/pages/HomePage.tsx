import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../components/Header";
import { Hero } from "../components/Hero";
import { StationFinder } from "../components/StationFinder";
import { Footer } from "../components/Footer";
import { ProfileModal } from "../components/ProfileModal";
import { useAuth } from "../contexts/AuthContext";

export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleAuthClick = () => {
    if (!isAuthenticated) navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-white">
      <Header
        onAuthClick={handleAuthClick}
        isAuthenticated={isAuthenticated}
        userName={user?.name}
        onNavigate={(v: any) => navigate(v === 'pricing' ? '/pricing' : '/')}
        currentView="home"
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      <main>
        <Hero onFindStations={() => {}} />
        <StationFinder onBookStation={() => { if (!isAuthenticated) navigate('/auth'); }} />
      </main>

      <Footer onNavigate={(v: any) => navigate(v === 'pricing' ? '/pricing' : '/') } />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
}
