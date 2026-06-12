const STORAGE_KEY = "ecosystem-user-id-v1";

function newAnonymousUserId(): string {
  return `usr-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/** Stable anonymous id for ecosystem events — no email or PII. */
export function getEcosystemUserId(): string {
  if (typeof window === "undefined") return "server-anonymous";
  try {
    const existing = window.localStorage.getItem(STORAGE_KEY)?.trim();
    if (existing) return existing;
    const id = newAnonymousUserId();
    window.localStorage.setItem(STORAGE_KEY, id);
    return id;
  } catch {
    return newAnonymousUserId();
  }
}
