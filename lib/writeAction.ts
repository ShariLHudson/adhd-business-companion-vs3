/**
 * Phase 0 — Write Action Layer
 *
 * Single routing point for workspace field writes. Behavior-preserving foundation
 * before Unified ApprovalGate (Phase 1) and workspace adapters (Phases 2–5).
 *
 * Migration path:
 *   WriteAction → applyWriteAction → ApprovalGate → Adapters → UCWE
 */

import type { AppSection } from "./companionUi";
import type { WorkspaceFieldId } from "./workspaceAwareness";

export type WriteActionSource =
  | "approval"
  | "workspace-coach"
  | "avatar-coach"
  | "project-coach"
  | "sop-coach"
  | "api-fill"
  | "prefill"
  | "handoff"
  | "auto-apply";

/** Canonical write intent — all panel fills route through applyWriteAction. */
export type WriteAction = {
  workspace: string;
  target: string;
  content: string;
  source: string;
  stepId?: string;
  key?: number;
};

export type WorkspaceChatFillPayload = {
  field: WorkspaceFieldId;
  value: string;
  stepId?: string;
  key: number;
};

export type ApplyWriteActionDeps = {
  invalidateValue: (value: string, userText?: string) => boolean;
  onFill: (fill: WorkspaceChatFillPayload) => void;
};

export type WriteActionResult = {
  applied: boolean;
  reason?: "invalid-value" | "empty-content";
};

export function workspaceFillAction(
  workspace: AppSection,
  target: WorkspaceFieldId,
  content: string,
  source: WriteActionSource,
  opts?: { stepId?: string; key?: number },
): WriteAction {
  return {
    workspace,
    target,
    content,
    source,
    stepId: opts?.stepId,
    key: opts?.key,
  };
}

/**
 * Route a workspace write to the panel fill bus.
 * Returns whether the fill was applied (invalid values are dropped).
 */
export function applyWriteAction(
  action: WriteAction,
  deps: ApplyWriteActionDeps,
  opts?: { userText?: string; skipValidation?: boolean },
): WriteActionResult {
  const content = action.content ?? "";
  if (!content.trim()) {
    return { applied: false, reason: "empty-content" };
  }
  if (
    !opts?.skipValidation &&
    deps.invalidateValue(content, opts?.userText)
  ) {
    return { applied: false, reason: "invalid-value" };
  }
  deps.onFill({
    field: action.target as WorkspaceFieldId,
    value: content,
    stepId: action.stepId,
    key: action.key ?? Date.now(),
  });
  return { applied: true };
}
