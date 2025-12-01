import { Route, Routes, Navigate } from "react-router-dom";
import { useAuth } from "@src/hooks/useAuth";
import { ProtectedRoute } from "../components/ProtectedRoute";
import App from "../App";
import LandingPage from "@src/pages/LandingPage";
import { LoadingSpinner } from "@src/components/ui";
import { AnalyticsDashboard } from "@src/components/AnalyticsDashboard";
import { CompetitorComparison } from "@src/components/CompetitorComparison";
import { SEORecommendations } from "@src/components/SEORecommendations";
import DashboardPage from "@src/pages/DashboardPage";
import { ProtectedLayout } from "@src/components/ProtectedLayout";
import ReportTypes from "@src/pages/ReportTypes";
import OAuthCallback from "@src/pages/OAuthCallback";
import YouTubeJobs from "@src/pages/JobManagementPage";
import PrivacyPolicyPage from "@src/pages/PrivacyPolicyPage";
import TermsOfUsePage from "@src/pages/TermsOfUsePage";
import { ConsentScreenPage } from "@src/pages/ConsentScreenPage";
import { AnonLayout } from "@src/components/AnonLayout";

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
      {/* Public Routes - wrapped in AnonLayout for nav/footer */}
      <Route element={<AnonLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms-of-use" element={<TermsOfUsePage />} />
        <Route path="/consent" element={<ConsentScreenPage />} />
      </Route>

      {/* OAuth callback route */}
      <Route path="/auth/callback" element={<OAuthCallback />} />

      {/* Protected Routes - wrapped in App layout */}
      <Route
        element={
          <ProtectedRoute>
            <App />
          </ProtectedRoute>
        }
      >
        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/analytics" element={<AnalyticsDashboard />} />
          <Route path="/analytics/report-types" element={<ReportTypes />} />
          <Route path="/analytics/youtube-jobs" element={<YouTubeJobs />} />
          <Route path="/competitors" element={<CompetitorComparison />} />
          <Route path="/seo" element={<SEORecommendations />} />
        </Route>
      </Route>

      {/* Catch-all: redirect based on auth */}
      <Route path="*" element={<CatchAll />} />
    </Routes>
  );
};
