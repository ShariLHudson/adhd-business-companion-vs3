/**
 * Smart thought splitting for natural comma-separated brain dumps.
 * Structural splits (newlines, bullets, semicolons) stay in clearMyMindCapture.ts.
 */

export type ThoughtSplitProposal = {
  raw: string;
  segments: string[];
  count: number;
};

const MAX_SEGMENTS = 12;
const MIN_SEGMENT_LENGTH = 6;

const CONTINUATION_START =
  /^(but|and|so|which|who|whom|whose|because|although|though|while|when|if|or)\b/i;

/** Strip from first segment only when saving a split. */
const FIRST_SEGMENT_PREFIX_RE =
  /^(?:i\s+)?(?:need\s+to|have\s+to|remember\s+to|want\s+to|should|gotta)\s+/i;

const ACTION_PREFIXES = [
  "work on",
  "pick up",
  "reach out",
  "follow up",
  "follow-up",
  "call",
  "text",
  "email",
  "finish",
  "schedule",
  "water",
  "reply",
  "send",
  "buy",
  "book",
  "pay",
  "write",
  "review",
  "update",
  "check",
  "fix",
  "make",
  "plan",
  "prep",
  "create",
  "draft",
  "post",
  "publish",
  "message",
  "ping",
  "contact",
  "meet",
  "get",
  "do",
  "go",
  "run",
].sort((a, b) => b.length - a.length);

function segmentForActionCheck(segment: string, isFirst: boolean): string {
  let text = segment.trim();
  if (isFirst) {
    text = text.replace(FIRST_SEGMENT_PREFIX_RE, "").trim();
  }
  return text;
}

function isActionLedSegment(segment: string, isFirst: boolean): boolean {
  const text = segmentForActionCheck(segment, isFirst).toLowerCase();
  if (!text) return false;
  return ACTION_PREFIXES.some(
    (prefix) => text === prefix || text.startsWith(`${prefix} `),
  );
}

/** Normalize segments after user confirms split — light touch on first segment only. */
export function normalizeSplitSegments(segments: string[]): string[] {
  if (!segments.length) return [];
  const [first, ...rest] = segments;
  const normalizedFirst = first.replace(FIRST_SEGMENT_PREFIX_RE, "").trim();
  return [(normalizedFirst || first).trim(), ...rest.map((s) => s.trim())].filter(
    Boolean,
  );
}

/**
 * Detect high-confidence comma-separated action dumps worth offering to split.
 * Returns null when confidence is not high enough.
 */
export function detectThoughtSplitProposal(
  raw: string,
): ThoughtSplitProposal | null {
  const text = raw.trim();
  if (!text.includes(",")) return null;

  const segments = text
    .split(/,\s*/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (segments.length < 2 || segments.length > MAX_SEGMENTS) return null;

  for (const segment of segments) {
    if (segment.length < MIN_SEGMENT_LENGTH) return null;
    if (CONTINUATION_START.test(segment)) return null;
  }

  const actionLed = segments.map((segment, index) =>
    isActionLedSegment(segment, index === 0),
  );
  if (!actionLed.every(Boolean)) return null;

  const normalized = normalizeSplitSegments(segments);
  if (normalized.length < 2) return null;

  return {
    raw: text,
    segments: normalized,
    count: normalized.length,
  };
}
