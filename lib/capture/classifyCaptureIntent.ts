/**
 * classifyCaptureIntent™ — pure capture decision (no side effects).
 * Separate from resolveUserIntent — capture has its own tree.
 */

import type { CaptureIntent, CaptureType } from "./types";

const CAPTURE_VIEW_RE =
  /\b(?:show(?:\s+me)?|open|see|view|browse|take me to|go to|visit|head to)\b.{0,50}\b(?:my\s+)?(?:portfolio|journal|evidence\s+vault)\b/i;

const JOURNAL_WRITE_RE =
  /\b(?:(?:i\s+)?want\s+to\s+journal|journal\s+(?:this|that|it|the|my)|write\s+(?:this|that|it)\s+in\s+(?:my\s+)?journal|save\s+(?:this|that|it)\s+to\s+(?:my\s+)?journal)\b/i;

const PORTFOLIO_WRITE_RE =
  /\b(?:add\s+(?:this|that|it)\s+to\s+(?:my\s+)?portfolio|save\s+(?:this|that|it|an?\s+idea)\s+(?:to|in|into)\s+(?:my\s+)?portfolio|put\s+(?:this|that|it)\s+in\s+(?:my\s+)?portfolio)\b/i;

const EVIDENCE_WRITE_RE =
  /\b(?:save\s+(?:this\s+)?as\s+evidence|add\s+(?:this\s+)?to\s+(?:my\s+)?evidence(?:\s+vault)?|store\s+(?:this\s+)?(?:as\s+)?evidence)\b/i;

const GENERIC_SAVE_RE =
  /\b(?:save|store|add)\s+(?:this|that|it)(?:\s+(?:thought|idea|note))?\b/i;

const EMOTIONAL_CHAT_RE =
  /\b(?:i\s+feel\s+overwhelm|overwhelm(?:ed)?|anxious|stressed|burned?\s*out|can't\s+cope|help\s+me\s+(?:think|feel))\b/i;

function normalize(text: string): string {
  return text.trim().replace(/\s+/g, " ");
}

function detectWriteType(text: string): CaptureType | null {
  if (EVIDENCE_WRITE_RE.test(text)) return "evidence-vault";
  if (PORTFOLIO_WRITE_RE.test(text)) return "portfolio";
  if (JOURNAL_WRITE_RE.test(text)) return "journal";
  if (GENERIC_SAVE_RE.test(text)) return "journal";
  return null;
}

function detectViewType(text: string): CaptureType | null {
  const t = text.toLowerCase();
  if (/\bevidence\s+vault\b/.test(t)) return "evidence-vault";
  if (/\bportfolio\b/.test(t)) return "portfolio";
  if (/\bjournal\b/.test(t)) return "journal";
  return null;
}

/** Strip capture command phrasing — keep member content only. */
export function extractCaptureContent(userText: string, captureType: CaptureType): string {
  const t = normalize(userText);
  const colonSplit = t.split(/:\s*/);
  if (colonSplit.length > 1 && colonSplit[1]!.trim().length >= 3) {
    return colonSplit.slice(1).join(": ").trim();
  }

  const patterns: RegExp[] = [
    /^(?:i\s+)?want\s+to\s+journal\s+/i,
    /^journal\s+(?:this|that|it|the|my)\s+/i,
    /^write\s+(?:this|that|it)\s+in\s+(?:my\s+)?journal\s*[:\-]?\s*/i,
    /^save\s+(?:this|that|it)\s+to\s+(?:my\s+)?journal\s*[:\-]?\s*/i,
    /^add\s+(?:this|that|it)\s+to\s+(?:my\s+)?portfolio\s*[:\-]?\s*/i,
    /^save\s+(?:this|that|it|an?\s+idea)\s+(?:to|in|into)\s+(?:my\s+)?portfolio\s*[:\-]?\s*/i,
    /^put\s+(?:this|that|it)\s+in\s+(?:my\s+)?portfolio\s*[:\-]?\s*/i,
    /^save\s+(?:this\s+)?as\s+evidence\s+(?:that\s+)?/i,
    /^add\s+(?:this\s+)?to\s+(?:my\s+)?evidence(?:\s+vault)?\s*[:\-]?\s*/i,
    /^store\s+(?:this\s+)?(?:as\s+)?evidence\s*[:\-]?\s*/i,
    /^(?:save|store|add)\s+(?:this|that|it)(?:\s+(?:thought|idea|note))?\s*[:\-]?\s*/i,
  ];

  for (const pattern of patterns) {
    const stripped = t.replace(pattern, "").trim();
    if (stripped && stripped !== t) return stripped;
  }

  if (captureType === "journal" && JOURNAL_WRITE_RE.test(t)) {
    const after = t.replace(JOURNAL_WRITE_RE, "").trim();
    if (after.length >= 2) return after;
  }

  return t;
}

/** True when member is saving — blocks estate navigation and chat. */
export function isCaptureWriteTurn(userText: string): boolean {
  const t = normalize(userText);
  if (!t) return false;
  if (EMOTIONAL_CHAT_RE.test(t) && !detectWriteType(t)) return false;
  return detectWriteType(t) !== null && !CAPTURE_VIEW_RE.test(t);
}

/** True when member wants to open/browse — navigation only, not capture write. */
export function isCaptureViewTurn(userText: string): boolean {
  const t = normalize(userText);
  if (!t) return false;
  if (isCaptureWriteTurn(t)) return false;
  return CAPTURE_VIEW_RE.test(t) && detectViewType(t) !== null;
}

export function classifyCaptureIntent(userText: string): CaptureIntent {
  const t = normalize(userText);
  if (!t) return { kind: "none" };

  if (isCaptureWriteTurn(t)) {
    const captureType = detectWriteType(t)!;
    let content = extractCaptureContent(t, captureType);
    if (content.length < 2 && GENERIC_SAVE_RE.test(t)) {
      content = t.match(/\b(?:thought|idea|note)\b/i)?.[0] ?? t;
    }
    if (!content || content.length < 2) {
      return { kind: "none" };
    }
    return { kind: "write", captureType, content, userText: t };
  }

  if (isCaptureViewTurn(t)) {
    const captureType = detectViewType(t)!;
    return { kind: "view", captureType, userText: t };
  }

  return { kind: "none" };
}
