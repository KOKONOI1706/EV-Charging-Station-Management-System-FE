import { useNavigate } from "react-router-dom";
import { Header } from "../components/Header";
import { Hero } from "../components/Hero";
import { StationFinder } from "../components/StationFinder";
import { Footer } from "../components/Footer";
import { useAuth } from "../contexts/AuthContext";

export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

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
        onNavigate={(v: any) => navigate(v === 'pricing' ? '/pricing' : '/')}
        currentView="home"
        onOpenProfile={() => navigate('/profile')}
      />

      <main>
        <Hero onFindStations={handleFindStations} onLearnMore={handleLearnMore} />
        <div id="station-finder">
          <StationFinder onBookStation={() => { if (!isAuthenticated) navigate('/auth'); }} />
        </div>
      </main>

      <Footer onNavigate={(v: any) => navigate(v === 'pricing' ? '/pricing' : '/') } />
    </div>
  );
}
