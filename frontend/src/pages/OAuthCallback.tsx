import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@src/supabase/supabase";
import { LoadingSpinner } from "@src/components/ui";
import type { ReactNode } from "react";

/**
 * OAuthCallback - Handles OAuth redirect from backend.
 * Verifies session token and establishes Supabase session.
 */
export default function OAuthCallback(): ReactNode {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const sessionToken = searchParams.get("session_token");
      const errorParam = searchParams.get("error");

      // Handle OAuth error from backend
      if (errorParam) {
        setError(`Authentication failed: ${errorParam}`);
        setTimeout(() => navigate("/", { replace: true }), 3000);
        return;
      }

      // Handle missing session token
      if (!sessionToken) {
        setError("No session token received");
        setTimeout(() => navigate("/", { replace: true }), 3000);
        return;
      }

      try {
        // Verify the session token with Supabase
        const { data, error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: sessionToken,
          type: "magiclink",
        });

        if (verifyError || !data.session) {
          throw new Error("Failed to verify session token");
        }

        // Redirect home on success
        navigate("/", { replace: true });
      } catch (err) {
        console.error("OAuth callback error:", err);
        setError("Failed to complete authentication");
        setTimeout(() => navigate("/", { replace: true }), 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="card max-w-md text-center">
        {error ? (
          <>
            <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-400">
              <p className="font-medium">{error}</p>
            </div>
            <p className="card-content">Redirecting to login...</p>
          </>
        ) : (
          <>
            <LoadingSpinner />
            <h2 className="card-title mt-4 text-xl">
              Completing authentication...
            </h2>
            <p className="card-content mt-2">
              Please wait while we connect your YouTube account.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
