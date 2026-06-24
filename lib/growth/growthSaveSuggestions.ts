/**
 * Lightweight Growth save prompts — user confirms; never auto-files.
 */

export type GrowthSaveDestination =
  | "wins"
  | "evidence"
  | "journey"
  | "highlights";

export type GrowthSaveSuggestion = {
  id: string;
  text: string;
  destinations: GrowthSaveDestination[];
  createdAt: string;
};

const STORE_KEY = "companion-growth-save-suggestion-v1";

export const GROWTH_SAVE_SUGGESTION_UPDATED = "companion-growth-save-suggestion-updated";

function notify(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(GROWTH_SAVE_SUGGESTION_UPDATED));
}

export function getPendingGrowthSaveSuggestion(): GrowthSaveSuggestion | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GrowthSaveSuggestion;
    if (!parsed?.id || !parsed.text) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function queueGrowthSaveSuggestion(input: {
  text: string;
  destinations?: GrowthSaveDestination[];
}): GrowthSaveSuggestion {
  const suggestion: GrowthSaveSuggestion = {
    id: `gs-${Date.now()}`,
    text: input.text.trim(),
    destinations: input.destinations ?? ["wins"],
    createdAt: new Date().toISOString(),
  };
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(suggestion));
      notify();
    } catch {
      /* ignore */
    }
  }
  return suggestion;
}

export function clearGrowthSaveSuggestion(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORE_KEY);
    notify();
  } catch {
    /* ignore */
  }
}

export const GROWTH_SAVE_DESTINATION_LABEL: Record<GrowthSaveDestination, string> = {
  wins: "Save to My Wins?",
  evidence: "Save to Evidence Bank?",
  journey: "Save to My Journey?",
  highlights: "Save to My Highlights?",
};
