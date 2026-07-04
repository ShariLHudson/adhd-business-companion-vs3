import type { CompanionRoleSession } from "./types";

const STORAGE_KEY = "spark-companion-role-session-v1";

export function saveCompanionRoleSession(
  session: CompanionRoleSession | null,
): void {
  if (typeof window === "undefined") return;
  if (!session) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function loadCompanionRoleSession(): CompanionRoleSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CompanionRoleSession;
  } catch {
    return null;
  }
}

export function clearCompanionRoleSession(): void {
  saveCompanionRoleSession(null);
}

const SESSION_TURN_LIMIT = 8;

export function isCompanionRoleSessionStale(
  session: CompanionRoleSession,
  currentTurn: number,
): boolean {
  return currentTurn - session.setAtTurn > SESSION_TURN_LIMIT;
}
