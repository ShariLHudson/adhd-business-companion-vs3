/**
 * Explicit exit / task-change only. Feature names inside answers are not exits.
 */

const EXPLICIT_EXIT_RE =
  /^(?:stop|cancel|never mind|nvm|forget (?:it|this|that)|start over|leave this|go back|let'?s talk about something else|forget the (?:newsletter|email|draft|board|chamber)|return to shari|talk to shari)\b/i;

const EXPLICIT_EXIT_EMBEDDED_RE =
  /\b(?:never mind|forget (?:the )?(?:newsletter|email|draft)|cancel(?:\s+this|\s+that)?|start over|stop (?:this|creating|writing)|leave this|return to shari)\b/i;

const EXPLICIT_TASK_CHANGE_RE =
  /\b(?:open (?:plan my day|clear my mind|my business estate|rhythms|the board|boardroom|the chamber)|(?:let'?s |i (?:want to |need to )?)?(?:switch to|take this to the board|talk to (?:another|a different) (?:specialist|director|member)|change (?:specialist|director)|go to (?:plan my day|clear my mind)|instead (?:open|go to|do)))\b/i;

/**
 * Room / feature words that often appear as CONTENT inside an active workflow.
 * Mentions alone must not release ownership.
 */
export const CONTENT_NOT_EXIT_TERMS_RE =
  /\b(?:explain|introduce|write|app|board|chamber|plan my day|clear my mind|newsletter|email|projects?|reminders?|rhythms?)\b/i;

export function isExplicitOwnerExit(userText: string): boolean {
  const t = userText.trim();
  if (!t) return false;
  if (EXPLICIT_EXIT_RE.test(t)) return true;
  if (t.length <= 80 && EXPLICIT_EXIT_EMBEDDED_RE.test(t)) return true;
  return false;
}

export function isExplicitTaskChange(userText: string): boolean {
  const t = userText.trim();
  if (!t) return false;
  if (isExplicitOwnerExit(t)) return false;
  return EXPLICIT_TASK_CHANGE_RE.test(t);
}

/** True when the message is only content-ish vocabulary (not an exit). */
export function looksLikeWorkflowContentNotExit(userText: string): boolean {
  const t = userText.trim();
  if (!t) return false;
  if (isExplicitOwnerExit(t) || isExplicitTaskChange(t)) return false;
  return CONTENT_NOT_EXIT_TERMS_RE.test(t);
}
