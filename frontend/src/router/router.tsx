import { Route, Routes, Navigate } from "react-router-dom";
import { useAuth } from "@src/hooks/useAuth";
import { ProtectedRoute } from "../components/ProtectedRoute";
import App from "../App";
import { TestDataDisplay } from "../components/TestDataDisplay";
import LoginPage from "@src/pages/LoginPage";
import LandingPage from "@src/pages/LandingPage";
import type { ReactNode } from "react";
import { LoadingSpinner } from "@src/components/LoadingSpinner";
import { AnalyticsDashboard } from "@src/components/AnalyticsDashboard";
import { CompetitorComparison } from "@src/components/CompetitorComparison";
import { SEORecommendations } from "@src/components/SEORecommendations";

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
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <App />
          </ProtectedRoute>
        }
      />
      <Route
        path="/test-data"
        element={
          <ProtectedRoute>
            <TestDataDisplay />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <AnalyticsDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/competitors"
        element={
          <ProtectedRoute>
            <CompetitorComparison />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seo"
        element={
          <ProtectedRoute>
            <SEORecommendations />
          </ProtectedRoute>
        }
      />

      {/* Catch-all: redirect based on auth */}
      <Route path="*" element={<CatchAll />} />
    </Routes>
  );
};
