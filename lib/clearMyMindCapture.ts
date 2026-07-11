/** One-thought-at-a-time capture for Clear My Mind. */

export type CapturePhase = "first" | "more" | "sorting" | "complete";

export function newCaptureSessionId(): string {
  return `cmind-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const BULLET_RE = /^\s*(?:[-*•]|\d+[.)])\s+/;
const PERIOD_CLAUSE_RE = /\.\s+(?=[A-Za-z])/;

function splitPeriodClauses(text: string): string[] | null {
  if (!PERIOD_CLAUSE_RE.test(text)) return null;
  const parts = text
    .split(PERIOD_CLAUSE_RE)
    .map((part) => part.replace(/\.$/, "").trim())
    .filter((part) => part.length >= 3);
  return parts.length >= 2 ? parts : null;
}

function splitSemicolonClauses(text: string): string[] | null {
  if (!text.includes(";")) return null;
  const parts = text
    .split(";")
    .map((part) => part.trim())
    .filter((part) => part.length > 2);
  return parts.length >= 2 ? parts : null;
}

function splitCommaList(text: string): string[] | null {
  if (!text.includes(",")) return null;
  const parts = text
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
  /** Only treat as a list when there are multiple meaningful pieces. */
  if (parts.length < 2) return null;
  if (parts.every((part) => part.split(/\s+/).length <= 8)) return parts;
  return null;
}

/**
 * Split pasted multi-line / bulleted / comma / clause input into thoughts.
 * Raw text stays available to the member; this only counts and stores pieces.
 */
export function splitCaptureInput(raw: string): string[] {
  const text = raw.trim();
  if (!text) return [];

  const lines = text
    .split(/\r?\n/)
    .map((l) => l.replace(BULLET_RE, "").trim())
    .filter(Boolean);

  if (lines.length > 1) {
    return lines.flatMap((line) => {
      const commaParts = splitCommaList(line);
      return commaParts ?? [line];
    });
  }

  const semicolonParts = splitSemicolonClauses(text);
  if (semicolonParts) return semicolonParts;

  const commaParts = splitCommaList(text);
  if (commaParts) return commaParts;

  const periodParts = splitPeriodClauses(text);
  if (periodParts) return periodParts;

  return [text];
}

export function capturePrompt(phase: CapturePhase, count: number): string {
  if (phase === "first" || count === 0) {
    return "What's taking up space in your head right now?";
  }
  if (phase === "more") {
    return "Want to add another thought?";
  }
  if (phase === "sorting") {
    return "When you're ready, you can sort what you captured.";
  }
  return "Your thoughts are resting here.";
}

export function captureAck(count: number): string {
  if (count === 1) return "Got it.";
  return `Got it — ${count} items captured.`;
}
