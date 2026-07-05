/** Gentle login → home handoff — no modals, no blocking overlays. */

import { getCompanionSupabase } from "@/lib/supabase/companionClient";
import { COMPANION_LOGIN_OPENING_MESSAGE } from "@/lib/companionLoginPage";

/** Immediate route change after auth — home shell hydrates progressively. */
export const COMPANION_LOGIN_FADE_MS = 0 as const;
/** Only show fallback status if auth takes longer than expected. */
export const COMPANION_LOGIN_LOADING_DELAY_MS = 1500 as const;

export const COMPANION_LOGIN_SLOW_MESSAGES = [
  COMPANION_LOGIN_OPENING_MESSAGE,
  "Still opening your space…",
] as const;

const ARRIVAL_KEY = "companion-login-arrival-v1";

export function pickCompanionLoginSlowMessage(): string {
  const index = Math.floor(Math.random() * COMPANION_LOGIN_SLOW_MESSAGES.length);
  return COMPANION_LOGIN_SLOW_MESSAGES[index] ?? COMPANION_LOGIN_SLOW_MESSAGES[0];
}

export function markCompanionLoginArrival(): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(ARRIVAL_KEY, "1");
  } catch {
    /* quota */
  }
}

/** True after sign-in — survives React Strict Mode remounts until cleared. */
export function isCompanionPostLoginQuiet(): boolean {
  if (typeof sessionStorage === "undefined") return false;
  try {
    return sessionStorage.getItem(ARRIVAL_KEY) === "1";
  } catch {
    return false;
  }
}

export function clearCompanionPostLoginQuiet(): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.removeItem(ARRIVAL_KEY);
  } catch {
    /* quota */
  }
}

/** @deprecated Prefer isCompanionPostLoginQuiet — consume clears the flag. */
export function consumeCompanionLoginArrival(): boolean {
  const quiet = isCompanionPostLoginQuiet();
  if (quiet) clearCompanionPostLoginQuiet();
  return quiet;
}

const AUTH_STORAGE_KEY = "companion-supabase-auth";
const SIGNED_OUT_KEY = "companion-signed-out-v1";

/** After explicit sign-out — login page may show even when dev auth is bypassed. */
export function markCompanionSignedOut(): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(SIGNED_OUT_KEY, "1");
  } catch {
    /* quota */
  }
}

export function isCompanionSignedOut(): boolean {
  if (typeof sessionStorage === "undefined") return false;
  try {
    return sessionStorage.getItem(SIGNED_OUT_KEY) === "1";
  } catch {
    return false;
  }
}

export function clearCompanionSignedOut(): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.removeItem(SIGNED_OUT_KEY);
  } catch {
    /* quota */
  }
}

/** Remove persisted Supabase session from this browser. */
export function clearCompanionAuthStorage(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {
    /* quota */
  }
}

function authStorageHasSession(raw: string): boolean {
  if (raw.includes("access_token")) return true;
  if (raw.includes("refresh_token")) return true;
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (typeof parsed.access_token === "string" && parsed.access_token.length > 0) {
      return true;
    }
    const nested = parsed.currentSession;
    if (nested && typeof nested === "object") {
      const token = (nested as { access_token?: string }).access_token;
      return Boolean(token && token.length > 0);
    }
    const session = parsed.session;
    if (session && typeof session === "object") {
      const token = (session as { access_token?: string }).access_token;
      return Boolean(token && token.length > 0);
    }
  } catch {
    /* legacy string format */
  }
  return false;
}

/** True when Supabase already has a live session in memory or storage. */
export async function companionSignInSessionReady(
  timeoutMs = 3000,
): Promise<boolean> {
  if (typeof window === "undefined") return false;

  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (hasCompanionAuthStorageHint()) return true;
    const supabase = getCompanionSupabase();
    if (supabase) {
      const { data } = await supabase.auth.getSession();
      if (data.session?.access_token) return true;
    }
    await new Promise((resolve) => window.setTimeout(resolve, 50));
  }
  return false;
}

let companionHomeNavigationPending = false;

/** Hard navigation — reliable after sign-in (SPA replace can stall). */
export function navigateToCompanionHome(): void {
  if (typeof window === "undefined") return;
  if (companionHomeNavigationPending) return;
  if (window.location.pathname.replace(/\/$/, "") === "/companion") {
    markCompanionLoginArrival();
    return;
  }
  companionHomeNavigationPending = true;
  markCompanionLoginArrival();
  window.location.replace("/companion");
}

/** @internal test helper */
export function resetCompanionHomeNavigationForTests(): void {
  companionHomeNavigationPending = false;
}

/** Wait until Supabase has written the session to localStorage before navigating. */
export async function waitForCompanionAuthStorage(
  timeoutMs = 3000,
): Promise<boolean> {
  if (typeof window === "undefined") return false;
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (raw && authStorageHasSession(raw)) return true;
    } catch {
      /* noop */
    }
    await new Promise((resolve) => window.setTimeout(resolve, 50));
  }
  return false;
}

export function hasCompanionAuthStorageHint(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return Boolean(raw && authStorageHasSession(raw));
  } catch {
    return false;
  }
}
