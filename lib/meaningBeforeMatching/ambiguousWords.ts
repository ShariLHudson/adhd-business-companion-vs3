/**
 * Meaning Before Matching — problem words that need context, not single-keyword routing.
 */

export const PROBLEM_WORDS = [
  "connect",
  "create",
  "build",
  "post",
  "share",
  "write",
  "launch",
  "plan",
  "follow",
  "audience",
  "campaign",
  "profile",
  "board",
  "pin",
  "story",
  "reel",
  "page",
  "calendar",
  "link",
  "sync",
  "publish",
  "send",
] as const;

export type ProblemWord = (typeof PROBLEM_WORDS)[number];

const PROBLEM_WORD_RE = new RegExp(
  `\\b(?:${PROBLEM_WORDS.join("|")})\\b`,
  "i",
);

/** True when text is only (or essentially) a single problem word — never auto-route. */
export function isSingleProblemWordMessage(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  const words = t.replace(/[^\w\s'-]/g, " ").trim().split(/\s+/);
  if (words.length !== 1) return false;
  return PROBLEM_WORD_RE.test(words[0]!);
}

export function containsProblemWord(text: string): boolean {
  return PROBLEM_WORD_RE.test(text.trim());
}

/** Block workspace routing when only a bare problem word appears without explicit open intent. */
export function shouldBlockSingleKeywordWorkspaceRoute(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (/\b(?:open|take me to|go to|show me)\b/i.test(t)) return false;
  if (isSingleProblemWordMessage(t)) return true;
  const words = t.replace(/[^\w\s'-]/g, " ").trim().split(/\s+/).filter(Boolean);
  if (words.length <= 2 && containsProblemWord(t) && !/\?/.test(t)) {
    return true;
  }
  return false;
}
