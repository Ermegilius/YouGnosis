import { Route, Routes, Navigate } from "react-router-dom";
import { useAuth } from "@src/hooks/useAuth";
import { ProtectedRoute } from "../components/ProtectedRoute";
import App from "../App";
import LoginPage from "@src/pages/LoginPage";
import LandingPage from "@src/pages/LandingPage";
import type { ReactNode } from "react";
import { LoadingSpinner } from "@src/components/LoadingSpinner";
import { AnalyticsDashboard } from "@src/components/AnalyticsDashboard";
import { CompetitorComparison } from "@src/components/CompetitorComparison";
import { SEORecommendations } from "@src/components/SEORecommendations";
import DashboardPage from "@src/pages/DashboardPage";
import { ProtectedLayout } from "@src/components/ProtectedLayout";

/**
 * PublicRoute - redirects authenticated users to /dashboard
 * Shows a loading state while auth is resolving.
 */
function PublicRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (session) return <Navigate to="/dashboard" replace />;
  return children;
}

/**
 * CatchAll - redirect based on auth state (authenticated -> /dashboard, else -> /)
 */
function CatchAll() {
  const { session, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  return <Navigate to={session ? "/dashboard" : "/"} replace />;
}

export const AppRouter = () => {
  return (
    <Routes>
      {/* Public Routes - no layout wrapper */}
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      {/* Protected Routes - wrapped in App layout */}
      <Route
        element={
          <ProtectedRoute>
            <App />
          </ProtectedRoute>
        }
      >
        <Route
          element={<ProtectedLayout />} // Wrap authenticated routes with ProtectedLayout
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/analytics" element={<AnalyticsDashboard />} />
          <Route path="/competitors" element={<CompetitorComparison />} />
          <Route path="/seo" element={<SEORecommendations />} />
        </Route>{" "}
      </Route>

      {/* Catch-all: redirect based on auth */}
      <Route path="*" element={<CatchAll />} />
    </Routes>
  );
};
