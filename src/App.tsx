import { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { StationFinder } from "./components/StationFinder";
import { BookingModal } from "./components/BookingModal";
import { UserDashboard } from "./components/UserDashboard";
import { EnhancedStaffDashboard } from "./components/EnhancedStaffDashboard";
import { EnhancedAdminDashboard } from "./components/EnhancedAdminDashboard";
import { PricingPage } from "./components/PricingPage";
import { SupportPage } from "./components/SupportPage";
import { Footer } from "./components/Footer";
import { RoleSelector } from "./components/RoleSelector";
import { LanguageProvider } from "./components/LanguageProvider";
import { Button } from "./components/ui/button";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import { useLanguage } from "./hooks/useLanguage";
import { 
  Station, 
  Booking, 
  User, 
  MockDatabaseService, 
  MOCK_USERS 
} from "./data/mockDatabase";

function AppContent() {
  const { t } = useLanguage();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<"home" | "dashboard" | "pricing" | "support" | "staff" | "admin">("home");
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && currentUser?.role === "customer" && currentUser.id && bookings.length === 0) {
      loadUserData(currentUser.id);
    }
  }, [isAuthenticated, currentUser?.id, currentUser?.role, bookings.length]);

  const loadUserData = async (userId: string) => {
    try {
      setIsLoading(true);
      const userBookings = await MockDatabaseService.getUserBookings(userId);
      setBookings(userBookings);
    } catch (error) {
      console.error("Failed to load user data:", error);
      toast.error(t.error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleSelect = (role: "customer" | "staff" | "admin") => {
    const selectedUser = MOCK_USERS.find(u => u.role === role);
    if (selectedUser) {
      setCurrentUser(selectedUser);
      setIsAuthenticated(true);
      setShowRoleSelector(false);
      
      if (role === "customer") {
        setCurrentView("dashboard");
        loadUserData(selectedUser.id);
      } else if (role === "staff") {
        setCurrentView("staff");
      } else if (role === "admin") {
        setCurrentView("admin");
      }
      
      toast.success(`${t.welcome} ${selectedUser.name}!`);
    }
  };

  const handleAuth = () => {
    if (!isAuthenticated) {
      setShowRoleSelector(true);
    } else {
      setIsAuthenticated(false);
      setCurrentUser(null);
      setBookings([]);
      setCurrentView("home");
      toast.success("You've been signed out.");
    }
  };

  const handleFindStations = () => {
    const stationsSection = document.getElementById("stations");
    if (stationsSection) {
      stationsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleBookStation = (station: Station) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to book a charging station.");
      return;
    }
    if (currentUser?.role !== "customer") {
      toast.error("Only customers can book charging stations.");
      return;
    }
    setSelectedStation(station);
    setIsBookingModalOpen(true);
  };

  const handleConfirmBooking = async (bookingData: Partial<Booking>) => {
    try {
      const newBooking = await MockDatabaseService.createBooking({
        ...bookingData,
        userId: currentUser?.id || "user_001"
      });
      setBookings((prev) => [...prev, newBooking]);
      toast.success(t.success);
    } catch (error) {
      console.error("Failed to create booking:", error);
      toast.error(t.error);
    }
  };

  const handleNavigate = (view: "home" | "dashboard" | "pricing" | "support" | "staff" | "admin") => {
    setCurrentView(view);
  };

  const handleGetStarted = (planId: string) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to select a plan.");
      return;
    }
    toast.success(`${planId.charAt(0).toUpperCase() + planId.slice(1)} plan selected!`);
  };

  // Show role selector if not authenticated and requested
  if (showRoleSelector) {
    return <RoleSelector onRoleSelect={handleRoleSelect} />;
  }

  const handleCloseBookingModal = () => {
    setIsBookingModalOpen(false);
    setSelectedStation(null);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case "home":
        return (
          <main>
            <Hero onFindStations={handleFindStations} />
            <StationFinder onBookStation={handleBookStation} />

            {/* Features Section */}
            <section className="py-16 bg-gray-50">
              <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold mb-4">
                    {t.whyChooseTitle}
                  </h2>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    {t.whyChooseSubtitle}
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">⚡</span>
                    </div>
                    <h3 className="font-semibold mb-2">{t.ultraFastCharging}</h3>
                    <p className="text-gray-600">
                      {t.ultraFastChargingDesc}
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">📱</span>
                    </div>
                    <h3 className="font-semibold mb-2">{t.easyBooking}</h3>
                    <p className="text-gray-600">
                      {t.easyBookingDesc}
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🌍</span>
                    </div>
                    <h3 className="font-semibold mb-2">{t.nationwideNetwork}</h3>
                    <p className="text-gray-600">
                      {t.nationwideNetworkDesc}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-green-600 text-white">
              <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl font-bold mb-4">
                  {t.readyToStartTitle}
                </h2>
                <p className="text-xl mb-8 opacity-90">
                  {t.readyToStartSubtitle}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    variant="secondary"
                    onClick={() => !isAuthenticated ? handleAuth() : handleNavigate("dashboard")}
                    className="bg-white text-green-600 hover:bg-gray-100"
                  >
                    {isAuthenticated ? t.goToDashboard : t.getStartedToday}
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => handleNavigate("pricing")}
                    className="border-white text-[rgba(21,191,80,1)] hover:bg-white hover:text-green-600"
                  >
                    {t.viewPricing}
                  </Button>
                </div>
              </div>
            </section>
          </main>
        );

      case "dashboard":
        return isAuthenticated && currentUser?.role === "customer" ? (
          <UserDashboard bookings={bookings} userName={currentUser.name} />
        ) : (
          <div className="container mx-auto px-4 py-16 text-center">
            <h2 className="text-2xl font-bold mb-4">{t.signIn}</h2>
            <p className="text-gray-600 mb-8">You need to sign in to access your dashboard.</p>
            <Button onClick={handleAuth} className="bg-green-600 hover:bg-green-700">
              {t.signIn}
            </Button>
          </div>
        );

      case "staff":
        return isAuthenticated && currentUser?.role === "staff" ? (
          <EnhancedStaffDashboard />
        ) : (
          <div className="container mx-auto px-4 py-16 text-center">
            <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-8">You need staff privileges to access this area.</p>
          </div>
        );

      case "admin":
        return isAuthenticated && currentUser?.role === "admin" ? (
          <EnhancedAdminDashboard />
        ) : (
          <div className="container mx-auto px-4 py-16 text-center">
            <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-8">You need administrator privileges to access this area.</p>
          </div>
        );

      case "pricing":
        return <PricingPage onGetStarted={handleGetStarted} />;

      case "support":
        return <SupportPage />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header
        onAuthClick={handleAuth}
        isAuthenticated={isAuthenticated}
        userName={currentUser?.name}
        currentView={currentView}
        onNavigate={handleNavigate}
      />

      {isLoading ? (
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t.loading}</p>
        </div>
      ) : (
        renderCurrentView()
      )}

      {/* Quick Navigation for Authenticated Users */}
      {isAuthenticated && (
        <div className="fixed bottom-6 right-6">
          <Button
            onClick={() => {
              if (currentUser?.role === "customer") {
                handleNavigate("dashboard");
              } else if (currentUser?.role === "staff") {
                handleNavigate("staff");
              } else if (currentUser?.role === "admin") {
                handleNavigate("admin");
              }
            }}
            className="bg-green-600 hover:bg-green-700 shadow-lg"
          >
            {currentUser?.role === "customer" ? t.dashboard : 
             currentUser?.role === "staff" ? t.staffDashboard : 
             t.adminDashboard}
          </Button>
        </div>
      )}

      <Footer onNavigate={handleNavigate} />

      <BookingModal
        station={selectedStation}
        isOpen={isBookingModalOpen}
        onClose={handleCloseBookingModal}
        onConfirmBooking={handleConfirmBooking}
      />

      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}