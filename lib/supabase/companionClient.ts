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

/** Publishable/JWT keys are much longer than a few dozen characters when copied fully. */
export function companionAnonKeyLooksValid(): boolean {
  const key = getCompanionSupabaseAnonKey();
  if (!key) return false;
  if (key.startsWith("eyJ")) return key.length >= 100;
  if (key.startsWith("sb_publishable_")) return key.length >= 50;
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
