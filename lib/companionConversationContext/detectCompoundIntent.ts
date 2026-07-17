/**
 * Compound overwhelm + task — one choice, not feature dumping.
 * Never invent tasks (e.g. "the proposal") the member did not name.
 */

const OVERWHELM_RE =
  /\b(?:overwhelm(?:ed|ing)?|too much|can'?t think|brain feels full)\b/i;

/** Task signal — not bare "today" (that is just time-of-day framing). */
const TASK_SIGNAL_RE =
  /\b(?:finish|complete|deadline|due today|need to get .+ done(?: today)?|trying to (?:finish|complete)|this project|my project|proposal|the proposal)\b/i;

export function detectCompoundOverwhelmTask(userText: string): boolean {
  const t = userText.trim();
  if (!t) return false;
  return OVERWHELM_RE.test(t) && TASK_SIGNAL_RE.test(t);
}

export function formatCompoundOverwhelmTaskReply(userText?: string): string {
  const t = userText?.trim() ?? "";
  if (/\bproposal\b/i.test(t)) {
    return "That sounds like a lot to carry. Do you want to clear your mind first for two minutes, or go straight to the proposal?";
  }
  if (/\bproject\b/i.test(t)) {
    return "That sounds like a lot to carry. Do you want to get some of it out of your head first, or look at the next piece of this project?";
  }
  if (TASK_SIGNAL_RE.test(t)) {
    return "That sounds like a lot to carry. Do you want to clear your mind first, or look at what's most pressing?";
  }
  return "That sounds like a lot to carry. I'm right here with you.";
}
