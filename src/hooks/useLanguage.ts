import { useState, useEffect, createContext, useContext } from "react";
import { Language, Translation, getTranslation } from "../data/translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translation;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

export const useLanguageState = () => {
  const [language, setLanguageState] = useState<Language>(() => {
    // Check localStorage first, then browser language, then default to English
    try {
      const saved = localStorage.getItem("chargetech-language") as Language;
      if (saved && ["en", "vi", "ja"].includes(saved)) {
        return saved;
      }
    } catch (error) {
      // localStorage might not be available
      console.warn("localStorage not available:", error);
    }
    
    try {
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith("vi")) return "vi";
      if (browserLang.startsWith("ja")) return "ja";
    } catch (error) {
      // navigator might not be available
      console.warn("navigator not available:", error);
    }
    
    return "en";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("chargetech-language", lang);
    } catch (error) {
      console.warn("Could not save language preference:", error);
    }
  };

  const baseTranslation = getTranslation(language);
  
  // Add missing map-related translations with fallbacks
  const t = {
    ...baseTranslation,
    mapView: baseTranslation.mapView || "Map View",
    listView: baseTranslation.listView || "List View",
    viewLayout: baseTranslation.viewLayout || "View Layout",
    stationLayout: baseTranslation.stationLayout || "Station Layout",
    chargingPoints: baseTranslation.chargingPoints || "Charging Points",
    chargingPoint: baseTranslation.chargingPoint || "Charging Point",
    inUse: baseTranslation.inUse || "In Use",
    bookThisPoint: baseTranslation.bookThisPoint || "Book This Point",
    anyAvailable: baseTranslation.anyAvailable || "Book Any Available",
    statusOverview: baseTranslation.statusOverview || "Status Overview",
    quickActions: baseTranslation.quickActions || "Quick Actions",
    getDirections: baseTranslation.getDirections || "Get Directions",
    callStation: baseTranslation.callStation || "Call Station",
    reportIssue: baseTranslation.reportIssue || "Report Issue",
    facilities: baseTranslation.facilities || "Facilities",
    entrances: baseTranslation.entrances || "Entrances",
    connectorType: baseTranslation.connectorType || "Connector Type",
    powerLevel: baseTranslation.powerLevel || "Power Level",
    estimatedTime: baseTranslation.estimatedTime || "Estimated Time",
    currentUser: baseTranslation.currentUser || "Current User",
  } as Translation;

  useEffect(() => {
    // Update document language attribute
    try {
      if (typeof document !== "undefined") {
        document.documentElement.lang = language;
      }
    } catch (error) {
      console.warn("Could not set document language:", error);
    }
  }, [language]);

  return { language, setLanguage, t };
};