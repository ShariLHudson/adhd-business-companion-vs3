/**
 * First conversation — relationship seeds for Living Intelligence Graph™.
 * Inferred from the first reply only; never extra survey questions.
 */

const STORAGE_KEY = "companion-first-relationship-v1";

export type FirstRelationshipSignals = {
  capturedAt: string;
  firstConcern: string;
  wordCount: number;
  usedVoice: boolean;
  preferredInput: "typing" | "voice";
  /** Rough rhythm — short vs expansive first reply. */
  replyStyle: "brief" | "moderate" | "expansive";
};

function read(): FirstRelationshipSignals | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as FirstRelationshipSignals;
  } catch {
    return null;
  }
}

function write(signals: FirstRelationshipSignals) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(signals));
  } catch {
    /* quota */
  }
}

function replyStyle(text: string): FirstRelationshipSignals["replyStyle"] {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  if (words <= 8) return "brief";
  if (words <= 30) return "moderate";
  return "expansive";
}

/** Capture once — first user message on the companion home path. */
export function recordFirstRelationshipSignals(input: {
  userText: string;
  usedVoice: boolean;
}): FirstRelationshipSignals | null {
  if (read()) return null;
  const text = input.userText.trim();
  if (!text) return null;

  const signals: FirstRelationshipSignals = {
    capturedAt: new Date().toISOString(),
    firstConcern: text.slice(0, 280),
    wordCount: text.split(/\s+/).filter(Boolean).length,
    usedVoice: input.usedVoice,
    preferredInput: input.usedVoice ? "voice" : "typing",
    replyStyle: replyStyle(text),
  };
  write(signals);
  return signals;
}

export function getFirstRelationshipSignals(): FirstRelationshipSignals | null {
  return read();
}
