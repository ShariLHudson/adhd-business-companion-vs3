/**
 * Plan My Day session — orientation vs living phase (presentation state only).
 */

const SESSION_KEY = "companion-plan-day-session-v1";

export type PlanDaySessionPhase = "orienting" | "flexible" | "living";

export type PlanDayLivingEntry =
  | "confirmed"
  | "flexible-build"
  | "flexible-suggestions";

export type PlanDaySession = {
  dayKey: string;
  phase: PlanDaySessionPhase;
  confirmedAt?: string;
  /** How the user entered the living board — preserves suggestion availability */
  livingEntry?: PlanDayLivingEntry;
};

let memorySession: PlanDaySession | null = null;

function readRaw(): PlanDaySession | null {
  if (typeof globalThis.localStorage !== "undefined") {
    try {
      const raw = globalThis.localStorage.getItem(SESSION_KEY);
      if (!raw) return memorySession;
      const parsed = JSON.parse(raw) as PlanDaySession;
      if (!parsed?.dayKey || !parsed.phase) return memorySession;
      return parsed;
    } catch {
      return memorySession;
    }
  }
  return memorySession;
}

function write(session: PlanDaySession): void {
  memorySession = session;
  if (typeof globalThis.localStorage === "undefined") return;
  try {
    globalThis.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    /* storage unavailable */
  }
}

export function readPlanDaySession(dayKey: string): PlanDaySession {
  const stored = readRaw();
  if (stored?.dayKey === dayKey) return stored;
  return { dayKey, phase: "orienting" };
}

export function markPlanDayFlexible(dayKey: string): PlanDaySession {
  const session: PlanDaySession = { dayKey, phase: "flexible" };
  write(session);
  return session;
}

export function markPlanDayLiving(
  dayKey: string,
  livingEntry: PlanDayLivingEntry = "confirmed",
): PlanDaySession {
  const session: PlanDaySession = {
    dayKey,
    phase: "living",
    confirmedAt: new Date().toISOString(),
    livingEntry,
  };
  write(session);
  return session;
}

export function markPlanDayOrienting(dayKey: string): PlanDaySession {
  const session: PlanDaySession = { dayKey, phase: "orienting" };
  write(session);
  return session;
}

export function resetPlanDaySessionForTests(): void {
  memorySession = null;
  if (typeof globalThis.localStorage === "undefined") return;
  try {
    globalThis.localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}
