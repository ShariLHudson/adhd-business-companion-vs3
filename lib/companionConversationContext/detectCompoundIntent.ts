/**
 * Compound overwhelm + task — one choice, not feature dumping.
 */

const OVERWHELM_RE = /\b(?:overwhelm(?:ed|ing)?|too much|can'?t think|brain feels full)\b/i;
const TASK_TODAY_RE =
  /\b(?:finish|proposal|deadline|due today|need to get .+ done today|today)\b/i;

export function detectCompoundOverwhelmTask(userText: string): boolean {
  const t = userText.trim();
  if (!t) return false;
  return OVERWHELM_RE.test(t) && TASK_TODAY_RE.test(t);
}

export function formatCompoundOverwhelmTaskReply(): string {
  return "That sounds like a lot to carry. Do you want to clear your mind first for two minutes, or go straight to the proposal?";
}
