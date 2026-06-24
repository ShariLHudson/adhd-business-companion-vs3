/**
 * P0.18 — Google Sheets intake session (sessionStorage).
 */

import type { GoogleSheetIntakeSession } from "./googleSheetsIntelligence";

const STORAGE_KEY = "companion-google-sheet-intake-v1";

export function loadGoogleSheetIntakeSession(): GoogleSheetIntakeSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GoogleSheetIntakeSession;
    if (!parsed?.sheetType || !parsed.phase) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveGoogleSheetIntakeSession(
  session: GoogleSheetIntakeSession,
): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    /* noop */
  }
}

export function clearGoogleSheetIntakeSession(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* noop */
  }
}

export function resetGoogleSheetIntakeSessionForTests(): void {
  clearGoogleSheetIntakeSession();
}
