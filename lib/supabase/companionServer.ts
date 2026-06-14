import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import {
  companionAnonKeyLooksValid,
  companionAuthConfigured,
  getCompanionSupabaseAnonKey,
  getCompanionSupabaseUrl,
} from "@/lib/supabase/companionClient";

/** Server-side Supabase client for companion auth (anon key). */
export function getCompanionSupabaseServer(): SupabaseClient | null {
  if (!companionAuthConfigured()) return null;
  return createClient(getCompanionSupabaseUrl(), getCompanionSupabaseAnonKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export { companionAnonKeyLooksValid };
