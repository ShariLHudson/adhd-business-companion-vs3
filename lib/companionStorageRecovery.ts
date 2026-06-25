/**
 * Reclaim browser localStorage headroom when companion stores hit quota.
 * Only removes low-risk / regenerable keys — never brain dumps or projects.
 */

const TRIMMABLE_KEYS = [
  "companion-reminder-intake-v1",
  "companion-phase5-intelligence-ecosystem-v1",
  "companion-phase11-ecosystem-intelligence-v1",
  "companion-relationship-observation-usage-v1",
  "adhd-content-intelligence-v1",
  "companion-clear-my-mind-intelligence-v2",
  "companion-relief-intelligence-v1",
] as const;

export function reclaimCompanionStorageHeadroom(): number {
  if (typeof window === "undefined") return 0;

  let freed = 0;
  for (const key of TRIMMABLE_KEYS) {
    try {
      const value = localStorage.getItem(key);
      if (!value) continue;
      freed += value.length;
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }
  return freed;
}

export function isStorageQuotaError(err: unknown): boolean {
  if (err instanceof DOMException) {
    return (
      err.name === "QuotaExceededError" ||
      err.code === 22 ||
      err.code === 1014
    );
  }
  if (err && typeof err === "object" && "name" in err) {
    return (err as { name: string }).name === "QuotaExceededError";
  }
  return false;
}

/** Best-effort localStorage write — never throws on quota. */
export function safeLocalStorageSet(key: string, value: string): boolean {
  if (typeof window === "undefined") return false;

  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err) {
    if (!isStorageQuotaError(err)) return false;
    reclaimCompanionStorageHeadroom();
    try {
      localStorage.removeItem(key);
      localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  }
}
