import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { createQuotaSafeStorage } from "@/lib/companionStorageRecovery";
import {
  resolveCompanionSupabaseEnv,
  type ResolvedCompanionSupabaseEnv,
} from "@/lib/supabase/resolveCompanionSupabaseEnv";
import { isBrowserSafeSupabaseKey } from "@/lib/supabase/supabaseKeyRoles";

const companionAuthStorage = createQuotaSafeStorage();

let browserClient: SupabaseClient | null = null;
let runtimeConfig: { url: string; key: string } | null = null;
let bootstrapPromise: Promise<boolean> | null = null;

function applyRuntimeConfig(url: string, key: string): boolean {
  const normalizedUrl = url.replace(/\/$/, "");
  if (
    runtimeConfig?.url === normalizedUrl &&
    runtimeConfig?.key === key
  ) {
    return false;
  }
  runtimeConfig = { url: normalizedUrl, key };
  browserClient = null;
  if (typeof window !== "undefined") {
    const existing = window.__COMPANION_SUPABASE_CLIENT__;
    if (
      existing &&
      (existing.url !== normalizedUrl || existing.key !== key)
    ) {
      delete window.__COMPANION_SUPABASE_CLIENT__;
    }
  }
  return true;
}

type CompanionInlineAuth = { url: string; key: string };

declare global {
  interface Window {
    __COMPANION_SUPABASE__?: CompanionInlineAuth;
    __COMPANION_SUPABASE_CLIENT__?: {
      url: string;
      key: string;
      client: SupabaseClient;
    };
  }
}

/** Apply server-inlined auth config before React hydrates. */
export function hydrateCompanionAuthFromInlineConfig(): boolean {
  if (typeof window === "undefined") return false;
  const payload = window.__COMPANION_SUPABASE__;
  if (!payload?.url || !payload?.key) return false;
  if (!isBrowserSafeSupabaseKey(payload.key)) return false;
  applyRuntimeConfig(payload.url, payload.key);
  return true;
}

/** Client bootstrap from server layout — replaces inline script tags. */
export function seedCompanionSupabaseInlineConfig(
  url: string,
  key: string,
): boolean {
  if (typeof window === "undefined") return false;
  if (!url || !key || !isBrowserSafeSupabaseKey(key)) return false;
  if (!url.includes(".supabase.co")) return false;
  const normalizedUrl = url.replace(/\/$/, "");
  window.__COMPANION_SUPABASE__ = { url: normalizedUrl, key };
  applyRuntimeConfig(normalizedUrl, key);
  return true;
}

if (typeof window !== "undefined") {
  hydrateCompanionAuthFromInlineConfig();
}
/** Pause auth network calls after Supabase returns 429 (rate limit). */
let authBackoffUntil = 0;

/** Clear rate-limit backoff — call before explicit sign-in. */
export function resetCompanionAuthBackoff(): void {
  authBackoffUntil = 0;
}

function companionAuthFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const url = String(input);
  return fetch(input, init).then((res) => {
    if (res.status === 429 && url.includes("/auth/v1/")) {
      authBackoffUntil = Date.now() + 60_000;
    }
    return res;
  });
}

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

/** Sync + async bootstrap — call once on app load before showing misconfig UI. */
export async function ensureCompanionSupabaseConfigured(
  inline?: { url: string; anonKey: string } | null,
): Promise<boolean> {
  if (inline?.url && inline.anonKey) {
    seedCompanionSupabaseInlineConfig(inline.url, inline.anonKey);
  }
  hydrateCompanionAuthFromInlineConfig();
  if (companionAuthConfigured()) return true;
  return bootstrapCompanionSupabaseConfig();
}

/** Load Supabase URL + anon key from server when NEXT_PUBLIC vars are not in the client bundle. */
export async function bootstrapCompanionSupabaseConfig(): Promise<boolean> {
  if (companionAuthConfigured()) return true;
  hydrateCompanionAuthFromInlineConfig();
  if (companionAuthConfigured()) return true;

  const attempt = async (): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 20_000);
      const res = await fetch("/api/companion-auth/config", {
        signal: controller.signal,
        cache: "no-store",
      });
      window.clearTimeout(timeout);
      if (!res.ok) return false;
      const data = (await res.json()) as {
        configured?: boolean;
        url?: string;
        anonKey?: string;
      };
      if (data.configured && data.url && data.anonKey) {
        applyRuntimeConfig(data.url, data.anonKey);
        return companionAuthConfigured();
      }
    } catch {
      /* noop */
    }
    return false;
  };

  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      for (let i = 0; i < 3; i += 1) {
        if (await attempt()) return true;
        if (i < 2) {
          await new Promise((resolve) => window.setTimeout(resolve, 200 * (i + 1)));
        }
      }
      return false;
    })().finally(() => {
      if (!companionAuthConfigured()) {
        bootstrapPromise = null;
      }
    });
  }

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
  hydrateCompanionAuthFromInlineConfig();
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

/** Member-safe hint when auth env is missing — never surfaces dev tooling on production. */
export function companionAuthMisconfigHint(): string | null {
  if (companionAuthConfigured()) return null;
  const r = resolved();
  const isLocalDev =
    typeof window !== "undefined"
      ? /localhost|127\.0\.0\.1/.test(window.location.hostname)
      : process.env.NODE_ENV === "development";

  if (!r.key) {
    if (isLocalDev) {
      return "Add your Supabase anon/publishable key to companion-app/.env.local as NEXT_PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_ANON_KEY), then restart npm run dev. Get it from Supabase → Settings → API Keys.";
    }
    return "Sign-in isn't connected on this site yet. If this keeps showing, reach out — we'll get you in.";
  }
  if (!companionAnonKeyLooksValid()) {
    if (isLocalDev) {
      return "Supabase publishable key does not look valid. Copy it from Supabase → Settings → API Keys (copy icon).";
    }
    return "Sign-in isn't quite ready yet. If this keeps showing, reach out and we'll sort it out.";
  }
  return null;
}

export function companionSupabaseEnvLooksSwapped(): boolean {
  return resolved().autoCorrectedEnv;
}

/** Browser Supabase client for companion user auth (anon key only). */
export function getCompanionSupabase(): SupabaseClient | null {
  hydrateCompanionAuthFromInlineConfig();
  if (!companionAuthConfigured()) return null;

  const url = getCompanionSupabaseUrl();
  const key = getCompanionSupabaseAnonKey();

  if (typeof window !== "undefined") {
    const global = window.__COMPANION_SUPABASE_CLIENT__;
    if (global && global.url === url && global.key === key) {
      browserClient = global.client;
      return global.client;
    }
  }

  if (browserClient) return browserClient;

  const client = createClient(url, key, {
    global: { fetch: companionAuthFetch },
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: "companion-supabase-auth",
      storage: companionAuthStorage,
    },
  });
  browserClient = client;
  if (typeof window !== "undefined") {
    window.__COMPANION_SUPABASE_CLIENT__ = { url, key, client };
  }
  return client;
}
