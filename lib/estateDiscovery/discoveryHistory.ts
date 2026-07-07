/**
 * Discovery History™ — member-level model and persistence.
 *
 * One record per member × discovery. Status advances over time.
 * Internal only — never surfaces "ignored" to members.
 */

import type {
  DiscoveryHistoryContext,
  DiscoveryHistoryStatus,
  DiscoveryHistoryStore,
  MemberDiscoveryHistoryEntry,
} from "./types";

export {
  DISCOVERY_IGNORE_WINDOW_MS,
  DISCOVERY_IGNORE_COOLDOWN_MS,
  TERMINAL_DISCOVERY_HISTORY_STATUSES,
  isDiscoveryBlockedByHistory,
  isDiscoveryIgnoredRecently,
  discoveryHistorySortBias,
} from "./discoveryHistoryPolicy";

const STORAGE_KEY_V2 = "spark:discovery:history:v2";
const STORAGE_KEY_V1 = "spark:discovery:history:v1";

function nowIso(): string {
  return new Date().toISOString();
}

function entryKey(userId: string, discoveryId: string): string {
  return `${userId}::${discoveryId}`;
}

function baseEntry(
  userId: string,
  discoveryId: string,
): MemberDiscoveryHistoryEntry {
  const now = nowIso();
  return {
    userId,
    discoveryId,
    status: "shown",
    updatedAt: now,
  };
}

export class InMemoryDiscoveryHistoryStore implements DiscoveryHistoryStore {
  private entries = new Map<string, MemberDiscoveryHistoryEntry>();

  list(userId: string): MemberDiscoveryHistoryEntry[] {
    return [...this.entries.values()].filter((entry) => entry.userId === userId);
  }

  get(userId: string, discoveryId: string): MemberDiscoveryHistoryEntry | null {
    return this.entries.get(entryKey(userId, discoveryId)) ?? null;
  }

  upsert(entry: MemberDiscoveryHistoryEntry): void {
    this.entries.set(entryKey(entry.userId, entry.discoveryId), entry);
  }

  clear(): void {
    this.entries.clear();
  }
}

type LegacyEvent = {
  memberId: string;
  discoveryId: string;
  state: string;
  recordedAt: string;
  roomId?: string;
};

function legacyStateToStatus(state: string): DiscoveryHistoryStatus | null {
  switch (state) {
    case "shown":
      return "shown";
    case "opened":
      return "opened";
    case "saved-for-later":
      return "saved";
    case "completed":
      return "completed";
    case "ignored":
      return "ignored";
    case "destination-visited":
      return "destination_visited";
    default:
      return null;
  }
}

function applyLegacyEvent(
  entry: MemberDiscoveryHistoryEntry,
  event: LegacyEvent,
): MemberDiscoveryHistoryEntry {
  const status = legacyStateToStatus(event.state);
  if (!status) return entry;

  const at = event.recordedAt;
  const next: MemberDiscoveryHistoryEntry = {
    ...entry,
    status,
    updatedAt: at,
    roomWhereShown: event.roomId ?? entry.roomWhereShown,
  };

  switch (status) {
    case "shown":
      next.shownAt = next.shownAt ?? at;
      break;
    case "opened":
      next.openedAt = next.openedAt ?? at;
      break;
    case "saved":
      next.savedAt = next.savedAt ?? at;
      break;
    case "completed":
      next.completedAt = next.completedAt ?? at;
      break;
    case "ignored":
      next.ignoredAt = next.ignoredAt ?? at;
      break;
    case "destination_visited":
      next.destinationVisitedAt = next.destinationVisitedAt ?? at;
      break;
    default:
      break;
  }

  return next;
}

function migrateLegacyEvents(events: LegacyEvent[]): MemberDiscoveryHistoryEntry[] {
  const merged = new Map<string, MemberDiscoveryHistoryEntry>();

  for (const event of events) {
    const key = entryKey(event.memberId, event.discoveryId);
    const current =
      merged.get(key) ?? baseEntry(event.memberId, event.discoveryId);
    merged.set(key, applyLegacyEvent(current, event));
  }

  return [...merged.values()];
}

function readLegacyV1(): LegacyEvent[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_V1);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LegacyEvent[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export class LocalDiscoveryHistoryStore implements DiscoveryHistoryStore {
  private entries = new Map<string, MemberDiscoveryHistoryEntry>();

  constructor() {
    this.entries = this.read();
    if (this.entries.size === 0) {
      const legacy = migrateLegacyEvents(readLegacyV1());
      for (const entry of legacy) {
        this.entries.set(entryKey(entry.userId, entry.discoveryId), entry);
      }
      if (legacy.length > 0) this.persist();
    }
  }

  private read(): Map<string, MemberDiscoveryHistoryEntry> {
    if (typeof localStorage === "undefined") return new Map();
    try {
      const raw = localStorage.getItem(STORAGE_KEY_V2);
      if (!raw) return new Map();
      const parsed = JSON.parse(raw) as MemberDiscoveryHistoryEntry[];
      if (!Array.isArray(parsed)) return new Map();
      return new Map(
        parsed.map((entry) => [entryKey(entry.userId, entry.discoveryId), entry]),
      );
    } catch {
      return new Map();
    }
  }

  private persist(): void {
    if (typeof localStorage === "undefined") return;
    try {
      localStorage.setItem(
        STORAGE_KEY_V2,
        JSON.stringify([...this.entries.values()]),
      );
    } catch {
      /* quota */
    }
  }

  list(userId: string): MemberDiscoveryHistoryEntry[] {
    return [...this.entries.values()].filter((entry) => entry.userId === userId);
  }

  get(userId: string, discoveryId: string): MemberDiscoveryHistoryEntry | null {
    return this.entries.get(entryKey(userId, discoveryId)) ?? null;
  }

  upsert(entry: MemberDiscoveryHistoryEntry): void {
    this.entries.set(entryKey(entry.userId, entry.discoveryId), entry);
    this.persist();
  }
}

let defaultStore: DiscoveryHistoryStore | null = null;

export function getDefaultDiscoveryHistoryStore(): DiscoveryHistoryStore {
  if (!defaultStore) {
    defaultStore =
      typeof localStorage !== "undefined"
        ? new LocalDiscoveryHistoryStore()
        : new InMemoryDiscoveryHistoryStore();
  }
  return defaultStore;
}

export function setDefaultDiscoveryHistoryStore(
  store: DiscoveryHistoryStore,
): void {
  defaultStore = store;
}

function mergeContext(
  entry: MemberDiscoveryHistoryEntry,
  context?: DiscoveryHistoryContext,
): MemberDiscoveryHistoryEntry {
  if (!context) return entry;
  return {
    ...entry,
    roomWhereShown: context.roomWhereShown ?? entry.roomWhereShown,
    placementLocation: context.placementLocation ?? entry.placementLocation,
    destinationRoute: context.destinationRoute ?? entry.destinationRoute,
  };
}

function patchEntry(
  store: DiscoveryHistoryStore,
  userId: string,
  discoveryId: string,
  patch: (current: MemberDiscoveryHistoryEntry) => MemberDiscoveryHistoryEntry,
  context?: DiscoveryHistoryContext,
): MemberDiscoveryHistoryEntry {
  const current = store.get(userId, discoveryId) ?? baseEntry(userId, discoveryId);
  const next = patch(mergeContext(current, context));
  store.upsert(next);
  return next;
}

export function recordDiscoveryShown(
  store: DiscoveryHistoryStore,
  userId: string,
  discoveryId: string,
  context?: DiscoveryHistoryContext,
): MemberDiscoveryHistoryEntry {
  const at = nowIso();
  return patchEntry(
    store,
    userId,
    discoveryId,
    (current) => ({
      ...current,
      status: current.openedAt ? current.status : "shown",
      shownAt: current.shownAt ?? at,
      updatedAt: at,
    }),
    context,
  );
}

export function recordDiscoveryOpened(
  store: DiscoveryHistoryStore,
  userId: string,
  discoveryId: string,
  context?: DiscoveryHistoryContext,
): MemberDiscoveryHistoryEntry {
  const at = nowIso();
  return patchEntry(
    store,
    userId,
    discoveryId,
    (current) => ({
      ...current,
      status: "opened",
      shownAt: current.shownAt ?? at,
      openedAt: current.openedAt ?? at,
      updatedAt: at,
    }),
    context,
  );
}

export function recordDiscoverySavedForLater(
  store: DiscoveryHistoryStore,
  userId: string,
  discoveryId: string,
  context?: DiscoveryHistoryContext,
): MemberDiscoveryHistoryEntry {
  const at = nowIso();
  return patchEntry(
    store,
    userId,
    discoveryId,
    (current) => ({
      ...current,
      status: "saved",
      savedAt: at,
      updatedAt: at,
    }),
    context,
  );
}

export function recordDiscoveryCompleted(
  store: DiscoveryHistoryStore,
  userId: string,
  discoveryId: string,
  context?: DiscoveryHistoryContext,
): MemberDiscoveryHistoryEntry {
  const at = nowIso();
  return patchEntry(
    store,
    userId,
    discoveryId,
    (current) => ({
      ...current,
      status: "completed",
      completedAt: at,
      updatedAt: at,
    }),
    context,
  );
}

export function recordDiscoveryIgnored(
  store: DiscoveryHistoryStore,
  userId: string,
  discoveryId: string,
  context?: DiscoveryHistoryContext,
): MemberDiscoveryHistoryEntry {
  const at = nowIso();
  return patchEntry(
    store,
    userId,
    discoveryId,
    (current) => {
      if (current.openedAt || current.completedAt || current.savedAt) {
        return current;
      }
      return {
        ...current,
        status: "ignored",
        ignoredAt: at,
        updatedAt: at,
      };
    },
    context,
  );
}

export function recordDiscoveryDestinationVisited(
  store: DiscoveryHistoryStore,
  userId: string,
  discoveryId: string,
  context?: DiscoveryHistoryContext,
): MemberDiscoveryHistoryEntry {
  const at = nowIso();
  return patchEntry(
    store,
    userId,
    discoveryId,
    (current) => ({
      ...current,
      status: "destination_visited",
      destinationVisitedAt: at,
      updatedAt: at,
    }),
    context,
  );
}

export function getMemberDiscoveryHistory(
  store: DiscoveryHistoryStore,
  userId: string,
): MemberDiscoveryHistoryEntry[] {
  return store.list(userId);
}

export function getDiscoveryHistoryEntry(
  store: DiscoveryHistoryStore,
  userId: string,
  discoveryId: string,
): MemberDiscoveryHistoryEntry | null {
  return store.get(userId, discoveryId);
}

/** Saved Discoveries — future member-facing shelf; positive language only. */
export function listSavedDiscoveries(
  store: DiscoveryHistoryStore,
  userId: string,
): MemberDiscoveryHistoryEntry[] {
  return store
    .list(userId)
    .filter((entry) => entry.status === "saved")
    .sort((a, b) => {
      const aTime = a.savedAt ?? a.updatedAt;
      const bTime = b.savedAt ?? b.updatedAt;
      return bTime.localeCompare(aTime);
    });
}

export function hasDiscoveryBeenCompleted(
  store: DiscoveryHistoryStore,
  userId: string,
  discoveryId: string,
): boolean {
  const entry = store.get(userId, discoveryId);
  if (!entry) return false;
  return (
    entry.status === "completed" ||
    entry.status === "saved" ||
    entry.status === "destination_visited"
  );
}

export function hasDiscoveryBeenShown(
  store: DiscoveryHistoryStore,
  userId: string,
  discoveryId: string,
): boolean {
  return store.get(userId, discoveryId) !== null;
}

/** @deprecated use userId — alias for memberId at call sites */
export const recordDiscoveryShownForMember = recordDiscoveryShown;
