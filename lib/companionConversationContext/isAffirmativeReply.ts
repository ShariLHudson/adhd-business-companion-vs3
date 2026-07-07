/**
 * Unified affirmative replies — pending action execution must not reclassify these.
 */

export const AFFIRMATIVE_REPLY_RE =
  /^(?:yes(?:\s+please)?|yep|yeah|yup|sure|ok(?:ay)?|please|do that|open it|do it|go ahead|let'?s do (?:it|that)|use it|let'?s use it|sounds good|that works|that would be great|perfect|great|take me there|start|create it)\.?$/i;

export function isAffirmativeReply(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  return AFFIRMATIVE_REPLY_RE.test(t);
}
