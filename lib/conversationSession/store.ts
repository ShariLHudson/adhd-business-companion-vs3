/**
 * Pass 2 — Conversation Session store (browser persistence + in-memory cache).
 */

import type { ConversationSession, ConversationSessionPatch } from "./types";
import {
  CONVERSATION_SESSION_STORAGE_KEY,
  CONVERSATION_SESSION_UPDATED,
} from "./types";

let memorySession: ConversationSession | null = null;

function newId(prefix: string): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${prefix}-${Date.now()}`;
}

function defaultSession(): ConversationSession {
  const now = new Date().toISOString();
  return {
    sessionId: newId("cs"),
    relationshipId: newId("rel"),
    conversationId: newId("conv"),
    activeArtifact: null,
    artifactStack: [],
    answeredQuestions: [],
    researchState: { status: "idle" },
    studioReadinessLevel: 0,
    currentStage: "listening",
    conversationHistory: [],
    createdAt: now,
    updatedAt: now,
  };
}

function readStorage(): ConversationSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CONVERSATION_SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConversationSession;
    return parsed?.sessionId ? parsed : null;
  } catch {
    return null;
  }
}

function writeStorage(session: ConversationSession | null): void {
  if (typeof window === "undefined") return;
  try {
    if (!session) {
      localStorage.removeItem(CONVERSATION_SESSION_STORAGE_KEY);
    } else {
      localStorage.setItem(CONVERSATION_SESSION_STORAGE_KEY, JSON.stringify(session));
    }
    window.dispatchEvent(new CustomEvent(CONVERSATION_SESSION_UPDATED));
  } catch {
    /* noop */
  }
}

/** Default on — set NEXT_PUBLIC_CONVERSATION_SESSION_SPINE=0 to disable dual-write. */
export function isConversationSessionSpineEnabled(): boolean {
  if (
    typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_CONVERSATION_SESSION_SPINE === "0"
  ) {
    return false;
  }
  return true;
}

export function loadConversationSession(): ConversationSession | null {
  if (memorySession) return memorySession;
  memorySession = readStorage();
  return memorySession;
}

export function getOrCreateConversationSession(): ConversationSession {
  const existing = loadConversationSession();
  if (existing) return existing;
  const created = defaultSession();
  memorySession = created;
  writeStorage(created);
  return created;
}

export function saveConversationSession(session: ConversationSession | null): void {
  memorySession = session;
  writeStorage(session);
}

export function clearConversationSession(): void {
  memorySession = null;
  writeStorage(null);
}

/** Merge patch — never drops artifact stack or answered questions unless explicitly replaced. */
export function mergeConversationSessionPatch(
  current: ConversationSession,
  patch: ConversationSessionPatch,
): ConversationSession {
  const now = new Date().toISOString();
  return {
    ...current,
    ...patch,
    answeredQuestions: patch.answeredQuestions ?? current.answeredQuestions,
    artifactStack: patch.artifactStack ?? current.artifactStack,
    conversationHistory: patch.conversationHistory ?? current.conversationHistory,
    researchState: patch.researchState
      ? { ...current.researchState, ...patch.researchState }
      : current.researchState,
    currentJourneyState: patch.currentJourneyState
      ? { ...current.currentJourneyState, ...patch.currentJourneyState }
      : current.currentJourneyState,
    updatedAt: now,
  };
}

export function applyConversationSessionPatch(
  patch: ConversationSessionPatch,
): ConversationSession {
  const base = getOrCreateConversationSession();
  const next = mergeConversationSessionPatch(base, patch);
  saveConversationSession(next);
  return next;
}

/** Room changes patch place only — conversation, research, draft, and artifacts stay. */
export function applyConversationSessionRoomChange(currentRoom: string): ConversationSession {
  return applyConversationSessionPatch({ currentRoom });
}

/** Test helper — reset in-memory cache without touching storage semantics. */
export function resetConversationSessionMemoryForTests(): void {
  memorySession = null;
}
