/**
 * Optional local recovery cache for durable member records.
 *
 * This is a SAFETY NET, never a source of truth. A successful cache write does
 * NOT constitute durable success and must never be reported as "saved". It
 * exists so that, when durable saving is unavailable (offline, signed out,
 * transient failure), the member's most recent work can be recovered and
 * retried — matching the beta decision: "preserve recoverable local work and
 * support a calm, safe retry when durable saving is unavailable."
 */

import type { MemberRecord } from "./types";

const CACHE_PREFIX = "spark.durableRecordCache.";

function cacheKey(domain: string, recordId: string): string {
  return `${CACHE_PREFIX}${domain}.${recordId}.v1`;
}

/** Best-effort write. Never throws; returns whether the cache write happened. */
export function writeLocalRecoveryCache(record: MemberRecord): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(
      cacheKey(record.domain, record.recordId),
      JSON.stringify(record),
    );
    return true;
  } catch {
    // Quota / private mode — recovery cache is optional, never fatal.
    return false;
  }
}

export function readLocalRecoveryCache<T = unknown>(
  domain: string,
  recordId: string,
): MemberRecord<T> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(cacheKey(domain, recordId));
    if (!raw) return null;
    return JSON.parse(raw) as MemberRecord<T>;
  } catch {
    return null;
  }
}

export function clearLocalRecoveryCache(domain: string, recordId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(cacheKey(domain, recordId));
  } catch {
    /* ignore */
  }
}
