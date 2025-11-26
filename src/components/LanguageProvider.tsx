/**
 * ===============================================================
 * LANGUAGE PROVIDER (CONTEXT NGÔN NGỮ)
 * ===============================================================
 * Provider component cung cấp language context cho toàn app
 * 
 * Chức năng:
 * - 🌐 Wrap toàn bộ app với LanguageContext
 * - 🔄 Cho phép các component con access language state
 * - 🇻🇳🇬🇧 Support Vietnamese + English
 * 
 * Props:
 * - children: ReactNode - Các component con
 * 
 * Provider value:
 * - Từ useLanguageState() hook:
 *   * language: 'vi' | 'en'
 *   * setLanguage: (lang) => void
 *   * t: Translation object (tất cả keys)
 * 
 * Usage:
 * ```tsx
 * // Trong App root
 * <LanguageProvider>
 *   <App />
 * </LanguageProvider>
 * 
 * // Trong component con
 * const { language, setLanguage, t } = useLanguage();
 * return <h1>{t.welcome}</h1>;
 * ```
 * 
 * Translations:
 * - Stored trong useLanguage hook
 * - Vietnamese (default): t.vi
 * - English: t.en
 * 
 * Dependencies:
 * - useLanguageState: Custom hook quản lý language state
 * - LanguageContext: React Context
 */

import { ReactNode } from "react";
import { LanguageContext, useLanguageState } from "../hooks/useLanguage";

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const languageState = useLanguageState();

  return (
    <LanguageContext.Provider value={languageState}>
      {children}
    </LanguageContext.Provider>
  );
}