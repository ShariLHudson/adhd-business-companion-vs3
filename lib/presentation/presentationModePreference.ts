/**
 * Presentation mode preference — future Settings → Workspace Experience.
 *
 * Not built in UI yet. Always defaults to Spark Estate.
 * Switching mode must never mutate feature data or conversation state.
 *
 * @see docs/architecture/PRESENTATION_MODES_ARCHITECTURE.md
 */

import type { PresentationModeId } from "./types";

export const DEFAULT_PRESENTATION_MODE: PresentationModeId = "spark-estate";

const PREFERENCE_KEY = "spark.presentationMode";

const VALID_MODES: ReadonlySet<PresentationModeId> = new Set([
  "spark-estate",
  "focus-workspace",
  "adaptive",
]);

function isPresentationModeId(value: string): value is PresentationModeId {
  return VALID_MODES.has(value as PresentationModeId);
}

/** Read stored preference. Safe on server — returns default. */
export function readPresentationModePreference(): PresentationModeId {
  if (typeof window === "undefined") return DEFAULT_PRESENTATION_MODE;
  try {
    const raw = window.localStorage.getItem(PREFERENCE_KEY);
    if (raw && isPresentationModeId(raw)) return raw;
  } catch {
    // localStorage blocked — default estate
  }
  return DEFAULT_PRESENTATION_MODE;
}

/** Persist presentation preference only — not feature data. */
export function writePresentationModePreference(mode: PresentationModeId): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PREFERENCE_KEY, mode);
  } catch {
    // ignore quota / privacy mode
  }
}
