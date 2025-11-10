import { Route, Routes, Navigate } from "react-router-dom";
import { useAuth } from "@src/hooks/useAuth";
import { ProtectedRoute } from "../components/ProtectedRoute";
import App from "../App";
import LandingPage from "@src/pages/LandingPage";
import { LoadingSpinner } from "@src/components/LoadingSpinner";
import { AnalyticsDashboard } from "@src/components/AnalyticsDashboard";
import { CompetitorComparison } from "@src/components/CompetitorComparison";
import { SEORecommendations } from "@src/components/SEORecommendations";
import DashboardPage from "@src/pages/DashboardPage";

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

      {/* Protected Routes - wrapped in App layout */}
      <Route
        element={
          <ProtectedRoute>
            <App />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/analytics" element={<AnalyticsDashboard />} />
        <Route path="/competitors" element={<CompetitorComparison />} />
        <Route path="/seo" element={<SEORecommendations />} />
      </Route>

      {/* Catch-all: redirect based on auth */}
      <Route path="*" element={<CatchAll />} />
    </Routes>
  );
};
