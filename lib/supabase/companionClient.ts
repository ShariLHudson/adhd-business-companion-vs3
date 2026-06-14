import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

export function getCompanionSupabaseUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
}

export function getCompanionSupabaseAnonKey(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    ""
  );
}

export function companionAuthConfigured(): boolean {
  return Boolean(getCompanionSupabaseUrl() && getCompanionSupabaseAnonKey());
}

export function companionAuthConfigStatus(): {
  configured: boolean;
  hasUrl: boolean;
  hasAnonKey: boolean;
} {
  const hasUrl = getCompanionSupabaseUrl().length > 0;
  const hasAnonKey = getCompanionSupabaseAnonKey().length > 0;
  return {
    configured: hasUrl && hasAnonKey,
    hasUrl,
    hasAnonKey,
  };
}

/** Browser Supabase client for companion user auth (anon key only). */
export function getCompanionSupabase(): SupabaseClient | null {
  if (!companionAuthConfigured()) return null;
  if (browserClient) return browserClient;
  browserClient = createClient(
    getCompanionSupabaseUrl(),
    getCompanionSupabaseAnonKey(),
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    },
  );
  return browserClient;
}
