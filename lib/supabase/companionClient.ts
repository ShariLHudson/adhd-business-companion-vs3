import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import {
  resolveCompanionSupabaseEnv,
  type ResolvedCompanionSupabaseEnv,
} from "@/lib/supabase/resolveCompanionSupabaseEnv";
import { isBrowserSafeSupabaseKey } from "@/lib/supabase/supabaseKeyRoles";

let browserClient: SupabaseClient | null = null;
let runtimeConfig: { url: string; key: string } | null = null;
let bootstrapPromise: Promise<boolean> | null = null;

/** Safe prefix for deploy debug — never exposes full secrets. */
export function envValuePrefix(value: string): string {
  const v = value.trim();
  if (!v) return "";
  if (v.startsWith("https://")) return v.slice(0, 24) + "…";
  if (v.startsWith("sb_publishable_")) return "sb_publishable_…";
  if (v.startsWith("eyJ")) return "eyJ…";
  if (v.startsWith("sb_")) return v.slice(0, 12) + "…";
  return v.slice(0, 8) + "…";
}

function resolved(): ResolvedCompanionSupabaseEnv {
  if (runtimeConfig) {
    return {
      url: runtimeConfig.url,
      key: runtimeConfig.key,
      usedUrlFallback: false,
      autoCorrectedEnv: false,
    };
  }
  return resolveCompanionSupabaseEnv();
}

/** Load Supabase URL + anon key from server when NEXT_PUBLIC vars are not in the client bundle. */
export async function bootstrapCompanionSupabaseConfig(): Promise<boolean> {
  if (companionAuthConfigured()) return true;
  if (bootstrapPromise) return bootstrapPromise;

  bootstrapPromise = (async () => {
    try {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 8_000);
      const res = await fetch("/api/companion-auth/config", {
        signal: controller.signal,
      });
      window.clearTimeout(timeout);
      const data = (await res.json()) as {
        configured?: boolean;
        url?: string;
        anonKey?: string;
      };
      if (data.configured && data.url && data.anonKey) {
        runtimeConfig = { url: data.url, key: data.anonKey };
        browserClient = null;
        return true;
      }
    } catch {
      /* noop */
    }
    return false;
  })();

  return bootstrapPromise;
}

export function getCompanionSupabaseUrl(): string {
  return resolved().url;
}

export function getCompanionSupabaseAnonKey(): string {
  return resolved().key;
}

export function companionSupabaseUrlLooksValid(): boolean {
  const url = getCompanionSupabaseUrl();
  if (!url.startsWith("https://")) return false;
  if (url.startsWith("sb_")) return false;
  return url.includes(".supabase.co");
}

export function companionAnonKeyLooksValid(): boolean {
  return isBrowserSafeSupabaseKey(getCompanionSupabaseAnonKey());
}

export function companionAuthConfigured(): boolean {
  return Boolean(
    companionSupabaseUrlLooksValid() &&
      getCompanionSupabaseAnonKey() &&
      companionAnonKeyLooksValid(),
  );
}

export function companionAuthConfigStatus(): {
  configured: boolean;
  hasUrl: boolean;
  hasAnonKey: boolean;
  urlLooksValid: boolean;
  anonKeyLooksValid: boolean;
  anonKeyLength: number;
  autoCorrectedEnv: boolean;
  usedSupabaseUrlFallback: boolean;
} {
  const r = resolved();
  const anonKey = r.key;
  return {
    configured: companionAuthConfigured(),
    hasUrl: r.url.length > 0,
    hasAnonKey: anonKey.length > 0,
    urlLooksValid: companionSupabaseUrlLooksValid(),
    anonKeyLooksValid: companionAnonKeyLooksValid(),
    anonKeyLength: anonKey.length,
    autoCorrectedEnv: r.autoCorrectedEnv,
    usedSupabaseUrlFallback: r.usedUrlFallback,
  };
}

/** Only shown when auto-resolve still cannot find a valid key. */
export function companionAuthMisconfigHint(): string | null {
  if (companionAuthConfigured()) return null;
  const r = resolved();
  if (!r.key) {
    return "Add your Supabase anon/publishable key to companion-app/.env.local as NEXT_PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_ANON_KEY), then restart npm run dev. Get it from Supabase → Settings → API Keys.";
  }
  if (!companionAnonKeyLooksValid()) {
    return "Supabase publishable key does not look valid. Copy it from Supabase → Settings → API Keys (copy icon).";
  }
  return null;
}

export function companionSupabaseEnvLooksSwapped(): boolean {
  return resolved().autoCorrectedEnv;
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
