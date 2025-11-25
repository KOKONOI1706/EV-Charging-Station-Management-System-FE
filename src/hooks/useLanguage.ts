/**
 * ========================================
 * USE LANGUAGE HOOK
 * ========================================
 * Custom React Hook để quản lý đa ngôn ngữ (i18n)
 * 
 * Chức năng:
 * - Quản lý ngôn ngữ hiện tại (Vietnamese/English)
 * - Lưu preference vào localStorage
 * - Cung cấp object translations (t) cho ngôn ngữ hiện tại
 * - Tự động cập nhật document.lang attribute
 * 
 * Ngôn ngữ support:
 * - "vi": Tiếng Việt (default)
 * - "en": English
 * 
 * Cách sử dụng:
 * ```tsx
 * const { language, setLanguage, t } = useLanguage();
 * 
 * // Thay đổi ngôn ngữ
 * setLanguage('en');
 * 
 * // Sử dụng translations
 * <h1>{t.welcome}</h1>
 * ```
 * 
 * Lưu ý:
 * - Preference được lưu vào localStorage key: "chargetech-language"
 * - Nếu không có preference, mặc định là "vi"
 * - Nếu localStorage error, fallback về "vi" và log warning
 */

// Import React hooks
import { useState, useEffect, createContext, useContext } from "react";

// Import translations data và types
import { Language, Translation, getTranslation } from "../data/translations";

/**
 * Interface định nghĩa cấu trúc LanguageContext
 */
interface LanguageContextType {
  language: Language;                    // Ngôn ngữ hiện tại
  setLanguage: (lang: Language) => void; // Hàm đổi ngôn ngữ
  t: Translation;                        // Object chứa tất cả translations
}

// Tạo LanguageContext
export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

/**
 * Hook để sử dụng LanguageContext
 * Throw error nếu dùng ngoài LanguageProvider
 */
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