import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { LanguageProvider } from "./components/LanguageProvider";
import { AuthProvider } from "./contexts/AuthContext";
import { Toaster } from "./components/ui/sonner";
import AdminLayout from "./components/AdminLayout";
import { EnhancedAdminDashboard } from "./components/EnhancedAdminDashboard";
import { ProtectedRoute } from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import StaffPage from "./pages/StaffPage";
import DashboardPage from "./pages/DashboardPage";
import AdminDashboard from "./pages/AdminDashboard";
import PricingPage from "./pages/PricingPage";
import SupportPage from "./pages/SupportPage";
import UserHistoryPage from "./pages/UserHistoryPage";
import PersonalReportPage from "./pages/PersonalReportPage";
import ChargingSessionPage from "./pages/ChargingSessionPage";
import { ReservationTestPage } from "./pages/ReservationTestPage";
import PaymentCallback from "./pages/PaymentCallback";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/auth",
    element: <AuthPage />,
  },
  {
    path: "/dashboard",
    element: <DashboardPage />,
  },
  {
    path: "/staff",
    element: <StaffPage />,
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute requireAdmin={true}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { 
        path: "", 
        element: <AdminDashboard />
      },
      { 
        path: "dashboard", 
        element: <AdminDashboard />
      },
      { 
        path: "enhanced", 
        element: <EnhancedAdminDashboard />
      }
    ]
  },
  {
    path: "/pricing",
    element: <PricingPage />,
  },
  {
    path: "/support",
    element: <SupportPage />,
  },
  {
    path: "/user-history",
    element: (
      <ProtectedRoute allowedRoles={["customer"]}>
        <UserHistoryPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/personal-report",
    element: (
      <ProtectedRoute allowedRoles={["customer"]}>
        <PersonalReportPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/charging-session",
    element: (
      <ProtectedRoute allowedRoles={["customer"]}>
        <ChargingSessionPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/payment/callback",
    element: <PaymentCallback />,
  },
  {
    path: "/reservation-test",
    element: (
      <ProtectedRoute allowedRoles={["customer"]}>
        <ReservationTestPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-gray-600 mb-4">Page not found</p>
          <a href="/" className="text-green-600 hover:underline">Go to Home</a>
        </div>
      </div>
    ),
  },
]);

function AppWithRouter() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster />
      </AuthProvider>
    </LanguageProvider>
  );
}

export default AppWithRouter;