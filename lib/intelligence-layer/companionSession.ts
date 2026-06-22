/**
 * Sprint 2B-B PR 3 — Companion session MVP (in-memory only).
 * Same session across workspace transitions; new session after idle gap.
 */

export const COMPANION_SESSION_IDLE_MS = 30 * 60 * 1000;

export type TrustProductId = "ecosystem";

export type CompanionSessionMvp = {
  sessionId: string;
  productId: TrustProductId;
  startedAt: string;
  lastActivityAt: string;
};

let currentSession: CompanionSessionMvp | null = null;

function newSessionId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function createSession(at: string): CompanionSessionMvp {
  return {
    sessionId: newSessionId(),
    productId: "ecosystem",
    startedAt: at,
    lastActivityAt: at,
  };
}

function isSessionExpired(session: CompanionSessionMvp, nowMs: number): boolean {
  const last = Date.parse(session.lastActivityAt);
  if (Number.isNaN(last)) return true;
  return nowMs - last >= COMPANION_SESSION_IDLE_MS;
}

/** Initialize session on companion mount. Reuses active session unless idle-expired. */
export function initCompanionSession(now: Date = new Date()): CompanionSessionMvp {
  const at = now.toISOString();
  const nowMs = now.getTime();
  if (!currentSession || isSessionExpired(currentSession, nowMs)) {
    currentSession = createSession(at);
  }
  return currentSession;
}

export function getCompanionSession(): CompanionSessionMvp | null {
  return currentSession;
}

/** Returns current session or creates one if missing/expired. */
export function getOrCreateCompanionSession(now: Date = new Date()): CompanionSessionMvp {
  if (!currentSession) return initCompanionSession(now);
  const nowMs = now.getTime();
  if (isSessionExpired(currentSession, nowMs)) {
    return initCompanionSession(now);
  }
  return currentSession;
}

/** Updates lastActivityAt; rolls session forward after idle gap. */
export function touchCompanionSession(now: Date = new Date()): CompanionSessionMvp {
  const at = now.toISOString();
  const nowMs = now.getTime();
  if (!currentSession || isSessionExpired(currentSession, nowMs)) {
    currentSession = createSession(at);
    return currentSession;
  }
  currentSession = { ...currentSession, lastActivityAt: at };
  return currentSession;
}

/** Test-only reset. */
export function resetCompanionSessionForTests(): void {
  currentSession = null;
}
