/**
 * Create workflow — distinguish FIELD CAPTURE from EXPLORATION.
 * Exploration: questions, brainstorming, examples, research — never saves.
 * Field capture: candidate answers — may enter pending approval.
 */

import { isHelpSeekingAnswer, isUserQuestionText, isBuilderApprovalPhrase } from "./builderContentSync";

const EXPLORATION_PHRASE_RE =
  /\b(?:what do you think|what would you suggest|what are some options|help me research|help me think(?:\s+this)?\s+through|help me brainstorm|give me examples?|show me examples?|let'?s brainstorm|compare these|tell me more|brainstorm(?:ing)?|research(?:ing)?|any examples?|some examples?|what problems do (?:they|people|(?:adhd|my)[\w\s-]*(?:owners?|clients?|customers?|audience)?)|what (?:could|should|can) i (?:put|write|say|include)|ideas? for|suggestions? for|what outcomes? would|what would make a good|can you help me think|help me think through|biggest problems?|think through this)\b/i;

/** User is exploring — not offering a field answer. */
export function isCreateExplorationRequest(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (isCandidateFieldAnswer(t)) return false;
  if (isHelpSeekingAnswer(t)) return true;
  if (isUserQuestionText(t)) return true;
  if (EXPLORATION_PHRASE_RE.test(t)) return true;
  return false;
}

/** User is offering content for the active field — not exploring. */
export function isCandidateFieldAnswer(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (isHelpSeekingAnswer(t)) return false;
  if (isUserQuestionText(t)) return false;
  if (isBuilderApprovalPhrase(t)) return false;
  if (EXPLORATION_PHRASE_RE.test(t)) return false;
  return (
    /^(?:i think|i believe|i'?d say|i would say|probably|maybe|how about|my answer is|they(?:'re| are)|it(?:'s| is))\b/i.test(
      t,
    ) || t.length >= 3
  );
}

export function shouldCaptureAsFieldAnswer(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  return isCandidateFieldAnswer(t) && !isCreateExplorationRequest(t);
}
