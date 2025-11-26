/**
 * ===============================================================
 * MAIN ENTRY POINT (ĐIỂM VÀO CHÍNH)
 * ===============================================================
 * Entry point của React application
 * 
 * Chức năng:
 * - 🧹 Clear localStorage khi dev server first start
 * - 🔄 Giữ localStorage khi hot reload
 * - 🚀 Render React app vào DOM
 * 
 * Dev mode localStorage handling:
 * - Problem: localStorage.clear() mọi hot reload → User bị logout liên tục
 * - Solution: 
 *   * Dùng sessionStorage để track dev session
 *   * Chỉ clear localStorage lần đầu start dev server
 *   * Hot reload → Giữ nguyên localStorage
 *   * Close browser/tab → sessionStorage clear → Next time clear localStorage
 * 
 * Flow:
 * 1. Check import.meta.env.DEV (Vite dev mode)
 * 2. Kiểm tra sessionStorage có 'dev_session_started' chưa
 * 3. Nếu chưa (first start):
 *    - Clear localStorage
 *    - Set sessionStorage.dev_session_started = 'true'
 * 4. Nếu có rồi (hot reload):
 *    - Giữ nguyên localStorage
 *    - Log "Hot reload detected"
 * 
 * React render:
 * - createRoot(document.getElementById("root")!)
 * - Render <AppWithRouter />
 * - AppWithRouter chứa:
 *   * LanguageProvider
 *   * AuthProvider
 *   * RouterProvider (React Router)
 *   * Toaster (notifications)
 * 
 * CSS imports:
 * - index.css: Tailwind + global styles
 * - leaflet.css: Leaflet map styles
 * 
 * Note:
 * - Vite dùng import.meta.env thay vì process.env
 * - DEV mode chỉ có khi chạy npm run dev
 * - Production build không có DEV mode
 * 
 * Dependencies:
 * - React 18 (createRoot)
 * - AppWithRouter: Root component
 * - Leaflet CSS: Map styles
 */

// Clear localStorage only on first dev server start, not on every hot reload
if (import.meta.env.DEV) {
  const devSessionKey = 'dev_session_started';
  const currentDevSession = sessionStorage.getItem(devSessionKey);
  
  if (!currentDevSession) {
    // This is the first load of dev server
    console.log('🧹 DEV MODE: First start - Clearing localStorage');
    localStorage.clear();
    // Mark this dev session as started (will be cleared when browser/tab closes)
    sessionStorage.setItem(devSessionKey, 'true');
  } else {
    console.log('✅ DEV MODE: Hot reload detected - Keeping localStorage');
  }
}

import { createRoot } from "react-dom/client";
import AppWithRouter from "./AppWithRouter";
import "./index.css";
import "leaflet/dist/leaflet.css";

createRoot(document.getElementById("root")!).render(<AppWithRouter />);  