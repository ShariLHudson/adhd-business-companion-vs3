/**
 * Natural language variation — reduce formulaic openers and repeats.
 */

const FORMULAIC_OPENERS = [
  /^i(?:'m| am) curious(?: about)?(?: one part of that)?[.!]?\s*/i,
  /^can i ask you something\??\s*/i,
  /^tell me more(?: about that(?: part)?)?[.!]?\s*/i,
  /^what else(?: wants to be said| is true)?[.?!]?\s*/i,
  /^how does that make you feel\??\s*/i,
  /^what possibilities\b[^.?]*[.?]?\s*/i,
  /^i wonder if\b/i, // strip only when overused as opener stack — handled separately
];

/** Openers that may appear occasionally but not consecutively. */
const TRACKED_STEMS = [
  "i am curious",
  "i'm curious",
  "can i ask you something",
  "tell me more",
  "what else",
  "i wonder",
  "tell me if i am reading",
  "tell me if this fits",
];

export function stripLeadingFormulaicOpener(text: string): string {
  let out = text.trim();
  for (const re of FORMULAIC_OPENERS) {
    // Keep "I wonder…" as content unless it's a stacked opener before another formula.
    if (re.source.startsWith("^i wonder")) continue;
    const next = out.replace(re, "").trim();
    if (next && next !== out) out = next;
  }
  // Stacked: "Can I ask… I am curious…"
  out = out
    .replace(
      /^(?:can i ask you something\??\s*)?(?:i(?:'m| am) curious[^.?]*[.!]?\s*)+/i,
      "",
    )
    .trim();
  return out || text.trim();
}

export function openerStem(text: string): string | null {
  const lower = text.toLowerCase().slice(0, 80);
  for (const stem of TRACKED_STEMS) {
    if (lower.includes(stem)) return stem;
  }
  return null;
}

export function recentUsesStem(
  recentAssistantTexts: readonly string[],
  stem: string,
): boolean {
  const last = recentAssistantTexts.slice(-3);
  return last.some((t) => t.toLowerCase().includes(stem));
}

/**
 * If the draft opens with a stem used recently, strip it so the body stands alone.
 */
export function varyAgainstRecent(
  text: string,
  recentAssistantTexts: readonly string[] = [],
): string {
  let out = stripLeadingFormulaicOpener(text);
  const stem = openerStem(out);
  if (stem && recentUsesStem(recentAssistantTexts, stem)) {
    // Drop first sentence if it is mostly the stem
    const firstBreak = out.search(/[.!?]\s+/);
    if (firstBreak > 0 && firstBreak < 90) {
      const first = out.slice(0, firstBreak + 1);
      if (openerStem(first) === stem) {
        out = out.slice(firstBreak + 1).trim();
      }
    } else {
      out = stripLeadingFormulaicOpener(out);
    }
  }
  return out || text.trim();
}

export function countSentences(text: string): number {
  const parts = text.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean);
  return Math.max(1, parts.length);
}

export function trimToSentenceBudget(text: string, max: number): string {
  if (countSentences(text) <= max) return text.trim();
  const parts = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [text];
  return parts.slice(0, max).join(" ").replace(/\s+/g, " ").trim();
}
