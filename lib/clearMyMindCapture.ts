/** One-thought-at-a-time capture for Clear My Mind. */

export type CapturePhase = "first" | "more" | "sorting" | "complete";

export function newCaptureSessionId(): string {
  return `cmind-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const BULLET_RE = /^\s*(?:[-*•]|\d+[.)])\s+/;

/**
 * Split pasted multi-line / bulleted input into separate thoughts.
 * Never store multiple distinct thoughts as one item.
 */
export function splitCaptureInput(raw: string): string[] {
  const text = raw.trim();
  if (!text) return [];

  const lines = text
    .split(/\r?\n/)
    .map((l) => l.replace(BULLET_RE, "").trim())
    .filter(Boolean);

  if (lines.length <= 1) {
    // Also split obvious "item1; item2; item3" only when short clauses
    if (text.includes(";") && text.split(";").length >= 3) {
      const parts = text
        .split(";")
        .map((p) => p.trim())
        .filter((p) => p.length > 2);
      if (parts.length >= 2) return parts;
    }
    return [text];
  }

  return lines;
}

export function capturePrompt(phase: CapturePhase, count: number): string {
  if (phase === "first" || count === 0) {
    return "What's taking up space in your head right now?";
  }
  if (phase === "more") {
    return "Anything else?";
  }
  if (phase === "sorting") {
    return "Let's sort what you captured — one item at a time.";
  }
  return "Nice — your mind is a little clearer.";
}

export function captureAck(count: number): string {
  if (count === 1) return "Got it.";
  return `Got it — ${count} items captured.`;
}
