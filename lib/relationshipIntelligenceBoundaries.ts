/**
 * P0.17 — Relationship Intelligence Boundaries™
 * Relationship memory is for self-understanding only — not learning, creating,
 * planning, execution, strategy, or business building.
 */

export const RELATIONSHIP_INTELLIGENCE_OUT_OF_SCOPE = "RELATIONSHIP_INTELLIGENCE_OUT_OF_SCOPE";

/** Explicit self-understanding / identity / pattern reflection. */
const SELF_UNDERSTANDING_RE =
  /\b(?:why do i|why am i|why can't i|why can i not|why do i keep|why do i always|why do i never|what patterns do you notice|what patterns have you noticed|patterns have you noticed|what do you notice about me|what have you noticed about (?:me|how i)|how have i changed|what has changed about me|how have i grown|why am i stuck|why do i get stuck|get stuck before|how do i tend to|how do i usually|what'?s my pattern|my biggest strength|what am i good at|what i'?m good at|blind spots?|my blind spot|help me understand (?:my|why i|how i)|understand myself|about myself|decision patterns?|how do i (?:tend to )?make decisions|adhd patterns?|my adhd patterns?|behavior change|start but not finish|good starter but poor finisher|poor finisher|keep getting overwhelmed|getting overwhelmed|procrastinate|what makes me|who am i as)\b/i;

const RELATIONSHIP_REFLECTION_QUESTION_RE =
  /^(?:what|why|how)\b[\s\S]{0,120}\b(?:about me|my patterns?|myself|how i work|how i think|how i decide|my strength|my blind spot)\b/i;

/**
 * True only when the user is explicitly seeking self-understanding —
 * not knowledge, creation, planning, or business execution.
 */
export function isSelfUnderstandingIntent(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (SELF_UNDERSTANDING_RE.test(t)) return true;
  if (RELATIONSHIP_REFLECTION_QUESTION_RE.test(t)) return true;
  return false;
}

/** Default ACTION FIRST — suppress relationship layers unless self-understanding. */
export function shouldSuppressRelationshipIntelligenceForUserText(
  text: string,
): boolean {
  return !isSelfUnderstandingIntent(text);
}

export function relationshipIntelligenceBoundaryHintForChat(
  userText: string,
): string | null {
  if (!shouldSuppressRelationshipIntelligenceForUserText(userText)) return null;
  return [
    "RELATIONSHIP INTELLIGENCE BOUNDARIES™ (P0.17 — hard enforcement):",
    "This turn is NOT self-understanding. Answer the request directly.",
    "FORBIDDEN: I've noticed…, It sounds like…, You seem to…, relationship observations, ADHD pattern analysis, personality commentary, user-history reflection.",
    "No relationship lead. No observation engine. No wisdom/transformation framing.",
    "ACTION FIRST — help them learn, create, plan, decide, or execute.",
  ].join("\n");
}

export function auditRelationshipIntelligenceScope(input: {
  userText: string;
  relationshipSuppressed: boolean;
}): string | null {
  if (isSelfUnderstandingIntent(input.userText)) return null;
  if (input.relationshipSuppressed) return null;
  return RELATIONSHIP_INTELLIGENCE_OUT_OF_SCOPE;
}
