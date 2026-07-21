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

/** 074 — Creation durability keys must survive aggressive auth reclaim. */
export const RUNTIME_CREATION_RECORDS_KEY = "spark.runtimeCreationRecords.v1";
export const ACTIVE_WORKSPACE_REGISTRY_KEY = "spark.activeWorkspaceRegistry.v1";
export const LAST_ACTIVE_WORKSPACE_KEY = "spark.lastActiveWorkspaceId.v1";
export const CREATE_WORKFLOW_RECORD_KEY = "companion-create-workflow-record-v1";
export const EVENT_RECORDS_STORAGE_KEY = "companion-events-intelligence-v1";

/** Keys that must get aggressive reclaim retry when a write hits quota. */
export const CREATION_DURABILITY_KEYS = new Set([
  RUNTIME_CREATION_RECORDS_KEY,
  ACTIVE_WORKSPACE_REGISTRY_KEY,
  LAST_ACTIVE_WORKSPACE_KEY,
  CREATE_WORKFLOW_RECORD_KEY,
  EVENT_RECORDS_STORAGE_KEY,
  "companion-events-intelligence-active-id",
  "companion-creation-continuity-v1",
  "companion-create-workflow-saved-v1",
]);

/** Keys kept even during aggressive auth recovery (member prefs + active session + Create). */
const AUTH_RECOVERY_PROTECTED_KEYS = new Set([
  COMPANION_AUTH_STORAGE_KEY,
  "companion-prefs-v1",
  ...CREATION_DURABILITY_KEYS,
]);

export type LocalStorageWriteDiagnostic = {
  at: string;
  key: string;
  ok: boolean;
  bytes: number;
  /** Exact stage that decided the outcome */
  stage:
    | "ssr_no_window"
    | "first_try"
    | "after_headroom"
    | "after_aggressive"
    | "readback_mismatch"
    | "quota_exhausted"
    | "security_blocked"
    | "unknown_error";
  errorName?: string;
  errorMessage?: string;
  headroomFreed?: number;
  aggressiveFreed?: number;
  approxStorageChars?: number;
};

let lastWriteDiagnostic: LocalStorageWriteDiagnostic | null = null;
const writeDiagnosticLog: LocalStorageWriteDiagnostic[] = [];
const WRITE_LOG_CAP = 40;

export function getLastLocalStorageWriteDiagnostic(): LocalStorageWriteDiagnostic | null {
  return lastWriteDiagnostic;
}

export function getLocalStorageWriteDiagnosticLog(): LocalStorageWriteDiagnostic[] {
  return [...writeDiagnosticLog];
}

export function clearLocalStorageWriteDiagnosticsForTests(): void {
  lastWriteDiagnostic = null;
  writeDiagnosticLog.length = 0;
}

function approxLocalStorageChars(): number {
  if (typeof window === "undefined") return 0;
  let total = 0;
  try {
    for (let i = 0; i < localStorage.length; i += 1) {
      const k = localStorage.key(i);
      if (!k) continue;
      const v = localStorage.getItem(k);
      total += k.length + (v?.length ?? 0);
    }
  } catch {
    /* ignore */
  }
  return total;
}

function recordWriteDiagnostic(
  partial: Omit<LocalStorageWriteDiagnostic, "at">,
): void {
  const entry: LocalStorageWriteDiagnostic = {
    ...partial,
    at: new Date().toISOString(),
  };
  lastWriteDiagnostic = entry;
  writeDiagnosticLog.push(entry);
  if (writeDiagnosticLog.length > WRITE_LOG_CAP) writeDiagnosticLog.shift();
  if (typeof window !== "undefined") {
    const w = window as Window & {
      __SPARK_LS_WRITE__?: {
        last: LocalStorageWriteDiagnostic | null;
        log: LocalStorageWriteDiagnostic[];
      };
    };
    w.__SPARK_LS_WRITE__ = {
      last: entry,
      log: [...writeDiagnosticLog],
    };
    if (process.env.NODE_ENV !== "production") {
      console.info(
        "[SPARK_LS_WRITE]",
        entry.key,
        entry.ok ? "ok" : "FAIL",
        entry.stage,
        entry.errorName ?? "",
        `bytes=${entry.bytes}`,
        `storageChars≈${entry.approxStorageChars ?? "?"}`,
      );
    }
  }
}

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
      // Note: Create durability uses spark.* (dot). Aggressive only sweeps
      // companion-* and spark-* (hyphen) regenerable caches — never Create keys.
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

type TrySetResult = {
  ok: boolean;
  errorName?: string;
  errorMessage?: string;
  readbackMismatch?: boolean;
};

function tryLocalStorageSet(key: string, value: string): TrySetResult {
  try {
    localStorage.setItem(key, value);
    const read = localStorage.getItem(key);
    if (read === value) return { ok: true };
    return {
      ok: false,
      readbackMismatch: true,
      errorName: "ReadbackMismatch",
      errorMessage: `getItem length ${read?.length ?? 0} !== set length ${value.length}`,
    };
  } catch (err) {
    return {
      ok: false,
      errorName: err instanceof Error ? err.name : "Error",
      errorMessage: err instanceof Error ? err.message : String(err),
    };
  }
}

function shouldAggressiveRetry(key: string): boolean {
  return (
    key === COMPANION_AUTH_STORAGE_KEY || CREATION_DURABILITY_KEYS.has(key)
  );
}

/** Best-effort localStorage write — never throws on quota. */
export function safeLocalStorageSet(key: string, value: string): boolean {
  if (typeof window === "undefined") {
    recordWriteDiagnostic({
      key,
      ok: false,
      bytes: value.length,
      stage: "ssr_no_window",
      approxStorageChars: 0,
    });
    return false;
  }

  const bytes = value.length;
  const approx = () => approxLocalStorageChars();

  let prior: string | null = null;
  try {
    prior = localStorage.getItem(key);
  } catch {
    prior = null;
  }

  const first = tryLocalStorageSet(key, value);
  if (first.ok) {
    recordWriteDiagnostic({
      key,
      ok: true,
      bytes,
      stage: "first_try",
      approxStorageChars: approx(),
    });
    return true;
  }

  const headroomFreed = reclaimCompanionStorageHeadroom();
  try {
    localStorage.removeItem(key);
  } catch {
    /* noop */
  }
  const afterHeadroom = tryLocalStorageSet(key, value);
  if (afterHeadroom.ok) {
    recordWriteDiagnostic({
      key,
      ok: true,
      bytes,
      stage: "after_headroom",
      errorName: first.errorName,
      errorMessage: first.errorMessage,
      headroomFreed,
      approxStorageChars: approx(),
    });
    return true;
  }

  // 074 — Auth AND Creation durability keys get aggressive reclaim (Founder: Create
  // writes were failing here while memory kept runtimePresent:true).
  if (shouldAggressiveRetry(key)) {
    const aggressiveFreed = reclaimAggressiveCompanionStorage();
    try {
      localStorage.removeItem(key);
    } catch {
      /* noop */
    }
    const afterAggressive = tryLocalStorageSet(key, value);
    if (afterAggressive.ok) {
      recordWriteDiagnostic({
        key,
        ok: true,
        bytes,
        stage: "after_aggressive",
        errorName: afterHeadroom.errorName ?? first.errorName,
        errorMessage: afterHeadroom.errorMessage ?? first.errorMessage,
        headroomFreed,
        aggressiveFreed,
        approxStorageChars: approx(),
      });
      return true;
    }

    const failStage =
      afterAggressive.readbackMismatch || afterHeadroom.readbackMismatch
        ? "readback_mismatch"
        : isStorageQuotaError({ name: afterAggressive.errorName }) ||
            first.errorName === "QuotaExceededError"
          ? "quota_exhausted"
          : afterAggressive.errorName === "SecurityError"
            ? "security_blocked"
            : "unknown_error";

    if (prior != null) {
      try {
        localStorage.setItem(key, prior);
      } catch {
        /* ignore */
      }
    }
    recordWriteDiagnostic({
      key,
      ok: false,
      bytes,
      stage: failStage,
      errorName: afterAggressive.errorName ?? first.errorName,
      errorMessage: afterAggressive.errorMessage ?? first.errorMessage,
      headroomFreed,
      aggressiveFreed,
      approxStorageChars: approx(),
    });
    return false;
  }

  // Non-durability keys: restore prior, no aggressive reclaim
  if (prior != null) {
    try {
      localStorage.setItem(key, prior);
    } catch {
      /* ignore */
    }
  }
  recordWriteDiagnostic({
    key,
    ok: false,
    bytes,
    stage: first.readbackMismatch ? "readback_mismatch" : "quota_exhausted",
    errorName: first.errorName,
    errorMessage: first.errorMessage,
    headroomFreed,
    approxStorageChars: approx(),
  });
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
