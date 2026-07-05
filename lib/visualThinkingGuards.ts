/**
 * P0.20.3 — Visual Thinking guards
 * Visual recommendations must not run on ADHD/strategy/focus/overwhelm turns.
 */

import { shouldSuppressVisualThinkingForLearn } from "./visualLearnBoundary";

const PROCRASTINATION_RE =
  /\b(?:keep(?:s)?\s+putting\s+(?:this|it|off)|keep(?:s)?\s+avoiding|keep(?:s)?\s+procrastinat\w*|putting (?:it|this) off|won'?t do it|know what to do but (?:can'?t|won'?t)(?:\s+start|\s+do(?:\s+it)?)|know what to do but i won'?t)\b/i;

const SALES_AVOIDANCE_RE =
  /\b(?:putting off (?:my )?sales|avoid(?:ing)? sales|hate outreach|don'?t want to follow[- ]?up|avoid follow[- ]?up|avoid(?:ing)? (?:sales|outreach|calling))\b/i;

const STRATEGY_SELF_RE =
  /\b(?:why do i avoid|why do i keep|why can'?t i)\b/i;

const FOCUS_RE =
  /\b(?:need to focus|help me focus|help me concentrate|can'?t concentrate|trouble concentrating|stay focused|hard to focus|lose focus|losing focus|can'?t stay on task|stay on task)\b/i;

const OVERWHELM_RE =
  /\b(?:i'?m\s+overwhelm(?:ed)?|feels?\s+overwhelm(?:ed)?|too much to do|too much on my (?:brain|mind|head)|have too much on my (?:brain|mind|head)|don'?t know where to start|everything feels urgent|not sure where to start|too many things|can'?t prioritize|don'?t know where to begin)\b/i;

const MOTIVATION_RE =
  /\b(?:need motivation|can'?t motivate|no motivation|not motivated)\b/i;

const ACTIVATION_RE =
  /\b(?:activation difficulty|can'?t get started|can'?t get (?:myself )?to do it|can'?t start|stuck getting started|hard to start|won'?t start)\b/i;

const RELATIONSHIP_RE =
  /\b(?:why do i|what patterns|patterns have you noticed|how have i changed|what have you noticed|what do you notice about me|how do i usually|what'?s my pattern|help me understand (?:my|why i|how i))\b/i;

const EMOTIONAL_FRICTION_RE =
  /\b(?:anxious about|nervous about|scared (?:of|to)|afraid (?:of|to)|dreading)\b/i;

export function isStrategyProblem(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  return (
    PROCRASTINATION_RE.test(t) ||
    SALES_AVOIDANCE_RE.test(t) ||
    STRATEGY_SELF_RE.test(t)
  );
}

export function isFocusProblem(text: string): boolean {
  return FOCUS_RE.test(text.trim());
}

export function isOverwhelmProblem(text: string): boolean {
  return OVERWHELM_RE.test(text.trim());
}

export function isMotivationProblem(text: string): boolean {
  return MOTIVATION_RE.test(text.trim());
}

export function isActivationProblem(text: string): boolean {
  return ACTIVATION_RE.test(text.trim());
}

export function isRelationshipQuestion(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (isStrategyProblem(t)) return true;
  return RELATIONSHIP_RE.test(t);
}

/** True when visual recommendation or open must not run. */
export function shouldSuppressVisualRecommendation(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (
    /\b(?:map(?:\s+\w+){0,2}\s+visually|visuali[sz]e (?:this|it|that)|show (?:me )?(?:this )?visually)\b/i.test(
      t,
    )
  ) {
    return false;
  }
  if (shouldSuppressVisualThinkingForLearn(t)) return true;
  if (isStrategyProblem(t)) return true;
  if (isFocusProblem(t)) return true;
  if (isOverwhelmProblem(t)) return true;
  if (isMotivationProblem(t)) return true;
  if (isActivationProblem(t)) return true;
  if (isRelationshipQuestion(t)) return true;
  if (EMOTIONAL_FRICTION_RE.test(t)) return true;
  if (/\btoo many ideas\b/i.test(t)) return true;
  return false;
}

export function visualThinkingGuardsHintForChat(): string {
  return [
    "VISUAL THINKING GUARDS (P0.20.3):",
    "Never recommend or open Visual Thinking for procrastination, overwhelm, focus struggles, motivation, activation difficulty, sales avoidance, or relationship/self-pattern questions.",
    "Strategy Intelligence, Focus, Plan My Day, and Learn take priority.",
  ].join("\n");
}
