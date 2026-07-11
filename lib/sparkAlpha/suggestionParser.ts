/**
 * Spark Alpha — quiet suggestion chips from Shari's last turn.
 * Conversation-first: one-tap agreement without hunting the input.
 */

export type SparkAlphaSuggestionEffect =
  | { type: "focus_timer"; minutes: number; label?: string }
  | { type: "print" }
  | { type: "pdf" }
  | { type: "google_doc" }
  | { type: "google_calendar" }
  | { type: "google_drive" };

export type SparkAlphaSuggestion = {
  id: string;
  label: string;
  sendText: string;
  sideEffect?: SparkAlphaSuggestionEffect;
};

function extractFocusMinutes(text: string): number | null {
  const match = text.match(/(\d{1,3})\s*[-–]?\s*minute(?:s)?/i);
  if (!match) return null;
  const minutes = Number.parseInt(match[1], 10);
  if (!Number.isFinite(minutes) || minutes < 1 || minutes > 120) return null;
  return minutes;
}

function offersFocusSession(text: string): boolean {
  return /\b(focus(?:\s+session|\s+block)?|timer|pomodoro|time\s+block)\b/i.test(
    text,
  );
}

function dedupeSuggestions(items: SparkAlphaSuggestion[]): SparkAlphaSuggestion[] {
  const seen = new Set<string>();
  const out: SparkAlphaSuggestion[] = [];
  for (const item of items) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    out.push(item);
  }
  return out.slice(0, 4);
}

/** Parse assistant text into quiet tap-to-agree options. */
export function parseSuggestionsFromAssistant(text: string): SparkAlphaSuggestion[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const suggestions: SparkAlphaSuggestion[] = [];
  const lower = trimmed.toLowerCase();

  if (offersFocusSession(trimmed)) {
    const minutes = extractFocusMinutes(trimmed) ?? 25;
    suggestions.push({
      id: `focus-${minutes}`,
      label: `Yes — ${minutes} min`,
      sendText: `Yes, let's do ${minutes} minutes.`,
      sideEffect: { type: "focus_timer", minutes },
    });
  }

  if (/\bprint\b/.test(lower)) {
    suggestions.push({
      id: "print",
      label: "Print it",
      sendText: "Yes, please print it.",
      sideEffect: { type: "print" },
    });
  }

  if (/\bpdf\b/.test(lower)) {
    suggestions.push({
      id: "pdf",
      label: "Save as PDF",
      sendText: "Yes, save as PDF.",
      sideEffect: { type: "pdf" },
    });
  }

  if (/google\s+doc/.test(lower)) {
    suggestions.push({
      id: "google-doc",
      label: "Google Doc",
      sendText: "Yes, put it in Google Docs.",
      sideEffect: { type: "google_doc" },
    });
  }

  if (/google\s+calendar/.test(lower)) {
    suggestions.push({
      id: "google-calendar",
      label: "Google Calendar",
      sendText: "Yes, add it to my calendar.",
      sideEffect: { type: "google_calendar" },
    });
  }

  if (/google\s+drive/.test(lower)) {
    suggestions.push({
      id: "google-drive",
      label: "Google Drive",
      sendText: "Yes, save to Google Drive.",
      sideEffect: { type: "google_drive" },
    });
  }

  if (trimmed.endsWith("?") && suggestions.length === 0) {
    suggestions.push(
      { id: "yes", label: "Yes", sendText: "Yes." },
      { id: "no", label: "Not right now", sendText: "Not right now." },
    );
  } else if (trimmed.endsWith("?") && suggestions.length > 0) {
    suggestions.push({
      id: "no",
      label: "Not right now",
      sendText: "Not right now.",
    });
  }

  return dedupeSuggestions(suggestions);
}
