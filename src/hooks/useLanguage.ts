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
    // Check localStorage first, then default to Vietnamese
    try {
      const saved = localStorage.getItem("chargetech-language") as Language;
      if (saved && ["en", "vi"].includes(saved)) {
        return saved;
      }
    } catch (error) {
      // localStorage might not be available
      console.warn("localStorage not available:", error);
    }
    
    // Default to Vietnamese
    return "vi";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("chargetech-language", lang);
    } catch (error) {
      console.warn("Could not save language preference:", error);
    }
  };

  const t = getTranslation(language);

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