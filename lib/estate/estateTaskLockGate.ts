/**
 * Estate Task Lock Gate™ — Phase 2C handleSend integration.
 *
 * Applies active task state and gates Estate room routing during deliverable tasks.
 *
 * @see docs/estate/ESTATE_TURN_ORCHESTRATION_PLAN.md
 */

import {
  applyAssistantTaskLifecycle,
  loadActiveTaskLockState,
  saveActiveTaskLockState,
  type ActiveTask,
  type ActiveTaskLockState,
} from "./activeTaskLock";
import { stripEstatePlaceMenuFromAssistantCopy } from "./estatePlaceIdentityLock";
import {
  evaluateEstateOrchestration,
  type EstateOrchestrationDecision,
} from "./estateOrchestration";
import { buildOrchestrationContext } from "./estateOrchestrationShadow";
import {
  resolveEstatePlace,
  shouldNavigateFromResolution,
} from "./resolveEstatePlace";

export type ApplyEstateTaskLockTurnInput = {
  userText: string;
  lastAssistantText?: string | null;
  priorUserText?: string | null;
  conversationTurn: number;
  informationalTurn?: boolean;
  overwhelmed?: boolean;
  inDirectEstateVisit?: boolean;
};

export type EstateTaskLockTurnResult = {
  state: ActiveTaskLockState;
  decision: EstateOrchestrationDecision["kind"];
  decisionReason: string;
  activeTask: ActiveTask | null;
  /** Block Estate room offers, menus, and workspace estate routing */
  suppressEstateRoomRouting: boolean;
  allowsExplicitEstateNavigation: boolean;
};

export function isExplicitEstateNavigationRequest(userText: string): boolean {
  const resolution = resolveEstatePlace(userText.trim());
  return shouldNavigateFromResolution(resolution);
}

/**
 * Apply one member turn — updates persisted task lock state.
 * Call once per handleSend turn before Estate routing.
 */
export function applyEstateTaskLockTurn(
  input: ApplyEstateTaskLockTurnInput,
): EstateTaskLockTurnResult {
  const priorState = loadActiveTaskLockState();
  const orchestration = evaluateEstateOrchestration(
    buildOrchestrationContext({
      userText: input.userText,
      lastAssistantText: input.lastAssistantText,
      priorUserText: input.priorUserText,
      conversationTurn: input.conversationTurn,
      taskLockState: priorState,
      overwhelmed: input.overwhelmed ?? false,
      informationalTurn: input.informationalTurn ?? false,
      inDirectEstateVisit: input.inDirectEstateVisit ?? false,
    }),
  );

  saveActiveTaskLockState(orchestration.nextTaskLockState);

  const allowsExplicitEstateNavigation = isExplicitEstateNavigationRequest(
    input.userText,
  );
  const suppressEstateRoomRouting =
    orchestration.suppressRoomRouting && !allowsExplicitEstateNavigation;

  const decision = orchestration.decision;
  const decisionReason =
    "reason" in decision ? String(decision.reason) : decision.kind;

  return {
    state: orchestration.nextTaskLockState,
    decision: decision.kind,
    decisionReason,
    activeTask: orchestration.nextTaskLockState.activeTask,
    suppressEstateRoomRouting,
    allowsExplicitEstateNavigation,
  };
}

export function shouldBlockEstateRoomRouting(
  result: Pick<EstateTaskLockTurnResult, "suppressEstateRoomRouting">,
): boolean {
  return result.suppressEstateRoomRouting;
}

export function activeTaskLockHintForChat(
  state: ActiveTaskLockState | null | undefined,
): string | null {
  const task = state?.activeTask;
  if (!task) return null;
  if (task.status === "cancelled" || task.status === "complete") return null;

  const phase =
    task.status === "ready_to_deliver"
      ? "ready to deliver"
      : task.status === "delivering"
        ? "delivering"
        : task.status === "begin"
          ? "waiting to start"
          : "in progress";

  return [
    "ACTIVE TASK LOCK (mandatory):",
    `Member has an open ${task.kind} task (${phase}): ${task.topic}.`,
    "Stay on the task. Do NOT suggest Estate rooms, numbered place menus, or opening workspaces.",
    'Never say "A few places on the Estate…" while this task is open.',
    task.status === "ready_to_deliver" || task.status === "delivering"
      ? "Deliver the prepared results now — do not change topic or suggest rooms."
      : "Answer the task, give an honest progress update, or ask one clarifying question.",
  ].join("\n");
}

/**
 * Apply assistant reply — promotes begin → working after Spark ack,
 * marks ready_to_deliver when results appear, recovers task if state was lost.
 */
export function applyAssistantTaskLockTurn(input: {
  assistantText: string;
  priorUserText?: string | null;
  conversationTurn: number;
}): ActiveTaskLockState {
  const nextState = applyAssistantTaskLifecycle({
    assistantText: input.assistantText,
    priorUserText: input.priorUserText,
    conversationTurn: input.conversationTurn,
  });
  saveActiveTaskLockState(nextState);
  return nextState;
}

export function frictionlessOffersEstateRoom(
  localReply: string | null | undefined,
): boolean {
  if (!localReply?.trim()) return false;
  return /\b(?:take (?:you|us) to|go to|open the|a few places on the estate|peaceful place|observatory|greenhouse|creative studio|momentum institute)\b/i.test(
    localReply,
  );
}

/** Strip Estate place menus from assistant copy during an active task lock. */
export function sanitizeAssistantCopyDuringActiveTask(
  assistantText: string,
): string {
  const { text, strippedMenu } =
    stripEstatePlaceMenuFromAssistantCopy(assistantText);
  if (!strippedMenu) return assistantText;
  if (text.trim()) return text;
  return "I'm still on your research — give me a moment to pull that together.";
}
