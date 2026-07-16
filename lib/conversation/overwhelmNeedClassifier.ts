/**
 * Distinguishes cognitive overload, task breakdown, and emotional calming
 * before any scenic / multi-destination overwhelm menu runs.
 */

export type OverwhelmNeedKind =
  | "cognitive_overload"
  | "task_breakdown"
  | "emotional_calming"
  | null;

/** Working-memory / open-loop overload — Clear My Mind, not scenic places. */
const COGNITIVE_OVERLOAD_RE =
  /\b(?:too much on my (?:brain|mind|head)|have too much on my (?:brain|mind|head)|too much (?:in|on) my (?:brain|mind|head)|can'?t remember (?:everything|it all)|to remember it all|afraid i(?:'|’)(?:ll| will) forget|fear(?: of)? forget(?:ting)?|too many (?:tasks|things|thoughts) in my (?:head|mind|brain)|everything (?:feels? )?(?:jumbled|scattered)|holding too much in my head|brain (?:is )?(?:full|crowded|spinning)|get (?:this|it|them) out of my (?:head|mind)|need to dump|brain dump|mental clutter)\b/i;

/** Large project / first-step paralysis — ask about the work, not calm places. */
const TASK_BREAKDOWN_RE =
  /\b(?:don'?t know (?:what|the) (?:first )?step|don'?t know where to begin|don'?t know where to start|not sure where to start|project (?:is )?(?:too big|huge)|huge project|big project|too big (?:to start|of a project)|what step to take first|first (?:concrete )?step|where (?:do i|should i) begin)\b/i;

/** Body/nervous-system calming — breathe / calm audio / stay and talk. */
const EMOTIONAL_CALMING_RE =
  /\b(?:feel(?:ing)? panick?y|panicking|panic attack|need to calm down|help me calm|calm me down|need a (?:mental )?break|my body feels anxious|nervous system|can'?t catch my breath|need to breathe|anxious and need|feel(?:ing)? anxious)\b/i;

/** Scenic place ask — only then offer Peaceful Places / hammock / conservatory. */
const SCENIC_PLACE_ASK_RE =
  /\b(?:quiet|peaceful|calm)\s+place|somewhere (?:quiet|peaceful|calm)|need to (?:relax|unwind|rest)|take me to (?:the )?(?:garden|hammock|conservatory|peaceful)|scenic|lakeside|ocean conservatory\b/i;

export function isCognitiveOverloadNeed(text: string): boolean {
  return COGNITIVE_OVERLOAD_RE.test(text.trim());
}

export function isTaskBreakdownNeed(text: string): boolean {
  return TASK_BREAKDOWN_RE.test(text.trim());
}

export function isEmotionalCalmingNeed(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (isCognitiveOverloadNeed(t)) return false;
  return EMOTIONAL_CALMING_RE.test(t);
}

export function wantsScenicCalmPlaces(text: string): boolean {
  return SCENIC_PLACE_ASK_RE.test(text.trim());
}

/**
 * Classify overwhelm-adjacent needs. Cognitive overload wins over bare "too much"
 * scenic menus. Task breakdown wins when first-step/project language is present
 * without cognitive-unload language.
 */
export function classifyOverwhelmNeed(text: string): OverwhelmNeedKind {
  const t = text.trim();
  if (!t) return null;

  if (isCognitiveOverloadNeed(t)) return "cognitive_overload";
  if (isTaskBreakdownNeed(t)) return "task_breakdown";
  if (isEmotionalCalmingNeed(t)) return "emotional_calming";
  return null;
}

/** Block Peaceful Places / multi-destination scenic menus for this text. */
export function shouldBlockScenicOverwhelmMenu(text: string): boolean {
  // Explicit scenic / place asks are never blocked by this helper.
  if (wantsScenicCalmPlaces(text)) return false;
  const kind = classifyOverwhelmNeed(text);
  if (kind === "cognitive_overload" || kind === "task_breakdown") return true;
  // Emotional calming without a place ask — stay in conversation (no scenic list).
  if (kind === "emotional_calming") return true;
  // Bare overwhelm / stress language without an explicit place ask.
  if (
    /\b(?:overwhelm(?:ed|ing)?|stress(?:ed|ful)?|anxious|anxiety|too much on my (?:brain|mind))\b/i.test(
      text,
    )
  ) {
    return true;
  }
  return false;
}

export const COGNITIVE_OVERLOAD_REPLY =
  "You’re trying to hold too many unfinished things in your head at once. Let’s get them out first so you don’t have to keep remembering everything. We can organize them after.";

export const COGNITIVE_OVERLOAD_PRIMARY_LABEL = "Open Clear My Mind";
export const COGNITIVE_OVERLOAD_STAY_LABEL = "Let’s Do It Here";

export const TASK_BREAKDOWN_REPLY =
  "A big project with no clear first step is enough to freeze anyone. What’s the project, and what’s the smallest piece that has to move first?";
