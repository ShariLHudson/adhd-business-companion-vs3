/**
 * Session memory for IMPLIED_NEED choice menus — continuation without auto-navigation.
 */

import type { ImpliedNeedChoice } from "./impliedNeed";

const STORAGE_KEY = "companion-implied-need-session-v1";

export type ImpliedNeedSession = {
  matchKey: string;
  primaryPlaceId: string | null;
  choices: ImpliedNeedChoice[];
  offeredAtTurn: number;
};

export function saveImpliedNeedSession(session: ImpliedNeedSession | null): void {
  if (typeof window === "undefined") return;
  if (!session) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function loadImpliedNeedSession(): ImpliedNeedSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ImpliedNeedSession;
  } catch {
    return null;
  }
}

export function clearImpliedNeedSession(): void {
  saveImpliedNeedSession(null);
}
