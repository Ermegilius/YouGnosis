import { Navigate } from "react-router-dom";
import { useAuth } from "@src/hooks/useAuth";
import { LoadingSpinner } from "./LoadingSpinner";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * ProtectedRoute - Wrapper for routes that require authentication.
 * Redirects to /login if user is not authenticated.
 * Shows loading spinner while checking auth state.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps): ReactNode {
  const { session, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!session) {
    return <Navigate to="/" replace />;
  }

  return children;
}
