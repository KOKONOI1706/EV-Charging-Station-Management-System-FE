import { Button } from "./ui/button";
import { MapPin, Clock, Zap } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useLanguage } from "../hooks/useLanguage";

interface HeroProps {
  onFindStations: () => void;
  onLearnMore?: () => void;
}

export function Hero({ onFindStations, onLearnMore }: HeroProps) {
  const { t } = useLanguage();
  return (
    <section className="relative bg-gradient-to-br from-gray-50 to-white py-20">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                {t.heroTitle}
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                {t.heroSubtitle}
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button
                onClick={onFindStations}
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white px-8"
              >
                <MapPin className="w-5 h-5 mr-2" />
                {t.findStationsButton}
              </Button>
              <Button
                onClick={onLearnMore}
                variant="outline"
                size="lg"
                className="border-gray-300 hover:bg-gray-50"
              >
                {t.learnMore}
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-1">{t.ultraFastCharging}</h3>
                <p className="text-sm text-gray-600">{t.fastChargingShort}</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-1">{t.easyBooking}</h3>
                <p className="text-sm text-gray-600">{t.availableAlwaysShort}</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MapPin className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-1">{t.nationwideNetwork}</h3>
                <p className="text-sm text-gray-600">{t.locationsShort}</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1751355356724-7df0dda28b2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpYyUyMHZlaGljbGUlMjBjaGFyZ2luZyUyMHN0YXRpb24lMjBtb2Rlcm58ZW58MXx8fHwxNzU4Njc4NDg3fDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Modern EV charging station"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4 border">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold">{t.availableNow}</p>
                  <p className="text-sm text-gray-600">2 min walk away</p>
                </div>
              </div>
            </div>
            
            {/* Color-coding Legend */}
            <div className="absolute -bottom-12 -right-6 bg-white rounded-xl shadow-lg p-4 border">
              <h4 className="font-semibold text-sm mb-3">Station Status</h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>Full</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span>Soon Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                  <span>Maintenance</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}