import React, { useState } from "react";
import { supabase } from "@src/supabase/supabase";

const GoogleOAuth2Button: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`, // Redirect after successful login
        },
      });

      if (error) {
        console.error("Google login failed:", error.message);
        setError(error.message);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      console.error("Unexpected error during login:", errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleLogin}
        disabled={loading}
        className="hidden items-center gap-2 rounded-md bg-gradient-to-r from-red-500 to-blue-600 px-3 py-1 text-sm font-medium text-white shadow-sm hover:opacity-95 focus:outline-none sm:inline-flex"
      >
        {loading ? "Logging in..." : "Login with Google"}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default GoogleOAuth2Button;
