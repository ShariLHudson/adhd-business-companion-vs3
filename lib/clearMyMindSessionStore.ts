/**
 * Clear My Mind session resume — keep the same capture session across visits.
 * Raw thoughts + organized items stay keyed by captureSessionId in companionStore.
 */

const STORAGE_KEY = "spark.clearMyMind.activeSession.v1";

export type ClearMyMindPersistedSession = {
  sessionId: string;
  phase:
    | "capture"
    | "choice"
    | "organize"
    | "filter"
    | "prioritize"
    | "convert"
    | "visual"
    | "session-end";
  updatedAt: string;
  rawCaptureTexts: string[];
};

function read(): ClearMyMindPersistedSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ClearMyMindPersistedSession;
    if (!parsed?.sessionId) return null;
    return parsed;
  } catch {
    return null;
  }
}

function write(session: ClearMyMindPersistedSession): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    /* ignore quota */
  }
}

export function getClearMyMindPersistedSession(): ClearMyMindPersistedSession | null {
  return read();
}

export function pauseClearMyMindSession(
  session: Omit<ClearMyMindPersistedSession, "updatedAt">,
): void {
  write({ ...session, updatedAt: new Date().toISOString() });
}

export function clearClearMyMindPersistedSession(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/** Resume a recent session (within 7 days); otherwise null. */
export function resumeClearMyMindSession(): ClearMyMindPersistedSession | null {
  const session = read();
  if (!session) return null;
  const age = Date.now() - new Date(session.updatedAt).getTime();
  if (!Number.isFinite(age) || age > 7 * 24 * 60 * 60 * 1000) {
    clearClearMyMindPersistedSession();
    return null;
  }
  return session;
}
