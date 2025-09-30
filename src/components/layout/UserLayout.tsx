import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { User, LogOut, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UserLayoutProps {
  children: React.ReactNode;
}

export const UserLayout: React.FC<UserLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      {/* Simple Header for User */}
      <header className="border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo/Brand */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-electric-blue rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">EV</span>
              </div>
              <h1 className="text-xl font-bold">EV Charging</h1>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span>Welcome, {user.name || user.email}</span>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/profile')}
                className="hidden md:flex"
              >
                <Settings className="w-4 h-4 mr-2" />
                Profile
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - giống Index.tsx */}
      <main>
        {children}
      </main>

      {/* Footer - giống Index.tsx */}
      <footer className="border-t border-border/60">
        <div className="container mx-auto px-4 py-10 grid md:grid-cols-3 gap-8">
          <div>
            <h5 className="font-semibold">Newsletter subs</h5>
            <p className="mt-2 text-sm text-muted-foreground">Get product updates and offers.</p>
            <div className="mt-4 flex gap-2">
              <input className="flex-1 h-10 rounded-md bg-muted px-3 text-sm outline-none" placeholder="Enter your email" />
              <Button>Subscribe</Button>
            </div>
          </div>
          <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Home</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Company</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Contact</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Product</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};