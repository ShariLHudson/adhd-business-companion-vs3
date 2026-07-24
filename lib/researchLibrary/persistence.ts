import type {
  ContextualResearchRequest,
  ResearchCollectionRecord,
  ResearchSession,
} from "./types";

const SESSION_KEY = "companion-research-library-sessions-v1";
const COLLECTION_KEY = "companion-research-library-collections-v1";
const ACTIVE_KEY = "companion-research-library-active-v1";
const CONTEXTUAL_KEY = "companion-research-library-contextual-pending-v1";

type StoreShape = {
  sessions: ResearchSession[];
  collections: ResearchCollectionRecord[];
  activeSessionId: string | null;
  activeCollectionId: string | null;
};

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  if (!canUseStorage()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Fail silent — conversation continues in memory
  }
}

export function loadResearchLibraryStore(): StoreShape {
  const sessions = readJson<ResearchSession[]>(SESSION_KEY, []);
  const collections = readJson<ResearchCollectionRecord[]>(COLLECTION_KEY, []);
  const active = readJson<{
    activeSessionId: string | null;
    activeCollectionId: string | null;
  }>(ACTIVE_KEY, { activeSessionId: null, activeCollectionId: null });
  return {
    sessions,
    collections,
    activeSessionId: active.activeSessionId,
    activeCollectionId: active.activeCollectionId,
  };
}

export function saveResearchSession(session: ResearchSession): void {
  const sessions = readJson<ResearchSession[]>(SESSION_KEY, []);
  const idx = sessions.findIndex((s) => s.id === session.id);
  if (idx >= 0) sessions[idx] = session;
  else sessions.unshift(session);
  writeJson(SESSION_KEY, sessions.slice(0, 40));
  writeJson(ACTIVE_KEY, {
    ...readJson(ACTIVE_KEY, {
      activeSessionId: null,
      activeCollectionId: null,
    }),
    activeSessionId: session.id,
  });
}

export function saveResearchCollectionRecord(
  collection: ResearchCollectionRecord,
): void {
  const collections = readJson<ResearchCollectionRecord[]>(COLLECTION_KEY, []);
  const idx = collections.findIndex((c) => c.id === collection.id);
  if (idx >= 0) collections[idx] = collection;
  else collections.unshift(collection);
  writeJson(COLLECTION_KEY, collections.slice(0, 60));
  writeJson(ACTIVE_KEY, {
    ...readJson(ACTIVE_KEY, {
      activeSessionId: null,
      activeCollectionId: null,
    }),
    activeCollectionId: collection.id,
  });
}

export function persistResearchPair(
  session: ResearchSession,
  collection: ResearchCollectionRecord,
): void {
  saveResearchSession(session);
  saveResearchCollectionRecord(collection);
  writeJson(ACTIVE_KEY, {
    activeSessionId: session.id,
    activeCollectionId: collection.id,
  });
}

export function listSavedResearch(): ResearchCollectionRecord[] {
  return readJson<ResearchCollectionRecord[]>(COLLECTION_KEY, []).filter(
    (c) => c.status === "saved" || c.status === "active",
  );
}

export function listActiveResearchSessions(): ResearchSession[] {
  return readJson<ResearchSession[]>(SESSION_KEY, [])
    .filter((s) => s.currentStatus !== "idle")
    .sort((a, b) => b.lastOpenedAt.localeCompare(a.lastOpenedAt));
}

export function getResearchCollectionById(
  id: string,
): ResearchCollectionRecord | null {
  return (
    readJson<ResearchCollectionRecord[]>(COLLECTION_KEY, []).find(
      (c) => c.id === id,
    ) ?? null
  );
}

export function getResearchSessionById(id: string): ResearchSession | null {
  return (
    readJson<ResearchSession[]>(SESSION_KEY, []).find((s) => s.id === id) ??
    null
  );
}

export function markCollectionSaved(
  collection: ResearchCollectionRecord,
): ResearchCollectionRecord {
  const next = {
    ...collection,
    status: "saved" as const,
    updatedAt: new Date().toISOString(),
  };
  saveResearchCollectionRecord(next);
  return next;
}

export function setPendingContextualResearch(
  request: ContextualResearchRequest,
): void {
  writeJson(CONTEXTUAL_KEY, request);
}

export function consumePendingContextualResearch(): ContextualResearchRequest | null {
  const req = readJson<ContextualResearchRequest | null>(CONTEXTUAL_KEY, null);
  if (canUseStorage()) {
    try {
      localStorage.removeItem(CONTEXTUAL_KEY);
    } catch {
      /* ignore */
    }
  }
  return req;
}

export function groupSavedResearch(collections: ResearchCollectionRecord[]): {
  active: ResearchCollectionRecord[];
  saved: ResearchCollectionRecord[];
  recentlyUpdated: ResearchCollectionRecord[];
  linkedToCreations: ResearchCollectionRecord[];
  linkedToProjects: ResearchCollectionRecord[];
  needsCurrentUpdate: ResearchCollectionRecord[];
} {
  const sorted = [...collections].sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );
  return {
    active: sorted.filter((c) => c.status === "active"),
    saved: sorted.filter((c) => c.status === "saved"),
    recentlyUpdated: sorted.slice(0, 8),
    linkedToCreations: sorted.filter(
      (c) => c.linkedCreationPackageIds.length > 0,
    ),
    linkedToProjects: sorted.filter((c) => c.linkedProjectIds.length > 0),
    needsCurrentUpdate: sorted.filter(
      (c) =>
        c.currentResearchStatus === "current_research_unavailable" ||
        c.currentResearchStatus === "stable_knowledge_used",
    ),
  };
}
