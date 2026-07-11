/**
 * Reclaim browser localStorage headroom when companion stores hit quota.
 * Only removes low-risk / regenerable keys — never brain dumps or projects.
 */

export const COMPANION_AUTH_STORAGE_KEY = "companion-supabase-auth";

/** True when this browser can read and write localStorage. */
export function isCompanionLocalStorageAvailable(): boolean {
  if (typeof window === "undefined") return false;
  const probeKey = "__companion_ls_probe__";
  try {
    localStorage.setItem(probeKey, "1");
    const ok = localStorage.getItem(probeKey) === "1";
    localStorage.removeItem(probeKey);
    return ok;
  } catch {
    return false;
  }
}

const TRIMMABLE_KEYS = [
  "companion-reminder-intake-v1",
  "companion-phase5-intelligence-ecosystem-v1",
  "companion-phase11-ecosystem-intelligence-v1",
  "companion-relationship-observation-usage-v1",
  "adhd-content-intelligence-v1",
  "companion-clear-my-mind-intelligence-v2",
  "companion-relief-intelligence-v1",
  "companion-conversation-v1",
  "companion-momentum-v1",
  "companion-workspace-session-v1",
  "spark-estate-analytics-v1",
  "spark-estate-daily-session-v1",
  "companion-home-visit-count-v1",
  "companion-frictionless-pending-v1",
] as const;

/** Keys kept even during aggressive auth recovery (member prefs + active session). */
const AUTH_RECOVERY_PROTECTED_KEYS = new Set([
  COMPANION_AUTH_STORAGE_KEY,
  "companion-prefs-v1",
]);

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

/** Remove large regenerable companion caches when auth still cannot persist. */
export function reclaimAggressiveCompanionStorage(): number {
  if (typeof window === "undefined") return 0;

  let freed = reclaimCompanionStorageHeadroom();
  try {
    for (let i = localStorage.length - 1; i >= 0; i -= 1) {
      const key = localStorage.key(i);
      if (!key || AUTH_RECOVERY_PROTECTED_KEYS.has(key)) continue;
      if (!key.startsWith("companion-") && !key.startsWith("spark-")) continue;
      const value = localStorage.getItem(key);
      if (!value) continue;
      freed += value.length;
      localStorage.removeItem(key);
    }
  } catch {
    /* ignore */
  }
  return freed;
}

/** Free headroom before writing a Supabase session — sign-in depends on this. */
export function prepareStorageForAuthSession(): number {
  return reclaimCompanionStorageHeadroom();
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

function tryLocalStorageSet(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return localStorage.getItem(key) === value;
  } catch {
    return false;
  }
}

/** Best-effort localStorage write — never throws on quota. */
export function safeLocalStorageSet(key: string, value: string): boolean {
  if (typeof window === "undefined") return false;

  if (tryLocalStorageSet(key, value)) return true;

  reclaimCompanionStorageHeadroom();
  try {
    localStorage.removeItem(key);
  } catch {
    /* noop */
  }
  if (tryLocalStorageSet(key, value)) return true;

  if (key === COMPANION_AUTH_STORAGE_KEY) {
    reclaimAggressiveCompanionStorage();
    try {
      localStorage.removeItem(key);
    } catch {
      /* noop */
    }
    return tryLocalStorageSet(key, value);
  }

  return false;
}

export type QuotaSafeStorage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

/**
 * Supabase auth and other SDKs must never throw from setItem — an uncaught
 * QuotaExceededError breaks the React tree and blocks workspace opens.
 */
export function createQuotaSafeStorage(): QuotaSafeStorage {
  return {
    getItem(key: string): string | null {
      if (typeof window === "undefined") return null;
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    setItem(key: string, value: string): void {
      if (key === COMPANION_AUTH_STORAGE_KEY) {
        prepareStorageForAuthSession();
      }
      safeLocalStorageSet(key, value);
    },
    removeItem(key: string): void {
      if (typeof window === "undefined") return;
      try {
        localStorage.removeItem(key);
      } catch {
        /* noop */
      }
    },
  };
}
