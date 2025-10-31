
import { createRoot } from "react-dom/client";
import AppWithRouter from "./AppWithRouter";
import "./index.css";
import "leaflet/dist/leaflet.css";

createRoot(document.getElementById("root")!).render(<AppWithRouter />);  