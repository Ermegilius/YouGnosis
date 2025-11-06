import type { Session, User } from "@supabase/supabase-js";
import { createContext } from "react";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  error: string | null;
  signInWithProvider: (p: "google") => Promise<void>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
