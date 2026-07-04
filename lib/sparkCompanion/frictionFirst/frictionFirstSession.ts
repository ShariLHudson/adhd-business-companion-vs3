import type { FrictionFirstSession } from "./types";
import { FRICTION_BARRIER_MENU_IDS } from "./barriers";

const STORAGE_KEY = "spark-friction-first-session-v1";

export function saveFrictionFirstSession(
  session: FrictionFirstSession | null,
): void {
  if (typeof window === "undefined") return;
  if (!session) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function loadFrictionFirstSession(): FrictionFirstSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as FrictionFirstSession;
  } catch {
    return null;
  }
}

export function clearFrictionFirstSession(): void {
  saveFrictionFirstSession(null);
}

export function createFrictionFirstSession(input: {
  userText: string;
  domain: FrictionFirstSession["domain"];
  focusSituation: FrictionFirstSession["focusSituation"];
  offeredAtTurn: number;
}): FrictionFirstSession {
  return {
    domain: input.domain,
    focusSituation: input.focusSituation,
    barrierIds: FRICTION_BARRIER_MENU_IDS,
    offeredAtTurn: input.offeredAtTurn,
    originalUserText: input.userText.trim(),
  };
}

const SESSION_TURN_LIMIT = 4;

export function isFrictionFirstSessionExpired(
  session: FrictionFirstSession,
  currentTurn: number,
): boolean {
  return currentTurn - session.offeredAtTurn > SESSION_TURN_LIMIT;
}
