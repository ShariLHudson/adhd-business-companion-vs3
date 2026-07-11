/**
 * Estate Memory Store — global session memory across all Estate rooms.
 */

import type { EstateMemory } from "./types";
import { ESTATE_MEMORY_VERSION } from "./types";
import {
  ensureEstateMemoryHasJourneyEngine,
} from "@/lib/estateJourneyEngine/journeyStore";
import { createEmptyJourneyEngineState } from "@/lib/estateJourneyEngine/state";

const STORAGE_KEY = "spark:estate:memory:v1";
const PRESERVE_CHAT_KEY = "spark:estate:preserve-chat";

let memoryCache: EstateMemory | null = null;

function newSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `estate-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createEmptyEstateMemory(): EstateMemory {
  const now = new Date().toISOString();
  return {
    version: ESTATE_MEMORY_VERSION,
    sessionId: newSessionId(),
    updatedAt: now,
    userProfile: { goals: [], preferences: [] },
    emotionalState: { history: [] },
    momentumState: { progressNotes: [], unfinishedLoops: [] },
    activeJourney: { steps: [], intentChain: [], pendingEntryIds: [] },
    activeGoals: [],
    conversationDigest: [],
    roomVisitMemory: {
      favoriteRoomIds: [],
      visitCounts: {},
    },
    journeyEngine: createEmptyJourneyEngineState(),
  };
}

function readStorage(): EstateMemory | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as EstateMemory;
    if (parsed.version !== ESTATE_MEMORY_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeStorage(memory: EstateMemory): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(memory));
  } catch {
    /* quota — keep in-memory cache */
  }
}

/** Load global Estate memory (singleton per browser session). */
export function getEstateMemory(): EstateMemory {
  if (memoryCache) {
    memoryCache = ensureEstateMemoryHasJourneyEngine(memoryCache);
    return memoryCache;
  }

  const stored = readStorage();
  if (stored) {
    memoryCache = ensureEstateMemoryHasJourneyEngine(stored);
    if (!stored.journeyEngine) writeStorage(memoryCache);
    return memoryCache;
  }

  memoryCache = createEmptyEstateMemory();
  writeStorage(memoryCache);
  return memoryCache;
}

/** Shallow-safe patch — callers supply merged slices; never replaces entire object blindly. */
export function patchEstateMemory(
  patch: (current: EstateMemory) => EstateMemory,
): EstateMemory {
  const current = getEstateMemory();
  const next = patch({
    ...current,
    userProfile: { ...current.userProfile, goals: [...current.userProfile.goals], preferences: [...current.userProfile.preferences] },
    emotionalState: {
      ...current.emotionalState,
      history: [...current.emotionalState.history],
    },
    momentumState: {
      ...current.momentumState,
      progressNotes: [...current.momentumState.progressNotes],
      unfinishedLoops: [...current.momentumState.unfinishedLoops],
    },
    activeJourney: {
      ...current.activeJourney,
      steps: [...current.activeJourney.steps],
      intentChain: [...current.activeJourney.intentChain],
      pendingEntryIds: [...current.activeJourney.pendingEntryIds],
    },
    activeGoals: [...current.activeGoals],
    conversationDigest: [...current.conversationDigest],
    journeyEngine: current.journeyEngine ?
      {
        ...current.journeyEngine,
        roomHistory: [...current.journeyEngine.roomHistory],
        pausedWork: [...current.journeyEngine.pausedWork],
        learning: [...current.journeyEngine.learning],
        sessions: current.journeyEngine.sessions.map((s) => ({
          ...s,
          roomIdsVisited: [...s.roomIdsVisited],
          learningCompleted: [...s.learningCompleted],
          projectsAdvanced: [...s.projectsAdvanced],
          challengesCompleted: [...s.challengesCompleted],
          ideasCaptured: [...s.ideasCaptured],
        })),
        profileTouches: [...current.journeyEngine.profileTouches],
        topicStudy: [...current.journeyEngine.topicStudy],
      }
    : createEmptyJourneyEngineState(),
  });
  next.updatedAt = new Date().toISOString();
  memoryCache = next;
  writeStorage(next);
  return next;
}

export function resetEstateMemory(): void {
  memoryCache = createEmptyEstateMemory();
  writeStorage(memoryCache);
  if (typeof sessionStorage !== "undefined") {
    sessionStorage.removeItem(PRESERVE_CHAT_KEY);
  }
}

/** Estate transitions must not reset the global conversation thread. */
export function markEstateTransitionPreserveChat(): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(PRESERVE_CHAT_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function peekEstateTransitionPreserveChat(): boolean {
  if (typeof sessionStorage === "undefined") return false;
  return sessionStorage.getItem(PRESERVE_CHAT_KEY) === "1";
}

export function consumeEstateTransitionPreserveChat(): boolean {
  if (typeof sessionStorage === "undefined") return false;
  const active = sessionStorage.getItem(PRESERVE_CHAT_KEY) === "1";
  if (active) sessionStorage.removeItem(PRESERVE_CHAT_KEY);
  return active;
}

/** Test-only — reset module cache without touching sessionStorage. */
export function __resetEstateMemoryCacheForTests(): void {
  memoryCache = null;
}
