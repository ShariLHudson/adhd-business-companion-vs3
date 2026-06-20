/**
 * Create builder interaction modes — gates what may be saved to the workspace.
 *
 * 1. field-capture — user offers content for the active field (pending approval next)
 * 2. exploration — help, research, questions (never saved)
 * 3. revision — user revises a pending value (still needs approval)
 * 4. approval — user accepts pending value (commit only here)
 * 5. draft-now — user wants a draft with partial content (one confirmation)
 */

import {
  isBuilderApprovalPhrase,
  isInvalidBuilderFieldValue,
} from "./builderContentSync";
import {
  isCreateExplorationRequest,
  shouldCaptureAsFieldAnswer,
} from "./createExplorationMode";
import { isDraftWithWhatWeHaveRequest } from "./createSectionDiscovery";

export type CreateBuilderInteractionMode =
  | "field-capture"
  | "exploration"
  | "revision"
  | "approval"
  | "draft-now"
  | "section-pick"
  | "unhandled";

const REVISE_PHRASE_RE =
  /^(revise it|revise that|change it|not quite|let me revise)\b/i;

const KEEP_TALKING_RE =
  /^(keep talking|keep going|not yet|wait|hold on|let me explain)\b/i;

export function isCreateBuilderApprovalPhrase(text: string): boolean {
  return isBuilderApprovalPhrase(text);
}

export function isCreateBuilderRevisePhrase(text: string): boolean {
  return REVISE_PHRASE_RE.test(text.trim());
}

export function isCreateBuilderKeepTalkingPhrase(text: string): boolean {
  return KEEP_TALKING_RE.test(text.trim());
}

/** User is offering new field content (not exploration, not approval noise). */
export function shouldCaptureFieldAnswer(
  text: string,
  hasPendingApproval: boolean,
): boolean {
  if (hasPendingApproval) return false;
  const t = text.trim();
  if (!t) return false;
  if (!shouldCaptureAsFieldAnswer(t)) return false;
  if (isInvalidBuilderFieldValue(t, t)) return false;
  if (isBuilderApprovalPhrase(t)) return false;
  return true;
}

/** User is revising a pending value before approval. */
export function shouldRevisePendingValue(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (isCreateExplorationRequest(t)) return false;
  if (isInvalidBuilderFieldValue(t, t)) return false;
  if (isBuilderApprovalPhrase(t)) return false;
  return true;
}

export function classifyCreateBuilderInput(
  text: string,
  ctx: { hasPendingApproval: boolean },
): CreateBuilderInteractionMode {
  const t = text.trim();
  if (!t) return "unhandled";
  if (isDraftWithWhatWeHaveRequest(t)) return "draft-now";

  if (ctx.hasPendingApproval) {
    if (isCreateBuilderApprovalPhrase(t)) return "approval";
    if (isCreateBuilderRevisePhrase(t) || isCreateBuilderKeepTalkingPhrase(t)) {
      return "revision";
    }
    if (isCreateExplorationRequest(t)) return "exploration";
    return shouldRevisePendingValue(t) ? "revision" : "exploration";
  }

  if (isCreateExplorationRequest(t)) return "exploration";
  if (isBuilderApprovalPhrase(t)) return "exploration";
  if (shouldCaptureFieldAnswer(t, false)) return "field-capture";
  return "unhandled";
}
