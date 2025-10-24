import { UserDashboard } from "../components/UserDashboard";
import { useAuth } from "../contexts/AuthContext";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { useNavigate } from "react-router-dom";

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect to auth if not logged in
  if (!isAuthenticated) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onAuthClick={() => navigate('/auth')}
        isAuthenticated={isAuthenticated}
        userName={user?.name}
        currentView="dashboard"
        onNavigate={(view) => {
          if (view === 'home') navigate('/');
          else if (view === 'pricing') navigate('/pricing');
          else if (view === 'support') navigate('/support');
        }}
        onOpenProfile={() => navigate('/profile')}
      />
      
      <main className="py-8">
        <UserDashboard bookings={[]} userName={user?.name || "User"} />
      </main>

      <Footer onNavigate={(view) => {
        if (view === 'pricing') navigate('/pricing');
        else navigate('/');
      }} />
    </div>
  );
}
