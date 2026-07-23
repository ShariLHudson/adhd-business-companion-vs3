/**
 * 066 — Member-facing language that assumes Chat | Workspace split.
 */

export const BANNED_SPLIT_EXPERIENCE_PHRASES = [
  "I'll open that in the workspace while we keep chatting",
  "You'll see the workspace beside our conversation",
  "The split view lets us work together",
  "open beside chat",
  "beside chat",
  "beside our conversation",
  "beside you",
  "beside us",
  "keep chatting here while you work",
  "keep chatting while",
  "continue chatting",
  "workspace beside",
  "side-by-side",
  "split view",
  "split screen",
  "Open & Keep Chatting",
  "panel on the right",
  "Opening Create beside",
] as const;

export const BANNED_SPLIT_EXPERIENCE_PATTERNS: readonly RegExp[] = [
  /\bkeep chatting (?:here )?while\b/i,
  /\bcontinue chatting\b/i,
  /\bbeside chat\b/i,
  /\bbeside our conversation\b/i,
  /\bbeside us\b/i,
  /\bis open beside (?:you|us)\b/i,
  /\bopen(?:ing)? (?:it |Create )?beside\b/i,
  /\bin Create beside\b/i,
  /\bsplit (?:view|screen)\b/i,
  /\bside[- ]by[- ]side\b/i,
  /\bworkspace beside\b/i,
  /\bwhile we keep chatting\b/i,
  /\bpanel on the right\b/i,
  /\bOpen & Keep Chatting\b/i,
];

export function containsBannedSplitExperienceCopy(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  return BANNED_SPLIT_EXPERIENCE_PATTERNS.some((re) => re.test(t));
}

/** Preferred Shari lines when a living workspace is ready (066 + 067). */
export const SINGLE_EXPERIENCE_READY_LINES = {
  /** Never claim "created" without Event Record evidence (067). */
  created: "Let's work on your workshop together.",
  workTogether: "Let's continue building it together.",
  organized: "Here's what I understand so far.",
  ready: "Your workshop is ready.",
  createReady: "I've opened your workspace — let's work on it together.",
  draftReady: "Your draft is ready. Let's continue building it together.",
  opened: "I've opened it — let's continue from here.",
  googleReady: "Your Google file is open — tell me what to add, change, or move.",
} as const;

/**
 * Last-resort rewrite — remove dual-experience language from member-facing copy.
 * Prefer fixing source strings; this catches stragglers at egress.
 */
export function rewriteBannedSplitExperienceCopy(text: string): string {
  let out = text;
  if (!out.trim()) return out;

  out = out.replace(
    /\bOpening\s+\*\*[^*]+\*\*\s+beside us[^.!?\n]*/gi,
    SINGLE_EXPERIENCE_READY_LINES.opened,
  );
  out = out.replace(
    /\bOpening\s+[^*]+?\s+beside us[^.!?\n]*/gi,
    SINGLE_EXPERIENCE_READY_LINES.opened,
  );
  out = out.replace(
    /\*\*Google (?:Docs?|Sheets?|Forms?)\*\*\s+is open beside us[^.!?\n]*/gi,
    SINGLE_EXPERIENCE_READY_LINES.googleReady,
  );
  out = out.replace(
    /\b(?:Want me to |Shall I )?open(?:ing)?\s+\*\*[^*]+\*\*\s+beside us\??/gi,
    "Want me to open that for us?",
  );
  out = out.replace(/\bbeside (?:our )?conversation\b/gi, "here");
  out = out.replace(/\bbeside chat\b/gi, "in the workspace");
  out = out.replace(/\bbeside us\b/gi, "here");
  out = out.replace(/\bbeside you\b/gi, "here");
  out = out.replace(/\bkeep chatting (?:here )?while[^.!?\n]*/gi, "Let's continue building it together");
  out = out.replace(/\bcontinue chatting\b/gi, "continue here");
  out = out.replace(/\bchat stays (?:right )?here\b/gi, "we'll keep going together");
  out = out.replace(/\bsplit (?:view|screen)\b/gi, "workspace");
  out = out.replace(/\bside[- ]by[- ]side\b/gi, "together");
  out = out.replace(/\bOpen & Keep Chatting\b/gi, "Open");
  out = out.replace(/\bpanel on the right\b/gi, "workspace");
  out = out.replace(/\bwhile we keep chatting\b/gi, "as we build");
  out = out.replace(/\bI'll open (?:a |the )?side panel\b/gi, "I'll open the workspace");

  // Collapse awkward double spaces / leftover dashes from replacements
  out = out.replace(/[ \t]{2,}/g, " ").replace(/\s+([,.!?])/g, "$1");
  return out;
}
