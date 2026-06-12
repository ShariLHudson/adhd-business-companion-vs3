// Restore what the user already has open — no blank chooser.

import { isSavedDocumentRecoveryRequest } from "./savedArtifact";
import { isCreateResumeRequest } from "./workspaceIntent";

const ACTIVE_WORKSPACE_RE =
  /\b(?:what do i have open|what'?s open|what is open|where is my (?:draft|proposal|project|focus|timer|session|time ?block|planning|sop|document|avatar|workshop)|show my (?:draft|proposal|project|workspace|time ?block|sop|avatar|client avatar|workshop)|open my (?:draft|proposal|project|google doc|client avatar|workshop)|where did (?:it|my draft|my proposal|create|the draft|the proposal) go|did it open|is (?:the )?timer running|focus session|where'?s my focus|bring back (?:my )?(?:draft|proposal|project|workspace|sop)|continue working|don'?t see (?:it|the time ?block|planning)|i don'?t see (?:it|the time ?block|planning))\b/i;

const FOCUS_RECOVERY_RE =
  /\b(?:where is my focus|focus session|timer running|show (?:my )?timer)\b/i;

const PROJECT_RECOVERY_RE =
  /\b(?:show my project|open my project|where is my project|my workshop)\b/i;

export type ActiveRecoveryKind =
  | "create"
  | "projects"
  | "client-avatars"
  | "focus"
  | "brain-dump"
  | "time-block"
  | "any";

export function isActiveWorkspaceRecoveryRequest(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (isCreateResumeRequest(t)) return true;
  if (isSavedDocumentRecoveryRequest(t)) return true;
  return ACTIVE_WORKSPACE_RE.test(t);
}

export function classifyActiveRecovery(text: string): ActiveRecoveryKind {
  const t = text.trim().toLowerCase();
  if (
    isCreateResumeRequest(t) ||
    isSavedDocumentRecoveryRequest(t) ||
    /\b(?:draft|proposal|sop|saved document|google doc|client avatar|workshop|marketing plan|sales page|funnel)\b/.test(
      t,
    )
  ) {
    return "create";
  }
  if (/\b(?:client avatar|ideal client|icp)\b/.test(t)) return "client-avatars" as ActiveRecoveryKind;
  if (FOCUS_RECOVERY_RE.test(t)) return "focus";
  if (PROJECT_RECOVERY_RE.test(t)) return "projects";
  if (/\b(?:clear my mind|brain dump)\b/.test(t)) return "brain-dump";
  if (/\b(?:time ?block|planning|calendar|schedule)\b/.test(t)) {
    return "time-block";
  }
  return "any";
}
