import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { LanguageProvider } from "./components/LanguageProvider";
import { AuthProvider } from "./contexts/AuthContext";
import { Toaster } from "./components/ui/sonner";
import { ProtectedRoute } from "./components/ProtectedRoute";
import AdminLayout from "./components/AdminLayout";
import { EnhancedAdminDashboard } from "./components/EnhancedAdminDashboard";
import UserManagement from "./components/UserManagement";
import PackageManagement from "./components/PackageManagement";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import StaffPage from "./pages/StaffPage";
import AdminPage from "./pages/AdminPage";
import PricingPage from "./pages/PricingPage";
import SupportPage from "./pages/SupportPage";
import ProfilePage from "./pages/ProfilePage";
import AdminProfilePage from "./pages/AdminProfilePage";

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
    path: "/profile",
    element: <ProtectedRoute allowedRoles={["staff", "customer"]}><ProfilePage /></ProtectedRoute>,
  },
  {
    path: "/dashboard",
    element: <Navigate to="/" replace />,
  },
  {
    path: "/staff",
    element: <ProtectedRoute allowedRoles={["staff"]}><StaffPage /></ProtectedRoute>,
  },
  {
    path: "/admin",
    element: <ProtectedRoute allowedRoles={["admin"]}><AdminLayout /></ProtectedRoute>,
    children: [
      { path: "", element: <EnhancedAdminDashboard /> },
      { path: "dashboard", element: <EnhancedAdminDashboard /> },
      { path: "users", element: <UserManagement /> },
      { path: "packages", element: <PackageManagement /> },
      { path: "profile", element: <AdminProfilePage /> }
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