/**
 * New Day session identity — fresh active conversation context.
 * Does not delete conversation history or long-term memory.
 */

import type { DaySession } from "./types";

const DAY_SESSION_STORAGE_KEY = "spark.chat.day-session.v1";

let memorySession: DaySession | null = null;

function readStored(): DaySession | null {
  if (typeof window === "undefined") return memorySession;
  try {
    const raw = sessionStorage.getItem(DAY_SESSION_STORAGE_KEY);
    if (!raw) return memorySession;
    return JSON.parse(raw) as DaySession;
  } catch {
    return memorySession;
  }
}

function writeStored(session: DaySession): void {
  memorySession = session;
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(DAY_SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch {
    /* quota */
  }
}

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `day-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getDaySession(): DaySession {
  const existing = readStored();
  if (existing?.daySessionId) return existing;
  const created: DaySession = {
    daySessionId: newId(),
    startedAt: Date.now(),
    conversationId: null,
  };
  writeStored(created);
  return created;
}

/** Call from New Day / New Chat reset — rotates daySessionId. */
export function startNewDaySession(conversationId?: string | null): DaySession {
  const next: DaySession = {
    daySessionId: newId(),
    startedAt: Date.now(),
    conversationId: conversationId ?? null,
  };
  writeStored(next);
  return next;
}

export function bindDaySessionConversation(conversationId: string): DaySession {
  const current = getDaySession();
  const next = { ...current, conversationId };
  writeStored(next);
  return next;
}

/** Test helper. */
export function __resetDaySessionForTests(): void {
  memorySession = null;
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(DAY_SESSION_STORAGE_KEY);
  } catch {
    /* noop */
  }
}
