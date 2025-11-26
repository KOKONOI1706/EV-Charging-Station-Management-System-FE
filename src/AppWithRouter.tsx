/**
 * ===============================================================
 * APP WITH ROUTER (ỨNG DỤNG VỚI ROUTING)
 * ===============================================================
 * Root component thiết lập routing và global providers
 * 
 * Chức năng:
 * - 🛣️ React Router với tất cả routes
 * - 🌐 LanguageProvider (multi-language)
 * - 🔐 AuthProvider (authentication context)
 * - 🔔 Toaster (notifications)
 * 
 * Routes:
 * 
 * Public routes:
 * - / → HomePage (landing page)
 * - /auth → AuthPage (login/register)
 * - /pricing → PricingPage (pricing plans)
 * - /support → SupportPage (help/FAQ)
 * - /payment/callback → PaymentCallback (MoMo/VNPay return)
 * - /reservation-test → ReservationTestPage (testing)
 * 
 * Protected routes (Customer):
 * - /dashboard → DashboardPage
 * - /charging-session → ChargingSessionPage
 * - /user-history → UserHistoryPage
 * - /personal-report → PersonalReportPage
 * 
 * Protected routes (Staff):
 * - /staff → StaffPage (staff dashboard)
 * - Có thể access /user-history, /personal-report
 * 
 * Protected routes (Admin):
 * - /admin → AdminPage (admin dashboard)
 * - Có thể access tất cả routes
 * 
 * 404 route:
 * - * → 404 page với link về home
 * 
 * Provider hierarchy:
 * ```
 * LanguageProvider (outermost)
 *   └─ AuthProvider
 *       └─ RouterProvider
 *       └─ Toaster
 * ```
 * 
 * ProtectedRoute:
 * - Wrapper kiểm tra authentication + role
 * - allowedRoles: ['customer'] / ['staff'] / ['admin']
 * - Nếu không authorized → Redirect /auth
 * 
 * Toaster:
 * - Sonner toast notifications
 * - Position: bottom-right
 * - Duration: 3s default
 * 
 * Router config:
 * - createBrowserRouter (React Router v6)
 * - HTML5 history mode
 * - No hash (#) in URLs
 * 
 * Dependencies:
 * - React Router v6
 * - LanguageProvider: i18n
 * - AuthProvider: Authentication context
 * - Sonner: Toast notifications
 */

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { LanguageProvider } from "./components/LanguageProvider";
import { AuthProvider } from "./contexts/AuthContext";
import { ReservationProvider } from "./contexts/ReservationContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { RootLayout } from "./components/RootLayout";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import StaffPage from "./pages/StaffPage";
import AdminPage from "./pages/AdminPage";
import PricingPage from "./pages/PricingPage";
import SupportPage from "./pages/SupportPage";
import UserHistoryPage from "./pages/UserHistoryPage";
import PersonalReportPage from "./pages/PersonalReportPage";
import ChargingSessionPage from "./pages/ChargingSessionPage";
import { ReservationTestPage } from "./pages/ReservationTestPage";
import PaymentCallback from "./pages/PaymentCallback";

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
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
        element: (
          <ProtectedRoute allowedRoles={['customer']}>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/staff",
        element: (
          <ProtectedRoute allowedRoles={['staff']}>
            <StaffPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin",
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminPage />
          </ProtectedRoute>
        ),
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
          <ProtectedRoute allowedRoles={['customer', 'staff', 'admin']}>
            <UserHistoryPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/personal-report",
        element: (
          <ProtectedRoute allowedRoles={['customer', 'staff', 'admin']}>
            <PersonalReportPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/charging-session",
        element: (
          <ProtectedRoute allowedRoles={['customer', 'staff', 'admin']}>
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
        element: <ReservationTestPage />,
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
    ],
  },
]);

function AppWithRouter() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ReservationProvider>
          <RouterProvider router={router} />
        </ReservationProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default AppWithRouter;