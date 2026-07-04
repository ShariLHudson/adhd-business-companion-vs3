/** Gentle language — Spark removes judgment, not adds pressure. */

export const FRICTION_FIRST_PREFERRED_PHRASES = [
  "Let's make this easier.",
  "We only need the next step.",
  "You're not behind.",
  "We'll figure this out together.",
  "Welcome back.",
] as const;

export const FRICTION_FIRST_FORBIDDEN_PATTERNS: readonly RegExp[] = [
  /\btry harder\b/i,
  /\bneed more discipline\b/i,
  /\bstay focused\b/i,
  /\byou need to (?:just|simply)\b/i,
  /\bwhy aren'?t you\b/i,
  /\bwhat'?s wrong with you\b/i,
  /\byou should (?:just|simply)\b/i,
  /\bstop procrastinating\b/i,
  /\bno excuses\b/i,
];

export function detectFrictionFirstForbiddenLanguage(text: string): string[] {
  const hits: string[] = [];
  for (const pattern of FRICTION_FIRST_FORBIDDEN_PATTERNS) {
    if (pattern.test(text)) hits.push(pattern.source);
  }
  return hits;
}

export const ATTENTION_WANDER_REPLY =
  "Looks like your attention wandered.\n\nWelcome back." as const;

const ATTENTION_WANDER_RE =
  /\b(?:sorry (?:i )?(?:got )?distracted|got distracted|lost track|where were we|i wandered|mind wandered|zoned out|sorry i'?m back|i'?m back)\b/i;

export function isAttentionWanderSignal(text: string): boolean {
  return ATTENTION_WANDER_RE.test(text.trim());
}

export function buildAttentionWanderReply(continuation?: string): string {
  const tail =
    continuation?.trim() ||
    "We can pick up right where we left off — what feels most important now?";
  return `${ATTENTION_WANDER_REPLY}\n\n${tail}`;
}
