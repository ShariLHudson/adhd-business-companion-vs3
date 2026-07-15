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
const MIN_SEGMENT_LENGTH = 3;

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
  "order",
  "organize",
  "remind",
  "cancel",
  "reschedule",
  "submit",
  "file",
  "clean",
  "wash",
  "walk",
  "feed",
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

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Voice input often omits commas — detect multiple action-led phrases in one line.
 */
function splitOnActionBoundaries(text: string): string[] | null {
  const trimmed = text.trim();
  if (
    !trimmed ||
    trimmed.includes(",") ||
    trimmed.includes(";") ||
    /\r?\n/.test(trimmed)
  ) {
    return null;
  }

  const prefixPattern = ACTION_PREFIXES.map(escapeRegExp).join("|");
  const boundaryRe = new RegExp(
    `(?:^|\\s+)(${prefixPattern})(?=\\s|$)`,
    "gi",
  );
  const starts: number[] = [];
  let match: RegExpExecArray | null;
  while ((match = boundaryRe.exec(trimmed)) !== null) {
    const prefix = match[1] ?? "";
    const prefixStart = match.index + match[0].length - prefix.length;
    starts.push(prefixStart);
  }

  const uniqueStarts = [...new Set(starts)].sort((a, b) => a - b);
  if (uniqueStarts.length < 2) return null;

  const segments = uniqueStarts
    .map((start, index) => {
      const end = uniqueStarts[index + 1] ?? trimmed.length;
      return trimmed.slice(start, end).trim();
    })
    .filter(Boolean);

  if (segments.length < 2 || segments.length > MAX_SEGMENTS) return null;

  for (const segment of segments) {
    if (segment.length < MIN_SEGMENT_LENGTH) return null;
    if (CONTINUATION_START.test(segment)) return null;
  }

  return segments;
}

function splitOnClauseDelimiters(text: string): string[] | null {
  const delimiter = text.includes(",") ? /,\s*/ : /\.\s+/;
  const segments = text
    .split(delimiter)
    .map((segment) => segment.replace(/\.$/, "").trim())
    .filter(Boolean);

  if (segments.length < 2 || segments.length > MAX_SEGMENTS) return null;

  for (const segment of segments) {
    if (segment.length < MIN_SEGMENT_LENGTH) return null;
    if (CONTINUATION_START.test(segment)) return null;
  }

  return segments;
}

/**
 * Prepare segments for save/display.
 * Only trim whitespace and drop empties — never strip internal characters,
 * apostrophes, or rewrite wording. Prefix stripping is opt-in for UI previews only.
 */
export function normalizeSplitSegments(
  segments: string[],
  opts?: { stripLeadingNeedTo?: boolean },
): string[] {
  if (!segments.length) return [];
  const stripPrefix = opts?.stripLeadingNeedTo === true;
  return segments
    .map((segment, index) => {
      let text = segment.trim();
      if (stripPrefix && index === 0) {
        const withoutPrefix = text.replace(FIRST_SEGMENT_PREFIX_RE, "").trim();
        text = withoutPrefix || text;
      }
      return text;
    })
    .filter(Boolean);
}

/**
 * Detect comma- or period-separated dumps worth offering to split.
 * Returns null when confidence is not high enough.
 */
function resolveSplitSegments(text: string): string[] | null {
  return splitOnClauseDelimiters(text) ?? splitOnActionBoundaries(text);
}

export function detectThoughtSplitProposal(
  raw: string,
): ThoughtSplitProposal | null {
  const text = raw.trim();
  if (!text) return null;

  const segments = resolveSplitSegments(text);
  if (!segments) return null;

  const actionLedCount = segments.filter((segment, index) =>
    isActionLedSegment(segment, index === 0),
  ).length;

  const shortClauseCount = segments.filter(
    (segment) => segment.length <= 72,
  ).length;

  const looksLikeList =
    actionLedCount >= 2 ||
    (shortClauseCount === segments.length && segments.length >= 2);

  if (!looksLikeList) return null;

  const normalized = normalizeSplitSegments(segments);
  if (normalized.length < 2) return null;

  return {
    raw: text,
    segments: normalized,
    count: normalized.length,
  };
}
