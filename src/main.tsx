
// MUST BE FIRST: Clear auth data before anything else loads
// This ensures clean state when running npm run dev
if (import.meta.env.DEV) {
  console.log('🧹 DEV MODE: Clearing all auth data for clean start');
  localStorage.clear(); // Clear ALL localStorage, not just currentUser
  sessionStorage.clear();
}

import { createRoot } from "react-dom/client";
import AppWithRouter from "./AppWithRouter";
import "./index.css";
import "leaflet/dist/leaflet.css";

createRoot(document.getElementById("root")!).render(<AppWithRouter />);  