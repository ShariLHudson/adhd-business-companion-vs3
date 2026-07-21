/**
 * Platform rule — No primary action may appear to work while doing nothing.
 * Begin / Continue / Create / Save / Resume / Open always produce visible feedback.
 */

export const PRIMARY_ACTION_FEEDBACK_RULE =
  "Every primary action button must produce immediate feedback: progress, success, clarification, or an honest error. Never silent no-ops." as const;

export type PrimaryActionKind =
  | "begin"
  | "continue"
  | "create"
  | "save"
  | "resume"
  | "open";

export type PrimaryActionFeedbackKind =
  | "progress"
  | "success"
  | "clarify"
  | "error"
  | "empty";

export type PrimaryActionFeedback = {
  kind: PrimaryActionFeedbackKind;
  message: string;
  action: PrimaryActionKind;
};

/** Canonical Create Begin clarification (Founder P0). */
export const CREATE_BEGIN_AMBIGUOUS_MESSAGE =
  "I'm not quite sure what you'd like to create yet. Are you thinking of a workshop, event, document, project, or something else?";

export const CREATE_BEGIN_EMPTY_MESSAGE =
  "Tell me what you'd like to create first — a workshop, event, document, project, or something else — then tap Begin.";

export const CREATE_BEGIN_PROGRESS_MESSAGE = "Opening your workspace…";

export const CREATE_BEGIN_ERROR_MESSAGE =
  "I couldn't start that creation yet. Your words are still here — try again, or pick a type below.";

export function assertPrimaryActionHasFeedback(
  feedback: PrimaryActionFeedback | null | undefined,
): boolean {
  if (!feedback) return false;
  return Boolean(feedback.message?.trim());
}
