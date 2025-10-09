import { useNavigate } from "react-router-dom";
import { Header } from "../components/Header";
import { Hero } from "../components/Hero";
import { StationFinder } from "../components/StationFinder";
import { Footer } from "../components/Footer";
import { useAuth } from "../contexts/AuthContext";

export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleAuthClick = () => {
    if (!isAuthenticated) navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-white">
      <Header
        onAuthClick={handleAuthClick}
        isAuthenticated={isAuthenticated}
        onNavigate={(v: any) => navigate(v === 'pricing' ? '/pricing' : '/')}
        currentView="home"
        onOpenProfile={() => {}}
      />

      <main>
        <Hero onFindStations={() => {}} />
        <StationFinder onBookStation={() => { if (!isAuthenticated) navigate('/auth'); }} />
      </main>

      <Footer onNavigate={(v: any) => navigate(v === 'pricing' ? '/pricing' : '/') } />
    </div>
  );
}
