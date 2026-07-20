/**
 * Guard sticky Create / Universal Creation ownership.
 * Reflective life decisions and Create-room pushback must never resume a document workflow.
 */

/** Personal / life decisions — stay in conversation, never Create. */
const REFLECTIVE_LIFE_DECISION_RE =
  /\b(?:relocat(?:e|ion|ing)|move (?:or|away|cross)|don'?t (?:really )?want to (?:move|relocate)|(?:move|relocate) or (?:i )?am fired|employer wants|getting (?:a )?new job|job (?:locally|where i am)|can'?t make a decision|cannot make a decision|feel like i can'?t (?:make a )?decision|i really don'?t know|don'?t know what to do|torn about|pressured to (?:move|decide)|either move or)\b/i;

/** Member rejecting Create room / document hijack mid-conversation. */
const CREATE_ROOM_REJECTION_RE =
  /\b(?:what does (?:the )?create(?: room)? have to do|why (?:are we|did you|would you).{0,48}create(?: room)?|(?:the )?create room\b|not (?:about )?creat(?:e|ing) (?:a |an |the )?(?:document|draft|room)|stop (?:the )?creat(?:e|ing)|leave create)\b/i;

export function isReflectiveLifeDecisionTurn(userText: string): boolean {
  return REFLECTIVE_LIFE_DECISION_RE.test(userText.trim());
}

export function isCreateRoomRejectionTurn(userText: string): boolean {
  return CREATE_ROOM_REJECTION_RE.test(userText.trim());
}

/** True when this turn must not be handled by sticky Create ownership. */
export function isCreateIrrelevantUserTurn(userText: string): boolean {
  const t = userText.trim();
  if (!t) return false;
  if (isCreateRoomRejectionTurn(t)) return true;
  if (isReflectiveLifeDecisionTurn(t)) return true;
  return false;
}
