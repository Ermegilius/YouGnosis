import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { ReactNode } from "react";
import { LoadingSpinner } from "./LoadingSpinner";

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { loading, session } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!session) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
