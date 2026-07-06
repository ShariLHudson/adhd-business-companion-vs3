import { isCompanionAuthBypassed } from "@/lib/companionAuthBypass";

/** Founder Studio™ — private. Replace with roles when auth supports them. */
const DEFAULT_FOUNDER_EMAILS = [
  "shari@visualsparkstudios.com",
  "shari@sparkadhd.com",
] as const;

function parseEnvAllowlist(): string[] {
  const raw = process.env.NEXT_PUBLIC_FOUNDER_ALLOWED_EMAILS?.trim();
  if (!raw) return [];
  return raw
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

export function getFounderAllowedEmails(): readonly string[] {
  const merged = new Set<string>([
    ...DEFAULT_FOUNDER_EMAILS.map((e) => e.toLowerCase()),
    ...parseEnvAllowlist(),
  ]);
  return [...merged];
}

export function normalizeFounderEmail(
  email: string | null | undefined,
): string | null {
  const trimmed = email?.trim().toLowerCase();
  return trimmed || null;
}

export function isFounderAllowedEmail(
  email: string | null | undefined,
): boolean {
  const normalized = normalizeFounderEmail(email);
  if (!normalized) return false;
  return getFounderAllowedEmails().includes(normalized);
}

/**
 * Local dev: when companion auth is bypassed, allow Founder Studio so Shari can
 * iterate without signing in. Production always requires an allowlisted email.
 */
export function canAccessFounderStudio(
  email: string | null | undefined,
): boolean {
  if (isFounderAllowedEmail(email)) return true;
  if (
    isCompanionAuthBypassed() &&
    process.env.NODE_ENV === "development"
  ) {
    return true;
  }
  return false;
}
