/**
 * ========================================
 * LANGUAGE SELECTOR COMPONENT
 * ========================================
 * Component chọn ngôn ngữ (English/Tiếng Việt)
 * 
 * Chức năng:
 * - Dropdown menu hiển thị các ngôn ngữ khả dụng
 * - Icon cờ + tên ngôn ngữ cho mỗi option
 * - Highlight ngôn ngữ đang active
 * - Click để đổi ngôn ngữ
 * - Responsive: Hiện full text trên desktop, chỉ cờ trên mobile
 * 
 * Ngôn ngữ support:
 * - en (English) 🇺🇸
 * - vi (Tiếng Việt) 🇻🇳
 * 
 * State management:
 * - Sử dụng useLanguage hook để get/set ngôn ngữ
 * - Preference được lưu trong localStorage
 * - Tự động apply cho toàn bộ app
 */

// Import icons
import { Globe } from "lucide-react";

// Import language hook và types
import { useLanguage } from "../hooks/useLanguage";
import { Language } from "../data/translations";

// Import UI components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  const languages: { code: Language; name: string; flag: string }[] = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "vi", name: "Tiếng Việt", flag: "🇻🇳" },
  ];

  const currentLanguage = languages.find(lang => lang.code === language) || languages[1];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Globe className="w-4 h-4" />
          <span className="hidden sm:inline">{currentLanguage.flag} {currentLanguage.name}</span>
          <span className="sm:hidden">{currentLanguage.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`gap-2 ${language === lang.code ? 'bg-accent' : ''}`}
          >
            <span>{lang.flag}</span>
            <span>{lang.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}