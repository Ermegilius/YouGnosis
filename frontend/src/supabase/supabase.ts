import { createClient } from "@supabase/supabase-js";
import type { Database } from "@common/supabase.types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl) {
  throw new Error(
    "VITE_SUPABASE_URL is not defined. Please check your .env.development file.",
  );
}

if (!supabasePublishableKey) {
  throw new Error(
    "VITE_SUPABASE_PUBLISHABLE_KEY is not defined. Please check your .env.development file.",
  );
}

if (!supabasePublishableKey.startsWith("sb_publishable_")) {
  throw new Error(
    "VITE_SUPABASE_PUBLISHABLE_KEY must start with 'sb_publishable_'. " +
      "Please use the new Supabase API key format.",
  );
}

export const supabase = createClient<Database>(
  supabaseUrl,
  supabasePublishableKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: window.localStorage,
      storageKey: "yougnosis-auth",
      flowType: "pkce",
    },
  },
);
