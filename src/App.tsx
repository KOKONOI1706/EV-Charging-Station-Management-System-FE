import { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { StationFinder } from "./components/StationFinder";
import { BookingModal } from "./components/BookingModal";
import { LoginModal } from "./components/LoginModal";
import { ProfileModal } from "./components/ProfileModal";
import { UserDashboard } from "./components/UserDashboard";
import { EnhancedStaffDashboard } from "./components/EnhancedStaffDashboard";
import { EnhancedAdminDashboard } from "./components/EnhancedAdminDashboard";
import { PricingPage } from "./components/PricingPage";
import { SupportPage } from "./components/SupportPage";
import { Footer } from "./components/Footer";
import { LanguageProvider } from "./components/LanguageProvider";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Button } from "./components/ui/button";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import { 
  Station, 
  Booking, 
  User,
  MockDatabaseService
} from "./data/mockDatabase";

function AppContent() {
  const { user, login, logout, isAuthenticated, isLoading } = useAuth();

  const [currentView, setCurrentView] = useState<"home" | "dashboard" | "pricing" | "support" | "staff" | "admin">("home");
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.role === "customer" && user.id && bookings.length === 0) {
      loadUserData(user.id);
    }
  }, [isAuthenticated, user?.id, user?.role, bookings.length]);

  const loadUserData = async (userId: string) => {
    try {
      setIsLoadingData(true);
      const userBookings = await MockDatabaseService.getUserBookings(userId);
      setBookings(userBookings);
    } catch (error) {
      console.error("Failed to load user data:", error);
      toast.error("Failed to load user data");
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleLoginSuccess = (authenticatedUser: User) => {
    login(authenticatedUser);
    
    // Navigate to appropriate dashboard based on role
    if (authenticatedUser.role === "customer") {
      setCurrentView("dashboard");
      loadUserData(authenticatedUser.id);
    } else if (authenticatedUser.role === "staff") {
      setCurrentView("staff");
    } else if (authenticatedUser.role === "admin") {
      setCurrentView("admin");
    }
  };

  const handleAuth = () => {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
    } else {
      handleLogout();
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setBookings([]);
      setCurrentView("home");
      toast.success("You've been signed out successfully.");
    } catch (error) {
      toast.error("Error signing out. Please try again.");
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
      setIsLoginModalOpen(true);
      return;
    }
    if (user?.role !== "customer") {
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
        userId: user?.id || "user_001"
      });
      setBookings((prev) => [...prev, newBooking]);
      toast.success("Booking confirmed successfully!");
    } catch (error) {
      console.error("Failed to create booking:", error);
      toast.error("Failed to create booking. Please try again.");
    }
  };

  const handleNavigate = (view: "home" | "dashboard" | "pricing" | "support" | "staff" | "admin") => {
    setCurrentView(view);
  };

  const handleGetStarted = (planId: string) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to select a plan.");
      setIsLoginModalOpen(true);
      return;
    }
    toast.success(`${planId.charAt(0).toUpperCase() + planId.slice(1)} plan selected!`);
  };

  const handleCloseBookingModal = () => {
    setIsBookingModalOpen(false);
    setSelectedStation(null);
  };

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

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
                    Why Choose ChargeTech?
                  </h2>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    Experience the future of EV charging with our cutting-edge technology and nationwide network.
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">⚡</span>
                    </div>
                    <h3 className="font-semibold mb-2">Ultra-Fast Charging</h3>
                    <p className="text-gray-600">
                      Get up to 350kW charging speeds for the fastest possible charge times.
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">📱</span>
                    </div>
                    <h3 className="font-semibold mb-2">Easy Booking</h3>
                    <p className="text-gray-600">
                      Reserve your charging spot in advance with our intuitive mobile app.
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🌍</span>
                    </div>
                    <h3 className="font-semibold mb-2">Nationwide Network</h3>
                    <p className="text-gray-600">
                      Access over 500 charging locations across the country.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-green-600 text-white">
              <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl font-bold mb-4">
                  Ready to Start Charging?
                </h2>
                <p className="text-xl mb-8 opacity-90">
                  Join thousands of EV drivers who choose ChargeTech for their charging needs.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    variant="secondary"
                    onClick={() => !isAuthenticated ? handleAuth() : handleNavigate("dashboard")}
                    className="bg-white text-green-600 hover:bg-gray-100"
                  >
                    {isAuthenticated ? "Go to Dashboard" : "Get Started Today"}
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => handleNavigate("pricing")}
                    className="border-white text-white hover:bg-white hover:text-green-600"
                  >
                    View Pricing
                  </Button>
                </div>
              </div>
            </section>
          </main>
        );

      case "dashboard":
        return isAuthenticated && user?.role === "customer" ? (
          <UserDashboard bookings={bookings} userName={user.name} />
        ) : (
          <div className="container mx-auto px-4 py-16 text-center">
            <h2 className="text-2xl font-bold mb-4">Access Restricted</h2>
            <p className="text-gray-600 mb-8">You need to sign in as a customer to access this dashboard.</p>
            <Button onClick={handleAuth} className="bg-green-600 hover:bg-green-700">
              Sign In
            </Button>
          </div>
        );

      case "staff":
        return isAuthenticated && user?.role === "staff" ? (
          <EnhancedStaffDashboard />
        ) : (
          <div className="container mx-auto px-4 py-16 text-center">
            <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-8">You need staff privileges to access this area.</p>
            <Button onClick={handleAuth} className="bg-green-600 hover:bg-green-700">
              Sign In as Staff
            </Button>
          </div>
        );

      case "admin":
        return isAuthenticated && user?.role === "admin" ? (
          <EnhancedAdminDashboard />
        ) : (
          <div className="container mx-auto px-4 py-16 text-center">
            <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-8">You need administrator privileges to access this area.</p>
            <Button onClick={handleAuth} className="bg-green-600 hover:bg-green-700">
              Sign In as Admin
            </Button>
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
        userName={user?.name}
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      {isLoadingData ? (
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your data...</p>
        </div>
      ) : (
        renderCurrentView()
      )}

      {/* Quick Navigation for Authenticated Users */}
      {isAuthenticated && (
        <div className="fixed bottom-6 right-6">
          <Button
            onClick={() => {
              if (user?.role === "customer") {
                handleNavigate("dashboard");
              } else if (user?.role === "staff") {
                handleNavigate("staff");
              } else if (user?.role === "admin") {
                handleNavigate("admin");
              }
            }}
            className="bg-green-600 hover:bg-green-700 shadow-lg"
          >
            {user?.role === "customer" ? "Dashboard" : 
             user?.role === "staff" ? "Staff Panel" : 
             "Admin Panel"}
          </Button>
        </div>
      )}

      <Footer onNavigate={handleNavigate} />

      {/* Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

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
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}