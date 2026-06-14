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
  anonKeyLooksValid: boolean;
  anonKeyLength: number;
} {
  const hasUrl = getCompanionSupabaseUrl().length > 0;
  const anonKey = getCompanionSupabaseAnonKey();
  const hasAnonKey = anonKey.length > 0;
  return {
    configured: hasUrl && hasAnonKey,
    hasUrl,
    hasAnonKey,
    anonKeyLooksValid: companionAnonKeyLooksValid(),
    anonKeyLength: anonKey.length,
  };
}

/** Validates client-side Supabase keys (legacy JWT or new publishable format). */
export function companionAnonKeyLooksValid(): boolean {
  const key = getCompanionSupabaseAnonKey();
  if (!key) return false;
  if (key.startsWith("sb_secret_")) return false;
  if (key.startsWith("eyJ")) return key.length >= 100;
  // New opaque publishable keys are ~46 chars: sb_publishable_<22>_<8>
  if (key.startsWith("sb_publishable_")) {
    return (
      key.length >= 40 &&
      /^sb_publishable_[A-Za-z0-9_-]+_[A-Za-z0-9_-]+$/.test(key)
    );
  }
  return key.length >= 80;
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
