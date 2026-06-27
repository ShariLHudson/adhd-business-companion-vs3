/**
 * Affirmative and decline patterns for Conversation Commitment Engine.
 */

/** User affirmations that accept the last invitation. */
export const COMMITMENT_AFFIRMATIVE_RE =
  /^(?:yes|yep|yeah|yup|ok(?:ay)?|sure|sounds good|that would help|let'?s do it|go ahead|please|please do|works for me|perfect|that works|count me in|let'?s go)\.?$/i;

/** User declines that close the last invitation gracefully. */
export const COMMITMENT_DECLINE_RE =
  /^(?:no|nope|nah|not now|not yet|maybe later|no thanks|not really|skip|pass|don'?t|rather not)\.?$/i;

export function isCommitmentAffirmation(text: string): boolean {
  return COMMITMENT_AFFIRMATIVE_RE.test(text.trim());
}

export function isCommitmentDecline(text: string): boolean {
  return COMMITMENT_DECLINE_RE.test(text.trim());
}

export function isCommitmentReply(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  return isCommitmentAffirmation(t) || isCommitmentDecline(t);
}
