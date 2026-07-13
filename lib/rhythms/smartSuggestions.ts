/**
 * Phase 7 — pattern-based suggestion helpers (permission before activate).
 */

import { saveRhythmSuggestion } from "./suggestions";
import type { RhythmSuggestion } from "./types";

export function proposeInvoiceFridaySuggestion(): RhythmSuggestion | null {
  return saveRhythmSuggestion({
    title: "Friday finance review",
    reason:
      "You've been checking invoices often toward the end of the week. Would a Friday finance rhythm help?",
    proposedCategory: "business",
    proposedCadence: "weekly",
    proposedWindow: "afternoon",
    proposedExactTime: "14:00",
    patternKey: "pattern:invoices-friday",
  });
}

export function proposePreferredWritingTimeSuggestion(
  hour24: number,
): RhythmSuggestion | null {
  const hh = String(hour24).padStart(2, "0");
  return saveRhythmSuggestion({
    title: "Writing time",
    reason: `You seem to do your best writing around ${hour24 > 12 ? hour24 - 12 : hour24}${hour24 >= 12 ? " PM" : " AM"}. Should I remind you then?`,
    proposedCategory: "focus",
    proposedCadence: "daily",
    proposedWindow: "exact",
    proposedExactTime: `${hh}:30`,
    patternKey: `pattern:writing-hour-${hour24}`,
  });
}
