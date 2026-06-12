// Founder Ecosystem — Phase 14 Approval Engine.
// Decides which automations may run on their own and which need the founder's
// explicit OK. CORE PRINCIPLE: never automate without permission. Anything that
// reaches outside the app (sends, publishes, books, creates external records,
// triggers workflows) always requires approval. Pure.

import type {
  AutomationAction,
  AutomationActionType,
  ConnectedApp,
  Tool,
  TrustLevel,
} from "./automationTypes";

// High-trust = may auto-execute (prepare-and-open). These never leave the app
// boundary in a way the founder can't immediately undo.
const HIGH_TRUST: Set<AutomationActionType> = new Set([
  "open-workspace",
  "load-project",
  "create-draft",
  "draft-email", // a DRAFT only — sending is separate + gated
  "research-topic",
  "create-google-doc",
  "update-google-doc",
  "create-google-sheet",
  "update-google-sheet",
  "create-google-form",
  "open-existing-file",
  "link-file-to-project",
  "create-internal-task",
  "generate-prompt",
  "open-claude-session",
  "send-context-package",
]);

// Approval-required = touches the outside world or is hard to undo.
const APPROVAL_REQUIRED: Set<AutomationActionType> = new Set([
  "send-email",
  "modify-calendar",
  "schedule-appointment",
  "create-external-record",
  "move-opportunity",
  "create-ghl-task",
  "create-workflow",
  "trigger-workflow",
  "publish-content",
]);

export function trustLevel(actionType: AutomationActionType): TrustLevel {
  return HIGH_TRUST.has(actionType) ? "high" : "approval-required";
}

export function requiresApproval(actionType: AutomationActionType): boolean {
  // Default-deny: anything not explicitly high-trust needs approval.
  return !HIGH_TRUST.has(actionType) || APPROVAL_REQUIRED.has(actionType);
}

/** Which connected app a tool depends on (null = internal, always available). */
export function appForTool(tool: Tool): ConnectedApp["app"] | null {
  switch (tool) {
    case "gmail":
    case "outlook":
      return "email";
    case "google-docs":
    case "google-sheets":
    case "google-forms":
      return "google";
    case "google-calendar":
      return "calendar";
    case "ghl":
    case "ghl-conversations":
    case "ghl-calendar":
      return "ghl";
    case "canva":
      return "canva";
    case "odoo-projects":
      return "odoo";
    case "claude":
      return "claude";
    default:
      return null; // internal: create, time-block, projects, research, etc.
  }
}

export function isToolConnected(tool: Tool, apps: ConnectedApp[]): boolean {
  const need = appForTool(tool);
  if (!need) return true; // internal tool
  return apps.some((a) => a.app === need && a.status === "connected");
}

/**
 * Can this action run automatically right now? Only when it's high-trust AND
 * its tool is connected. Everything else is prepared and offered for approval.
 */
export function canAutoExecute(
  action: Pick<AutomationAction, "actionType" | "tool">,
  apps: ConnectedApp[] = [],
): boolean {
  if (requiresApproval(action.actionType)) return false;
  return isToolConnected(action.tool, apps);
}

export type ApprovalDecision = {
  approvalRequired: boolean;
  trust: TrustLevel;
  autoExecutable: boolean;
  reason: string;
};

export function evaluateApproval(
  action: Pick<AutomationAction, "actionType" | "tool">,
  apps: ConnectedApp[] = [],
): ApprovalDecision {
  const trust = trustLevel(action.actionType);
  const approvalRequired = requiresApproval(action.actionType);
  const connected = isToolConnected(action.tool, apps);
  const autoExecutable = !approvalRequired && connected;
  const reason = approvalRequired
    ? "Reaches outside the app or is hard to undo — needs your OK first."
    : connected
      ? "High-trust prep step — safe to open for you."
      : `Needs ${appForTool(action.tool)} connected before it can run.`;
  return { approvalRequired, trust, autoExecutable, reason };
}

// ---- Status transitions (immutable) ------------------------------------
export function approve(action: AutomationAction): AutomationAction {
  return { ...action, status: "approved" };
}
export function reject(action: AutomationAction): AutomationAction {
  return { ...action, status: "dismissed" };
}
