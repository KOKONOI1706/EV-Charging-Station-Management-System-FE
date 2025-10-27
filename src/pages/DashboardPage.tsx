import { UserDashboard } from "../components/UserDashboard";
import { useAuth } from "../contexts/AuthContext";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  // Check for pending charging session from reservation check-in
  const checkPendingSession = () => {
    const pendingData = localStorage.getItem('pending-charging-session');
    if (pendingData) {
      try {
        const data = JSON.parse(pendingData);
        // Don't clear yet - will be cleared after session starts successfully
        return data;
      } catch (e) {
        console.error('Error parsing pending session:', e);
        return null;
      }
    }
    return null;
  };

  const pendingSession = checkPendingSession();

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
        <UserDashboard 
          bookings={[]} 
          userName={user?.name || "User"}
          autoOpenStartCharging={pendingSession?.autoStartCharging}
          pendingChargingData={pendingSession}
        />
      </main>

      <Footer onNavigate={(view) => {
        if (view === 'pricing') navigate('/pricing');
        else navigate('/');
      }} />
    </div>
  );
}
