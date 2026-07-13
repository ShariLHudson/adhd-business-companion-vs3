/**
 * Smart rhythm suggestions store (Phase 7 foundation usable in Phase 3).
 */

import { createMemberRhythm } from "./store";
import type {
  RhythmCadence,
  RhythmCategory,
  RhythmSuggestion,
  RhythmSuggestionStatus,
  RhythmTimeWindow,
} from "./types";

const STORE_KEY = "companion-rhythm-suggestions-v1";

function uid(): string {
  return `rsug-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function readAll(): RhythmSuggestion[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RhythmSuggestion[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(items: RhythmSuggestion[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent("companion-rhythm-suggestions-updated"));
  } catch {
    /* ignore */
  }
}

export function listRhythmSuggestions(
  status?: RhythmSuggestionStatus,
): RhythmSuggestion[] {
  const all = readAll();
  if (!status) return all;
  return all.filter((s) => s.status === status);
}

export function saveRhythmSuggestion(input: {
  title: string;
  reason: string;
  proposedCategory: RhythmCategory;
  proposedCadence: RhythmCadence;
  proposedWindow?: RhythmTimeWindow;
  proposedExactTime?: string;
  patternKey: string;
}): RhythmSuggestion | null {
  const existing = readAll();
  if (
    existing.some(
      (s) =>
        s.patternKey === input.patternKey &&
        (s.status === "pending" || s.status === "never_again"),
    )
  ) {
    return null;
  }
  const suggestion: RhythmSuggestion = {
    id: uid(),
    title: input.title.trim(),
    reason: input.reason.trim(),
    proposedCategory: input.proposedCategory,
    proposedCadence: input.proposedCadence,
    proposedWindow: input.proposedWindow,
    proposedExactTime: input.proposedExactTime,
    status: "pending",
    createdAt: new Date().toISOString(),
    patternKey: input.patternKey,
  };
  writeAll([suggestion, ...existing]);
  return suggestion;
}

export function updateSuggestionStatus(
  id: string,
  status: RhythmSuggestionStatus,
): RhythmSuggestion | null {
  let updated: RhythmSuggestion | null = null;
  writeAll(
    readAll().map((s) => {
      if (s.id !== id) return s;
      updated = { ...s, status };
      return updated;
    }),
  );
  return updated;
}

export function acceptRhythmSuggestion(id: string) {
  const suggestion = readAll().find((s) => s.id === id);
  if (!suggestion || suggestion.status !== "pending") return null;
  const rhythm = createMemberRhythm({
    title: suggestion.title,
    cadence: suggestion.proposedCadence,
    category: suggestion.proposedCategory,
    source: "suggestion",
    window: suggestion.proposedWindow ?? "morning",
    schedule: suggestion.proposedExactTime
      ? { cadence: suggestion.proposedCadence, exactTime: suggestion.proposedExactTime }
      : { cadence: suggestion.proposedCadence },
    priority: "supportive",
  });
  updateSuggestionStatus(id, "accepted");
  return rhythm;
}

export function dismissRhythmSuggestion(id: string) {
  return updateSuggestionStatus(id, "dismissed");
}

export function neverSuggestAgain(id: string) {
  return updateSuggestionStatus(id, "never_again");
}
