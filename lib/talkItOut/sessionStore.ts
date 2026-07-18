/**
 * Talk It Out session persistence — private history by default (localStorage).
 */

import { createOpeningMessage } from "./reflectiveEngine";
import type {
  TalkItOutMessage,
  TalkItOutSavedDiscovery,
  TalkItOutSession,
} from "./types";

const STORAGE_KEY = "spark.talkItOut.sessions.v1";
const ACTIVE_KEY = "spark.talkItOut.activeSessionId.v1";

/** In-memory fallback when localStorage is unavailable (SSR / some test runners). */
let memorySessions: TalkItOutSession[] = [];
let memoryActiveId: string | null = null;

function uid(prefix: string): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}`;
}

function canUseStorage(): boolean {
  try {
    return typeof window !== "undefined" && typeof localStorage !== "undefined";
  } catch {
    return false;
  }
}

export function loadTalkItOutSessions(): TalkItOutSession[] {
  if (!canUseStorage()) return memorySessions.map((s) => ({ ...s }));
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return memorySessions.map((s) => ({ ...s }));
    const parsed = JSON.parse(raw) as TalkItOutSession[];
    if (Array.isArray(parsed)) {
      memorySessions = parsed;
      return parsed.map((s) => ({ ...s }));
    }
    return memorySessions.map((s) => ({ ...s }));
  } catch {
    return memorySessions.map((s) => ({ ...s }));
  }
}

function persistSessions(sessions: TalkItOutSession[]): void {
  memorySessions = sessions;
  if (!canUseStorage()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch {
    /* ignore quota */
  }
}

export function getActiveTalkItOutSessionId(): string | null {
  if (!canUseStorage()) return memoryActiveId;
  try {
    return localStorage.getItem(ACTIVE_KEY) ?? memoryActiveId;
  } catch {
    return memoryActiveId;
  }
}

export function setActiveTalkItOutSessionId(id: string | null): void {
  memoryActiveId = id;
  if (!canUseStorage()) return;
  try {
    if (id) localStorage.setItem(ACTIVE_KEY, id);
    else localStorage.removeItem(ACTIVE_KEY);
  } catch {
    /* ignore */
  }
}

/** Test helper — clear private history. */
export function resetTalkItOutSessionsForTests(): void {
  memorySessions = [];
  memoryActiveId = null;
  if (!canUseStorage()) return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ACTIVE_KEY);
  } catch {
    /* ignore */
  }
}

export function getTalkItOutSession(id: string): TalkItOutSession | null {
  return loadTalkItOutSessions().find((s) => s.id === id) ?? null;
}

export function upsertTalkItOutSession(session: TalkItOutSession): void {
  const all = loadTalkItOutSessions();
  const idx = all.findIndex((s) => s.id === session.id);
  if (idx >= 0) all[idx] = session;
  else all.unshift(session);
  persistSessions(all.slice(0, 40));
}

export function createTalkItOutSession(): TalkItOutSession {
  const now = new Date().toISOString();
  const opening = createOpeningMessage();
  const session: TalkItOutSession = {
    id: uid("tio-session"),
    status: "active",
    messages: [
      {
        id: opening.id,
        role: "assistant",
        content: opening.content,
        createdAt: opening.createdAt,
      },
    ],
    usedQuestionIds: [],
    userDiscoveries: [],
    userNamedNextSteps: [],
    savedDiscoveries: [],
    explicitHelpRequested: false,
    futureFeelingAsked: false,
    createdAt: now,
    updatedAt: now,
  };
  upsertTalkItOutSession(session);
  setActiveTalkItOutSessionId(session.id);
  return session;
}

/** Resume paused/active session, or start fresh. */
export function resumeOrCreateTalkItOutSession(): TalkItOutSession {
  const activeId = getActiveTalkItOutSessionId();
  if (activeId) {
    const existing = getTalkItOutSession(activeId);
    if (existing && existing.status !== "completed") {
      const resumed: TalkItOutSession = {
        ...existing,
        status: "active",
        updatedAt: new Date().toISOString(),
      };
      upsertTalkItOutSession(resumed);
      return resumed;
    }
  }
  return createTalkItOutSession();
}

export function appendTalkItOutMessages(
  session: TalkItOutSession,
  messages: TalkItOutMessage[],
  patch?: Partial<
    Pick<
      TalkItOutSession,
      | "usedQuestionIds"
      | "usedStrategyMoves"
      | "explicitHelpRequested"
      | "futureFeelingAsked"
      | "userDiscoveries"
      | "userNamedNextSteps"
      | "thinkingMap"
      | "cieState"
      | "usefulSummary"
      | "title"
      | "topic"
      | "needsReentry"
      | "verbatimUsed"
      | "lastMoveWasSkip"
      | "worryFingerprint"
      | "worryRepeatCount"
    >
  >,
): TalkItOutSession {
  const next: TalkItOutSession = {
    ...session,
    ...patch,
    messages: [...session.messages, ...messages],
    updatedAt: new Date().toISOString(),
    status: "active",
  };
  upsertTalkItOutSession(next);
  setActiveTalkItOutSessionId(next.id);
  return next;
}

export function pauseTalkItOutSession(
  session: TalkItOutSession,
): TalkItOutSession {
  const next: TalkItOutSession = {
    ...session,
    status: "paused",
    needsReentry: true,
    updatedAt: new Date().toISOString(),
  };
  upsertTalkItOutSession(next);
  setActiveTalkItOutSessionId(next.id);
  return next;
}

export function endTalkItOutSession(
  session: TalkItOutSession,
): TalkItOutSession {
  const next: TalkItOutSession = {
    ...session,
    status: "completed",
    updatedAt: new Date().toISOString(),
  };
  upsertTalkItOutSession(next);
  setActiveTalkItOutSessionId(null);
  return next;
}

export function saveTalkItOutDiscovery(
  session: TalkItOutSession,
  text: string,
  destination: TalkItOutSavedDiscovery["destination"] = "talk-it-out-history",
): TalkItOutSession {
  const discovery: TalkItOutSavedDiscovery = {
    id: uid("tio-discovery"),
    text: text.trim(),
    savedAt: new Date().toISOString(),
    destination,
  };
  const next: TalkItOutSession = {
    ...session,
    userDiscoveries: [discovery.text, ...session.userDiscoveries].slice(0, 20),
    savedDiscoveries: [discovery, ...session.savedDiscoveries].slice(0, 40),
    updatedAt: new Date().toISOString(),
  };
  upsertTalkItOutSession(next);
  return next;
}

export function listPausedTalkItOutSessions(): TalkItOutSession[] {
  return loadTalkItOutSessions().filter((s) => s.status === "paused");
}

/** Package 200/205 — rename a saved conversation. */
export function renameTalkItOutSession(
  session: TalkItOutSession,
  title: string,
): TalkItOutSession {
  const next: TalkItOutSession = {
    ...session,
    title: title.trim().slice(0, 80) || session.title,
    updatedAt: new Date().toISOString(),
  };
  upsertTalkItOutSession(next);
  return next;
}

/** Package 200/205 — delete a conversation from private history. */
export function deleteTalkItOutSession(sessionId: string): void {
  const all = loadTalkItOutSessions().filter((s) => s.id !== sessionId);
  persistSessions(all);
  if (getActiveTalkItOutSessionId() === sessionId) {
    setActiveTalkItOutSessionId(null);
  }
}

/** Start fresh without deleting prior history. */
export function startFreshTalkItOutSession(): TalkItOutSession {
  setActiveTalkItOutSessionId(null);
  return createTalkItOutSession();
}

export function listTalkItOutHistory(): TalkItOutSession[] {
  return loadTalkItOutSessions().filter((s) => s.messages.length > 1);
}
