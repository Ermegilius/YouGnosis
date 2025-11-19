import React, { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../supabase/supabase";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get current session (persisted by supabase client)
    supabase.auth
      .getSession()
      .then(({ data: { session }, error }) => {
        if (error) {
          console.error("Session retrieval error:", error.message);
          setError(error.message);
        }
        setSession(session);
        setUser(session?.user ?? null);

        // Store user ID in localStorage for API calls
        // ❌ No longer needed, backend relies solely on Supabase JWT
        // if (session?.user?.id) {
        //   localStorage.setItem("userId", session.user.id);
        // } else {
        //   localStorage.removeItem("userId");
        // }

        setLoading(false);
      })
      .catch((err) => {
        console.error("Unexpected session error:", err);
        setError("Failed to retrieve session");
        setLoading(false);
      });

    // Subscribe to auth state changes (login/logout/refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setError(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async (): Promise<void> => {
    try {
      setError(null);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Sign out error:", error.message);
        setError(error.message);
        throw error;
      }
      setSession(null);
      setUser(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Sign out failed";
      setError(errorMessage);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, error, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
