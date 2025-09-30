import { MapPin, Phone, Mail, Twitter, Facebook, Instagram, Linkedin } from "lucide-react";

interface FooterProps {
  onNavigate: (view: "home" | "dashboard" | "pricing" | "support") => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </div>
              <h3 className="text-xl font-semibold">ChargeTech</h3>
            </div>
            <p className="text-gray-400">
              Powering the future of electric mobility with reliable, fast, and accessible charging solutions.
            </p>
            <div className="flex space-x-4">
              <Twitter className="w-5 h-5 text-gray-400 hover:text-green-400 cursor-pointer transition-colors" />
              <Facebook className="w-5 h-5 text-gray-400 hover:text-green-400 cursor-pointer transition-colors" />
              <Instagram className="w-5 h-5 text-gray-400 hover:text-green-400 cursor-pointer transition-colors" />
              <Linkedin className="w-5 h-5 text-gray-400 hover:text-green-400 cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold">Quick Links</h4>
            <div className="space-y-2">
              <button 
                onClick={() => onNavigate("home")}
                className="block text-gray-400 hover:text-green-400 transition-colors"
              >
                Find Stations
              </button>
              <button 
                onClick={() => onNavigate("pricing")}
                className="block text-gray-400 hover:text-green-400 transition-colors"
              >
                Pricing Plans
              </button>
              <button 
                onClick={() => onNavigate("support")}
                className="block text-gray-400 hover:text-green-400 transition-colors"
              >
                Support Center
              </button>
              <a href="#" className="block text-gray-400 hover:text-green-400 transition-colors">
                Mobile App
              </a>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="font-semibold">Services</h4>
            <div className="space-y-2">
              <a href="#" className="block text-gray-400 hover:text-green-400 transition-colors">
                DC Fast Charging
              </a>
              <a href="#" className="block text-gray-400 hover:text-green-400 transition-colors">
                Level 2 Charging
              </a>
              <a href="#" className="block text-gray-400 hover:text-green-400 transition-colors">
                Fleet Solutions
              </a>
              <a href="#" className="block text-gray-400 hover:text-green-400 transition-colors">
                Business Partnerships
              </a>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-green-400" />
                <span className="text-gray-400">1-800-CHARGE-1</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-green-400" />
                <span className="text-gray-400">support@chargetech.com</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-green-400 mt-1" />
                <span className="text-gray-400">
                  123 Electric Ave<br />
                  San Francisco, CA 94105
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © 2024 ChargeTech. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}