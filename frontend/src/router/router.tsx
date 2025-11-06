import { Route, Routes, Navigate } from "react-router-dom";
import { useAuth } from "@src/hooks/useAuth";
import { ProtectedRoute } from "../components/ProtectedRoute";
import App from "../App";
import { TestDataDisplay } from "../components/TestDataDisplay";
import LoginPage from "@src/pages/LoginPage";
import LandingPage from "@src/pages/LandingPage";
import type { ReactNode } from "react";
import { LoadingSpinner } from "@src/components/LoadingSpinner";

/**
 * PublicRoute - redirects authenticated users to /test-data.
 * Shows a loading state while auth is resolving.
 */
function PublicRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  if (session) return <Navigate to="/test-data" replace />;
  return children;
}

/**
 * CatchAll - redirect based on auth state (authenticated -> /test-data, else -> /)
 */
function CatchAll() {
  const { session, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  return <Navigate to={session ? "/test-data" : "/"} replace />;
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

      {/* Catch-all: redirect based on auth */}
      <Route path="*" element={<CatchAll />} />
    </Routes>
  );
};
