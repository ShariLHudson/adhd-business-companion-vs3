/**
 * Discovery History policy — engine eligibility without member-facing judgment.
 */

import type {
  DiscoveryHistoryStore,
  DiscoveryHistoryStatus,
  MemberDiscoveryHistoryEntry,
} from "./types";

/** Key may remain unopened this long before a silent ignored record. */
export const DISCOVERY_IGNORE_WINDOW_MS = 5 * 60 * 1000;

/** After ignored, wait before the same discovery may appear again. */
export const DISCOVERY_IGNORE_COOLDOWN_MS = 72 * 60 * 60 * 1000;

export const TERMINAL_DISCOVERY_HISTORY_STATUSES: readonly DiscoveryHistoryStatus[] =
  ["completed", "saved", "destination_visited"];

export function isDiscoveryIgnoredRecently(
  entry: MemberDiscoveryHistoryEntry,
  now = Date.now(),
): boolean {
  if (entry.status !== "ignored" || !entry.ignoredAt) return false;
  return now - Date.parse(entry.ignoredAt) < DISCOVERY_IGNORE_COOLDOWN_MS;
}

export function isDiscoveryBlockedByHistory(
  store: DiscoveryHistoryStore,
  userId: string,
  discoveryId: string,
  now = Date.now(),
): boolean {
  const entry = store.get(userId, discoveryId);
  if (!entry) return false;

  if (
    (TERMINAL_DISCOVERY_HISTORY_STATUSES as readonly string[]).includes(
      entry.status,
    )
  ) {
    return true;
  }

  if (entry.status === "opened") {
    return true;
  }

  if (isDiscoveryIgnoredRecently(entry, now)) {
    return true;
  }

  return false;
}

/**
 * Lower bias = prefer for selection (never seen first).
 */
export function discoveryHistorySortBias(
  store: DiscoveryHistoryStore,
  userId: string,
  discoveryId: string,
): number {
  const entry = store.get(userId, discoveryId);
  if (!entry) return 0;
  if (entry.status === "shown") return 1;
  if (entry.status === "ignored") return 3;
  return 2;
}

export function shouldRecordSilentIgnore(
  entry: MemberDiscoveryHistoryEntry | null,
  now = Date.now(),
): boolean {
  if (!entry || entry.openedAt) return false;
  if (entry.status === "ignored") return false;
  if (
    (TERMINAL_DISCOVERY_HISTORY_STATUSES as readonly string[]).includes(
      entry.status,
    )
  ) {
    return false;
  }
  if (!entry.shownAt) return false;
  return now - Date.parse(entry.shownAt) >= DISCOVERY_IGNORE_WINDOW_MS;
}
