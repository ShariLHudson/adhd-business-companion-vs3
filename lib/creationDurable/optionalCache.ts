/**
 * Optional localStorage cache only — never satisfies durable verification.
 * Quota / blocked storage must never crash or fail a successful DB write.
 */

import { safeLocalStorageSet } from "@/lib/companionStorageRecovery";
import type { AuthoritativeCreationRecord } from "./types";
import { CREATION_OPTIONAL_CACHE_KEY } from "./types";

type CacheMap = Record<string, AuthoritativeCreationRecord>;

function readMap(): CacheMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(CREATION_OPTIONAL_CACHE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as CacheMap;
  } catch {
    return {};
  }
}

/** Best-effort cache write. Never throws; never reports durable. */
export function writeOptionalCreationCache(record: AuthoritativeCreationRecord): void {
  try {
    const map = readMap();
    map[record.workspaceId] = record;
    const ok = safeLocalStorageSet(
      CREATION_OPTIONAL_CACHE_KEY,
      JSON.stringify(map),
    );
    if (!ok && process.env.NODE_ENV !== "production") {
      console.info(
        "[SPARK_CREATION_CACHE]",
        "optional localStorage cache write failed after durable save",
        record.workspaceId,
      );
    }
  } catch (err) {
    // Cache only — authoritative Supabase save already succeeded.
    if (process.env.NODE_ENV !== "production") {
      console.info(
        "[SPARK_CREATION_CACHE]",
        "optional localStorage cache exception (ignored)",
        record.workspaceId,
        err instanceof Error ? err.message : err,
      );
    }
  }
}

export function readOptionalCreationCache(
  workspaceId: string
): AuthoritativeCreationRecord | null {
  try {
    const map = readMap();
    return map[workspaceId] ?? null;
  } catch {
    return null;
  }
}

export function clearOptionalCreationCache(workspaceId?: string): void {
  try {
    if (!workspaceId) {
      safeLocalStorageSet(CREATION_OPTIONAL_CACHE_KEY, "{}");
      return;
    }
    const map = readMap();
    delete map[workspaceId];
    safeLocalStorageSet(CREATION_OPTIONAL_CACHE_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}
