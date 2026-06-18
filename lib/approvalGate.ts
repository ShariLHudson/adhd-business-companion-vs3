/**
 * Phase 1 — Unified ApprovalGate (next consolidation target)
 *
 * Today approval resolves in two places:
 *   1. page.tsx early intercept (~handleSend)
 *   2. resolveWorkspaceCoachTurn (workspaceAwareness.ts)
 *
 * Goal: single resolveApproval() call site; avatar/create paths delegate here.
 * Do not remove duplicate paths until tests cover all seven content types.
 */

export {
  tryResolveWorkspaceApprovalTurn as resolveApproval,
  type WorkspaceApprovalResult as ApprovalResult,
  type WorkspaceApprovalFill as ApprovalFill,
} from "./workspaceApprovalSync";
