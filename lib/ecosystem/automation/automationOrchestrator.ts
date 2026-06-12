// Founder Ecosystem — Phase 14 Automation Orchestrator.
// The top of the chain: Memory → Intelligence → Recommendation → Action →
// AUTOMATION. Takes an intent, routes it to the right tool, packages context,
// evaluates approval, and produces an AutomationAction + a ready action card.
// CORE PRINCIPLE: never execute an approval-required action automatically. Pure.

import type { FounderEvent, ID } from "../events";
import { routeAutomation } from "./automationRouter";
import { evaluateApproval } from "./approvalEngine";
import { buildContextPackage } from "./contextPackager";
import { defaultConnectedApps } from "./connectedAppsManager";
import type {
  AutomationAction,
  AutomationButton,
  AutomationRoute,
  ConnectedApp,
  ContextPackage,
} from "./automationTypes";

let seq = 0;
const aid = () => `auto:${++seq}`;

export type OrchestrateContext = {
  events?: FounderEvent[];
  founderId?: ID;
  apps?: ConnectedApp[];
  projectId?: ID;
  documentId?: ID;
  now?: Date;
  /** When true, build the context package (needs events). */
  withContext?: boolean;
};

export type OrchestrationResult = {
  action: AutomationAction;
  route: AutomationRoute;
  contextPackage: ContextPackage | null;
  approvalRequired: boolean;
  autoExecutable: boolean;
  reason: string;
};

function buttonsFor(approvalRequired: boolean, opensBesideChat: boolean): AutomationButton[] {
  const buttons: AutomationButton[] = [];
  if (opensBesideChat) buttons.push("open");
  if (approvalRequired) buttons.push("approve");
  buttons.push("later", "dismiss");
  return buttons;
}

/** Orchestrate a single founder intent into a prepared, gated automation. */
export function orchestrateIntent(
  text: string,
  ctx: OrchestrateContext = {},
): OrchestrationResult {
  const now = ctx.now ?? new Date();
  const apps = ctx.apps ?? defaultConnectedApps(now);
  const route = routeAutomation(text);

  const approval = evaluateApproval({ actionType: route.actionType, tool: route.tool }, apps);

  let contextPackage: ContextPackage | null = null;
  if (ctx.withContext && ctx.events && ctx.founderId) {
    contextPackage = buildContextPackage(
      ctx.events,
      ctx.founderId,
      { projectId: ctx.projectId, documentId: ctx.documentId },
      now,
    );
  }

  const action: AutomationAction = {
    id: aid(),
    title: route.title,
    description: route.description,
    emoji: route.emoji,
    tool: route.tool,
    toolCategory: route.toolCategory,
    actionType: route.actionType,
    approvalRequired: approval.approvalRequired,
    // Prepared but never auto-run when approval is required.
    status: approval.approvalRequired ? "pending-approval" : "suggested",
    buttons: buttonsFor(approval.approvalRequired, route.opensBesideChat),
    opensBesideChat: route.opensBesideChat,
    project: ctx.projectId ? { id: ctx.projectId } : undefined,
    document: ctx.documentId ? { id: ctx.documentId } : undefined,
    contextPackageId: contextPackage?.id,
    dataNeeded: route.dataNeeded,
    createdAt: now.toISOString(),
  };

  return {
    action,
    route,
    contextPackage,
    approvalRequired: approval.approvalRequired,
    autoExecutable: approval.autoExecutable,
    reason: approval.reason,
  };
}

/** Orchestrate several intents (e.g. items captured in Clear My Mind). */
export function orchestrateMany(
  texts: string[],
  ctx: OrchestrateContext = {},
): OrchestrationResult[] {
  return texts.map((t) => orchestrateIntent(t, ctx));
}

/**
 * Confirm an approval-required action AFTER the founder says yes. Returns the
 * action moved to "approved" — the host then runs it via its tool handlers.
 */
export function confirmApproval(action: AutomationAction): AutomationAction {
  if (!action.approvalRequired) return action;
  return { ...action, status: "approved" };
}

/** A compact action-card view-model for the workspace. */
export type AutomationCard = {
  id: ID;
  emoji: string;
  title: string;
  description: string;
  tool: string;
  approvalRequired: boolean;
  buttons: AutomationButton[];
  dataNeeded: string[];
};

export function toAutomationCard(action: AutomationAction): AutomationCard {
  return {
    id: action.id,
    emoji: action.emoji,
    title: action.title,
    description: action.description,
    tool: action.tool,
    approvalRequired: action.approvalRequired,
    buttons: action.buttons,
    dataNeeded: action.dataNeeded,
  };
}
