import { Button } from "./ui/button";
import { User, Menu } from "lucide-react";
import { AuthService } from "../services/authService";
import { LanguageSelector } from "./LanguageSelector";
import { useLanguage } from "../hooks/useLanguage";

interface HeaderProps {
  onAuthClick: () => void;
  isAuthenticated: boolean;
  userName?: string;
  currentView: string;
  onNavigate: (view: "home" | "dashboard" | "pricing" | "support") => void;
  onOpenProfile?: () => void;
}

export function Header({ onAuthClick, isAuthenticated, userName, currentView, onNavigate, onOpenProfile }: HeaderProps) {
  const { t } = useLanguage();
  
  return (
    <header className="border-b bg-white/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-full"></div>
          </div>
          <button 
            onClick={async () => {
              // If user is authenticated, logout first before going home
              if (isAuthenticated) {
                try {
                  await AuthService.logout();
                  console.log('✅ Logged out when clicking logo');
                } catch (err) {
                  console.error('❌ Logout failed:', err);
                }
              }
              onNavigate("home");
            }}
            className="text-xl font-semibold hover:text-green-600 transition-colors"
          >
            ChargeTech
          </button>
        </div>

        <nav className="hidden md:flex items-center space-x-8">
          <button 
            onClick={() => currentView === "home" ? 
              document.getElementById("stations")?.scrollIntoView({ behavior: "smooth" }) : 
              onNavigate("home")
            } 
            className={`hover:text-green-600 transition-colors ${
              currentView === "home" ? "text-green-600" : ""
            }`}
          >
            {t.findStations}
          </button>
          {isAuthenticated && (
            <button 
              onClick={() => onNavigate("dashboard")} 
              className={`hover:text-green-600 transition-colors ${
                currentView === "dashboard" ? "text-green-600" : ""
              }`}
            >
              Dashboard
            </button>
          )}
          <button 
            onClick={() => onNavigate("pricing")} 
            className={`hover:text-green-600 transition-colors ${
              currentView === "pricing" ? "text-green-600" : ""
            }`}
          >
            {t.pricing}
          </button>
          <button 
            onClick={() => onNavigate("support")} 
            className={`hover:text-green-600 transition-colors ${
              currentView === "support" ? "text-green-600" : ""
            }`}
          >
            {t.support}
          </button>
        </nav>

        <div className="flex items-center space-x-4">
          <LanguageSelector />
          
          {isAuthenticated ? (
            <div className="flex items-center space-x-2">
              <button 
                onClick={onOpenProfile}
                className="flex items-center space-x-2 hover:bg-gray-100 rounded-lg px-2 py-1 transition-colors"
              >
                <User className="w-5 h-5" />
                <span className="hidden sm:inline">{t.welcome}, {userName}</span>
              </button>
              <Button
                onClick={async () => {
                  try {
                    await AuthService.logout();
                  } catch (err) {
                    console.error('Logout from header failed:', err);
                  }
                  window.location.href = '/';
                }}
                variant="outline"
                size="sm"
                className="ml-2"
              >
                {t.signOut}
              </Button>
            </div>
          ) : (
            <Button
              onClick={onAuthClick}
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50"
            >
              {t.signIn}
            </Button>
          )}
          <Button className="md:hidden" variant="ghost" size="icon">
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}