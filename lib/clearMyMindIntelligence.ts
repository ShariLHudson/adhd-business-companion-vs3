/**
 * Clear My Mind™ → Living Intelligence Graph™ (silent enrichment).
 *
 * Records structured submission data on every brain dump hold.
 * Never surfaced in the UI — foundation for future ecosystem intelligence.
 */

import type { BrainDumpEntry } from "./companionStore";

const STORAGE_KEY = "companion-clear-my-mind-intelligence-v2";
const MAX_SUBMISSIONS = 200;
const MAX_SESSIONS = 40;

export type ClearMyMindSubmissionRecord = {
  timestamp: string;
  sessionId: string;
  rawDumpText: string;
  extractedItems: string[];
  itemCount: number;
  wordCount: number;
  inferredCategories: string[];
  emotionalTone: string | null;
  peopleMentioned: string[];
  businessTerms: string[];
  inputMode: "voice" | "typing" | "mixed";
  sessionContext: "clear-my-mind";
};

export type ClearMyMindSessionRecord = {
  capturedAt: string;
  sessionId: string;
  thoughtCount: number;
  wordCount: number;
  samples: string[];
  themes: string[];
  usedVoice: boolean;
  submissions: number;
};

export type ClearMyMindIntelligenceGraph = {
  submissions: ClearMyMindSubmissionRecord[];
  sessions: ClearMyMindSessionRecord[];
  recurringThemes: Record<string, number>;
  totalThoughtsCaptured: number;
};

const EMOTION_RE =
  /\b(?:overwhelm(?:ed)?|anxious|anxiety|stressed|stress|exhausted|tired|scared|worried|frustrated|stuck|behind|panic|burned?\s*out)\b/i;

const BUSINESS_RE =
  /\b(?:client|customers?|revenue|sales|marketing|newsletter|launch|offer|course|coaching|project|deadline|invoice|brand|content|website|email)\b/gi;

/** Capitalized tokens that look like names (not sentence starts). */
function extractPeople(text: string): string[] {
  const found = new Set<string>();
  const chunks = text.split(/[,.\n;]+/);
  for (const chunk of chunks) {
    const words = chunk.trim().split(/\s+/);
    for (const word of words) {
      const m = word.match(/^([A-Z][a-z]{2,})$/);
      if (m && !["Call", "Email", "Finish", "Text", "Send", "The", "And"].includes(m[1]!)) {
        found.add(m[1]!);
      }
    }
  }
  return [...found].slice(0, 8);
}

function extractBusinessTerms(text: string): string[] {
  const matches = text.match(BUSINESS_RE) ?? [];
  return [...new Set(matches.map((m) => m.toLowerCase()))].slice(0, 12);
}

function inferEmotionalTone(text: string): string | null {
  if (!EMOTION_RE.test(text)) return null;
  if (/\boverwhelm/i.test(text)) return "overwhelm";
  if (/\b(?:anxious|anxiety|worried|scared)/i.test(text)) return "anxiety";
  if (/\b(?:exhausted|tired|burned?\s*out)/i.test(text)) return "exhausted";
  if (/\b(?:stressed|stress|frustrated)/i.test(text)) return "stress";
  if (/\bstuck|behind/i.test(text)) return "stuck";
  return "heavy";
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function read(): ClearMyMindIntelligenceGraph {
  if (typeof window === "undefined") {
    return {
      submissions: [],
      sessions: [],
      recurringThemes: {},
      totalThoughtsCaptured: 0,
    };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        submissions: [],
        sessions: [],
        recurringThemes: {},
        totalThoughtsCaptured: 0,
      };
    }
    const parsed = JSON.parse(raw) as ClearMyMindIntelligenceGraph;
    return {
      submissions: parsed.submissions ?? [],
      sessions: parsed.sessions ?? [],
      recurringThemes: parsed.recurringThemes ?? {},
      totalThoughtsCaptured: parsed.totalThoughtsCaptured ?? 0,
    };
  } catch {
    return {
      submissions: [],
      sessions: [],
      recurringThemes: {},
      totalThoughtsCaptured: 0,
    };
  }
}

function write(graph: ClearMyMindIntelligenceGraph) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(graph));
  } catch {
    /* quota */
  }
}

function extractThemes(entries: BrainDumpEntry[]): string[] {
  const themes = new Set<string>();
  for (const entry of entries) {
    if (entry.category?.trim()) themes.add(entry.category.trim());
    if (entry.topic?.trim()) themes.add(entry.topic.trim());
  }
  return [...themes].slice(0, 8);
}

function resolveInputMode(
  usedVoice: boolean,
  usedTyping: boolean,
): ClearMyMindSubmissionRecord["inputMode"] {
  if (usedVoice && usedTyping) return "mixed";
  if (usedVoice) return "voice";
  return "typing";
}

/** Record one Hold-this submission — called on every brain dump capture. */
export function recordClearMyMindSubmission(input: {
  sessionId: string;
  rawDumpText: string;
  extractedItems: string[];
  entries: BrainDumpEntry[];
  usedVoice: boolean;
  usedTyping: boolean;
}): void {
  const raw = input.rawDumpText.trim();
  if (!raw && input.extractedItems.length === 0) return;

  const combined = input.extractedItems.join(" ");
  const graph = read();

  const record: ClearMyMindSubmissionRecord = {
    timestamp: new Date().toISOString(),
    sessionId: input.sessionId,
    rawDumpText: raw.slice(0, 2000),
    extractedItems: input.extractedItems.map((t) => t.slice(0, 280)),
    itemCount: input.extractedItems.length,
    wordCount: wordCount(raw || combined),
    inferredCategories: extractThemes(input.entries),
    emotionalTone: inferEmotionalTone(raw || combined),
    peopleMentioned: extractPeople(raw || combined),
    businessTerms: extractBusinessTerms(raw || combined),
    inputMode: resolveInputMode(input.usedVoice, input.usedTyping),
    sessionContext: "clear-my-mind",
  };

  graph.submissions = [record, ...graph.submissions].slice(0, MAX_SUBMISSIONS);
  write(graph);
}

/** Session summary when the user finishes a release pass. */
export function recordClearMyMindSessionIntelligence(input: {
  sessionId: string;
  entries: BrainDumpEntry[];
  usedVoice?: boolean;
  submissionCount?: number;
}): void {
  const entries = input.entries.filter((e) => e.text?.trim());
  if (entries.length === 0) return;

  const graph = read();
  const themes = extractThemes(entries);
  const totalWords = entries.reduce(
    (sum, e) => sum + wordCount(e.text),
    0,
  );

  const record: ClearMyMindSessionRecord = {
    capturedAt: new Date().toISOString(),
    sessionId: input.sessionId,
    thoughtCount: entries.length,
    wordCount: totalWords,
    samples: entries.map((e) => e.text.trim().slice(0, 120)),
    themes,
    usedVoice: input.usedVoice ?? false,
    submissions: input.submissionCount ?? 1,
  };

  graph.sessions = [record, ...graph.sessions].slice(0, MAX_SESSIONS);
  graph.totalThoughtsCaptured += entries.length;

  for (const theme of themes) {
    const key = theme.toLowerCase();
    graph.recurringThemes[key] = (graph.recurringThemes[key] ?? 0) + 1;
  }

  write(graph);
}

export function getClearMyMindIntelligenceGraph(): ClearMyMindIntelligenceGraph {
  return read();
}

/** @internal test helpers */
export const __clearMyMindIntelligenceTest = {
  inferEmotionalTone,
  extractPeople,
  extractBusinessTerms,
  wordCount,
};
