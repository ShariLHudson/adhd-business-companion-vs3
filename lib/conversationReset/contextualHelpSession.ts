/**
 * Contextual Help sessions — isolated from the member's prior chat thread.
 *
 * Opening Help suspends the active conversation (messages, session IDs, digest)
 * and starts a fresh help conversation. Closing Help restores the suspended
 * thread and place progress. Long-term profile and preferences are never cleared.
 */

import {
  clearConversation,
  type StoredMessage,
} from "@/lib/companionStore";
import {
  clearConversationSession,
  getOrCreateConversationSession,
  loadConversationSession,
  saveConversationSession,
  type ConversationSession,
} from "@/lib/conversationSession";
import {
  getEstateMemory,
  patchEstateMemory,
} from "@/lib/estateMemory/estateMemoryStore";
import type { EstateConversationDigestTurn } from "@/lib/estateMemory/types";
import { supersedeInFlightChatRequest } from "@/lib/chatFastPath/chatRequestInterrupt";

export const CONTEXTUAL_HELP_SESSION_STORAGE_KEY =
  "companion-contextual-help-session-v1";

export type ContextualHelpPlaceContext = {
  roomEntryId?: string | null;
  sectionId?: string | null;
  fieldPath?: string | null;
  stepOrField?: string | null;
  question?: string | null;
};

export type SuspendedThreadSnapshot = {
  messages: StoredMessage[];
  conversationId: string | null;
  sessionId: string | null;
  fullConversationSession: ConversationSession | null;
  conversationDigest: EstateConversationDigestTurn[];
  activeTask?: string;
  unfinishedLoops: string[];
  intentChain: string[];
  pendingEntryIds: string[];
};

export type ContextualHelpSession = {
  active: true;
  helpConversationId: string;
  helpSessionId: string;
  place: ContextualHelpPlaceContext;
  suspended: SuspendedThreadSnapshot;
  startedAt: string;
};

export type BeginContextualHelpSessionInput = {
  currentMessages: StoredMessage[];
  place: ContextualHelpPlaceContext;
  abortController?: AbortController | null;
  bumpRequestGeneration?: () => void;
};

export type BeginContextualHelpSessionResult = {
  helpConversationId: string;
  helpSessionId: string;
  previousConversationId: string | null;
  /** True when an existing help session was refreshed instead of nesting. */
  refreshed: boolean;
};

export type EndContextualHelpSessionResult = {
  restoredMessages: StoredMessage[];
  conversationId: string | null;
  sessionId: string | null;
};

function newId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function readSession(): ContextualHelpSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CONTEXTUAL_HELP_SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ContextualHelpSession;
    if (!parsed?.active || !parsed.helpConversationId) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeSession(session: ContextualHelpSession | null): void {
  if (typeof window === "undefined") return;
  try {
    if (!session) {
      sessionStorage.removeItem(CONTEXTUAL_HELP_SESSION_STORAGE_KEY);
    } else {
      sessionStorage.setItem(
        CONTEXTUAL_HELP_SESSION_STORAGE_KEY,
        JSON.stringify(session),
      );
    }
  } catch {
    /* ignore */
  }
}

function snapshotSuspendedThread(
  currentMessages: StoredMessage[],
): SuspendedThreadSnapshot {
  const session = loadConversationSession();
  const memory = getEstateMemory();
  return {
    messages: currentMessages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    conversationId: session?.conversationId ?? null,
    sessionId: session?.sessionId ?? null,
    fullConversationSession: session ? { ...session } : null,
    conversationDigest: [...memory.conversationDigest],
    activeTask: memory.activeJourney.activeTask,
    unfinishedLoops: [...memory.momentumState.unfinishedLoops],
    intentChain: [...memory.activeJourney.intentChain],
    pendingEntryIds: [...memory.activeJourney.pendingEntryIds],
  };
}

function clearLiveThreadForHelp(): {
  helpConversationId: string;
  helpSessionId: string;
} {
  clearConversation();
  clearConversationSession();

  patchEstateMemory((mem) => ({
    ...mem,
    conversationDigest: [],
    momentumState: {
      ...mem.momentumState,
      unfinishedLoops: [],
    },
    activeJourney: {
      ...mem.activeJourney,
      intentChain: [],
      pendingEntryIds: [],
      activeTask: undefined,
    },
  }));

  const next = getOrCreateConversationSession();
  return {
    helpConversationId: next.conversationId,
    helpSessionId: next.sessionId,
  };
}

function restoreSuspendedThread(suspended: SuspendedThreadSnapshot): void {
  if (suspended.fullConversationSession) {
    saveConversationSession(suspended.fullConversationSession);
  } else if (suspended.conversationId || suspended.sessionId) {
    const base = getOrCreateConversationSession();
    saveConversationSession({
      ...base,
      conversationId: suspended.conversationId ?? base.conversationId,
      sessionId: suspended.sessionId ?? base.sessionId,
    });
  } else {
    clearConversationSession();
  }

  patchEstateMemory((mem) => ({
    ...mem,
    conversationDigest: [...suspended.conversationDigest],
    momentumState: {
      ...mem.momentumState,
      unfinishedLoops: [...suspended.unfinishedLoops],
    },
    activeJourney: {
      ...mem.activeJourney,
      intentChain: [...suspended.intentChain],
      pendingEntryIds: [...suspended.pendingEntryIds],
      activeTask: suspended.activeTask,
    },
  }));
}

export function isContextualHelpSessionActive(): boolean {
  return readSession() != null;
}

export function getContextualHelpSession(): ContextualHelpSession | null {
  return readSession();
}

/**
 * Suspend the active conversation and start a fresh help session.
 * Does not clear pending guided-field help packets, profile, or preferences.
 */
export function beginContextualHelpSession(
  input: BeginContextualHelpSessionInput,
): BeginContextualHelpSessionResult {
  const existing = readSession();
  input.bumpRequestGeneration?.();
  supersedeInFlightChatRequest(input.abortController ?? null);

  if (existing) {
    const { helpConversationId, helpSessionId } = clearLiveThreadForHelp();
    const refreshed: ContextualHelpSession = {
      ...existing,
      helpConversationId,
      helpSessionId,
      place: { ...existing.place, ...input.place },
      startedAt: new Date().toISOString(),
    };
    writeSession(refreshed);
    return {
      helpConversationId,
      helpSessionId,
      previousConversationId: existing.suspended.conversationId,
      refreshed: true,
    };
  }

  const suspended = snapshotSuspendedThread(input.currentMessages);
  const previousConversationId = suspended.conversationId;
  const { helpConversationId, helpSessionId } = clearLiveThreadForHelp();

  writeSession({
    active: true,
    helpConversationId,
    helpSessionId,
    place: input.place,
    suspended,
    startedAt: new Date().toISOString(),
  });

  return {
    helpConversationId,
    helpSessionId,
    previousConversationId,
    refreshed: false,
  };
}

/**
 * End Help and restore the suspended conversation thread.
 * Caller restores React message state from the returned messages.
 */
export function endContextualHelpSession(): EndContextualHelpSessionResult | null {
  const existing = readSession();
  if (!existing) return null;

  restoreSuspendedThread(existing.suspended);
  writeSession(null);

  return {
    restoredMessages: existing.suspended.messages,
    conversationId: existing.suspended.conversationId,
    sessionId: existing.suspended.sessionId,
  };
}

/**
 * After a page refresh while Help was open: keep the suspended prior thread,
 * mint a new help conversation ID, and do not attach yesterday's messages.
 */
export function recoverContextualHelpSessionAfterRefresh(): BeginContextualHelpSessionResult | null {
  const existing = readSession();
  if (!existing) return null;

  const { helpConversationId, helpSessionId } = clearLiveThreadForHelp();
  writeSession({
    ...existing,
    helpConversationId,
    helpSessionId,
    startedAt: new Date().toISOString(),
  });

  return {
    helpConversationId,
    helpSessionId,
    previousConversationId: existing.suspended.conversationId,
    refreshed: true,
  };
}

/** LLM hint while Help is open — place + field only; never prior digest. */
export function contextualHelpMemoryHintForChat(
  session: ContextualHelpSession | null = readSession(),
): string | null {
  if (!session?.active) return null;

  const memory = getEstateMemory();
  const lines: string[] = [
    "CONTEXTUAL HELP SESSION (isolated):",
    "The member opened Ask Shari for Help / field help. This is a fresh help conversation.",
    "Do not continue prior chat topics, digests, drafts, or unfinished workflows from earlier threads.",
    "Long-term approved profile and saved preferences may still apply when relevant.",
  ];

  const room =
    session.place.roomEntryId ?? memory.currentRoom?.entryId ?? null;
  if (room) lines.push(`Current estate room: ${room}.`);
  if (session.place.sectionId) {
    lines.push(`Current section: ${session.place.sectionId}.`);
  }
  if (session.place.fieldPath) {
    lines.push(`Current field: ${session.place.fieldPath}.`);
  }
  if (session.place.stepOrField) {
    lines.push(`Current step/field key: ${session.place.stepOrField}.`);
  }
  if (session.place.question) {
    lines.push(`Current question: ${session.place.question}`);
  }

  lines.push(
    "Stay with this help context. Do not summarize or resume yesterday's conversation.",
  );

  return lines.join("\n");
}

/** Test helper — wipe help session storage. */
export function resetContextualHelpSessionForTests(): void {
  writeSession(null);
}

/** @internal — used by tests to assert suspended digests stay out of live memory. */
export function __peekContextualHelpSessionForTests(): ContextualHelpSession | null {
  return readSession();
}

/** Stable id helper for callers that only need a unique string. */
export function createContextualHelpConversationId(): string {
  return newId("help-conv");
}
