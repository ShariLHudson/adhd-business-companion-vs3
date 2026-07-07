/**
 * Stable anonymous member id for discovery history (V1).
 */

const STORAGE_KEY = "spark:discovery:member-id";

export function getDiscoveryMemberId(): string {
  if (typeof localStorage === "undefined") {
    return "discovery-member-session";
  }

  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) return existing;

    const created =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `member-${Date.now()}`;

    localStorage.setItem(STORAGE_KEY, created);
    return created;
  } catch {
    return "discovery-member-session";
  }
}
