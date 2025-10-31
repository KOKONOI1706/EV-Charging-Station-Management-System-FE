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