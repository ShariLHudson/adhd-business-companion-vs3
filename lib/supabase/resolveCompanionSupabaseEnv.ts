/**
 * Resolves Supabase URL + publishable/anon key even when Vercel env vars are
 * pasted into the wrong fields. Scans all companion Supabase env slots.
 */

import { isBrowserSafeSupabaseKey } from "./supabaseKeyRoles";

/** Public project URL — safe to ship; not a secret. */
export const COMPANION_SUPABASE_URL_DEFAULT =
  "https://weercszpdcxjxauxrhmj.supabase.co";

const SUPABASE_ENV_KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_ANON_KEY",
] as const;

export function isSupabaseProjectUrl(value: string): boolean {
  const v = value.trim();
  return (
    v.startsWith("https://") &&
    v.includes(".supabase.co") &&
    !v.startsWith("sb_")
  );
}

export function isSupabaseClientKey(value: string): boolean {
  return isBrowserSafeSupabaseKey(value);
}

function uniqueNonEmpty(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of values) {
    const t = v.trim();
    if (!t || seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}

function collectCandidateValues(): string[] {
  const fromNamed = SUPABASE_ENV_KEYS.map(
    (name) => process.env[name]?.trim() ?? "",
  );
  const projectRef = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_REF?.trim();
  if (projectRef && /^[a-z0-9]+$/.test(projectRef)) {
    fromNamed.push(`https://${projectRef}.supabase.co`);
  }
  return uniqueNonEmpty(fromNamed);
}

export type ResolvedCompanionSupabaseEnv = {
  url: string;
  key: string;
  usedUrlFallback: boolean;
  autoCorrectedEnv: boolean;
};

let cached: ResolvedCompanionSupabaseEnv | null = null;

export function resolveCompanionSupabaseEnv(): ResolvedCompanionSupabaseEnv {
  if (cached) return cached;

  const candidates = collectCandidateValues();
  let url = "";
  let key = "";
  let autoCorrectedEnv = false;

  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const rawKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.SUPABASE_ANON_KEY?.trim() ||
    "";

  for (const v of candidates) {
    if (!url && isSupabaseProjectUrl(v)) url = v.replace(/\/$/, "");
    if (!key && isSupabaseClientKey(v)) key = v;
  }

  if (rawUrl && !isSupabaseProjectUrl(rawUrl)) autoCorrectedEnv = true;
  if (rawKey && !isSupabaseClientKey(rawKey)) autoCorrectedEnv = true;
  if (rawUrl && isSupabaseClientKey(rawUrl)) autoCorrectedEnv = true;
  if (rawKey && isSupabaseProjectUrl(rawKey)) autoCorrectedEnv = true;

  let usedUrlFallback = false;
  if (!url && key) {
    url = COMPANION_SUPABASE_URL_DEFAULT;
    usedUrlFallback = true;
    autoCorrectedEnv = true;
  }

  cached = { url, key, usedUrlFallback, autoCorrectedEnv };
  return cached;
}

/** @internal test helper */
export function clearResolvedCompanionSupabaseEnvCache(): void {
  cached = null;
}
