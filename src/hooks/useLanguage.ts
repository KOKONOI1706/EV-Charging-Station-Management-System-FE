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
    // Try to get saved language preference, default to Vietnamese
    try {
      const saved = localStorage.getItem("chargetech-language");
      if (saved && (saved === "en" || saved === "vi")) {
        return saved as Language;
      }
    } catch (error) {
      console.warn("Could not read language preference:", error);
    }
    return "vi"; // Default to Vietnamese
  });

  const setLanguage = (lang: Language) => {
    // Allow both English and Vietnamese
    if (lang === "en" || lang === "vi") {
      setLanguageState(lang);
      try {
        localStorage.setItem("chargetech-language", lang);
      } catch (error) {
        console.warn("Could not save language preference:", error);
      }
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