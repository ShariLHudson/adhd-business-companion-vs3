/**
 * Estate Orchestration Shadow — Phase 2A observe/log only.
 *
 * Compares orchestrator decisions with legacy matcher signals. No handleSend wiring.
 *
 * @see docs/estate/ESTATE_TURN_ORCHESTRATION_PLAN.md
 */

import { matchEstateCapabilities } from "@/lib/estateIntelligence/estateMatcher";

import {
  createActiveTaskLockState,
  type ActiveTaskLockState,
} from "./activeTaskLock";
import {
  evaluateEstateOrchestration,
  orchestrationWouldRouteToPlace,
  type EstateOrchestrationContext,
  type EstateOrchestrationDecision,
  type EstateOrchestrationResult,
} from "./estateOrchestration";
import {
  resolveEstatePlace,
  shouldNavigateFromResolution,
} from "./resolveEstatePlace";
import { evaluateEstateTurn } from "./estateTurn";

export type EstateOrchestrationShadowLogEntry = {
  loggedAt: number;
  conversationTurn: number;
  /** Truncated — never full transcript */
  userTextPreview: string;
  shadowDecision: EstateOrchestrationDecision["kind"];
  shadowReason: string;
  legacyMatcherEntryId: string | null;
  legacyMatcherReason: string | null;
  legacyWouldRoute: boolean;
  suppressRoomRouting: boolean;
  hijackRisk: boolean;
  routingMismatch: boolean;
  runtimeLabel?: string;
};

const MAX_SHADOW_LOG_ENTRIES = 100;
const shadowLog: EstateOrchestrationShadowLogEntry[] = [];

export type EstateOrchestrationShadowResult = {
  orchestration: EstateOrchestrationResult;
  legacyMatcherTop: {
    entryId: string;
    reason: string;
    confidence: string;
  } | null;
  wouldLegacyOfferRoom: boolean;
  legacyWouldRoute: boolean;
  hijackRisk: boolean;
  routingMismatch: boolean;
};

const USER_TEXT_PREVIEW_MAX = 48;

export function previewUserTextForShadowLog(userText: string): string {
  const trimmed = userText.trim().replace(/\s+/g, " ");
  if (trimmed.length <= USER_TEXT_PREVIEW_MAX) return trimmed;
  return `${trimmed.slice(0, USER_TEXT_PREVIEW_MAX - 1)}…`;
}

function detectLegacyWouldRoute(input: {
  userText: string;
  overwhelmed: boolean;
}): {
  wouldLegacyOfferRoom: boolean;
  legacyMatcherTop: EstateOrchestrationShadowResult["legacyMatcherTop"];
  legacyWouldRoute: boolean;
} {
  const matches = matchEstateCapabilities({
    userText: input.userText,
    overwhelmed: input.overwhelmed,
  });
  const top = matches[0] ?? null;
  const legacyMatcherTop = top
    ? {
        entryId: top.entry.id,
        reason: top.reasons.join("; ") || top.entry.id,
        confidence: top.confidence,
      }
    : null;

  const wouldLegacyOfferRoom = Boolean(
    top && (top.confidence === "high" || top.confidence === "medium"),
  );

  const placeResolution = resolveEstatePlace(input.userText);
  const legacyPlaceNavigate = shouldNavigateFromResolution(placeResolution);
  const legacyPlaceSuggest = placeResolution.kind === "suggestion";

  const needTurn = evaluateEstateTurn(input.userText);
  const legacyNeedOffer =
    needTurn.mode === "invite" ||
    (needTurn.mode === "suggest" && needTurn.placeIds.length > 0);

  const legacyWouldRoute =
    wouldLegacyOfferRoom || legacyPlaceNavigate || legacyPlaceSuggest || legacyNeedOffer;

  return { wouldLegacyOfferRoom, legacyMatcherTop, legacyWouldRoute };
}

export function evaluateEstateOrchestrationShadow(
  context: EstateOrchestrationContext,
  runtimeLabel?: string,
): EstateOrchestrationShadowResult {
  const orchestration = evaluateEstateOrchestration(context);

  const { wouldLegacyOfferRoom, legacyMatcherTop, legacyWouldRoute } =
    detectLegacyWouldRoute({
      userText: context.userText,
      overwhelmed: context.overwhelmed,
    });

  const shadowRoutes = orchestrationWouldRouteToPlace(orchestration.decision);
  const shadowProtectsTask =
    orchestration.decision.kind === "continue_task" ||
    orchestration.decision.kind === "begin_task" ||
    (orchestration.decision.kind === "stay_conversation" &&
      orchestration.decision.suppressRouting);

  const hijackRisk =
    wouldLegacyOfferRoom && shadowProtectsTask && !shadowRoutes;

  const routingMismatch = legacyWouldRoute && shadowProtectsTask && !shadowRoutes;

  const entry: EstateOrchestrationShadowLogEntry = {
    loggedAt: Date.now(),
    conversationTurn: context.conversationTurn,
    userTextPreview: previewUserTextForShadowLog(context.userText),
    shadowDecision: orchestration.decision.kind,
    shadowReason: String(orchestration.decision.reason),
    legacyMatcherEntryId: legacyMatcherTop?.entryId ?? null,
    legacyMatcherReason: legacyMatcherTop?.reason ?? null,
    legacyWouldRoute,
    suppressRoomRouting: orchestration.suppressRoomRouting,
    hijackRisk,
    routingMismatch,
    runtimeLabel,
  };

  appendShadowLog(entry);

  return {
    orchestration,
    legacyMatcherTop,
    wouldLegacyOfferRoom,
    legacyWouldRoute,
    hijackRisk,
    routingMismatch,
  };
}

export function buildOrchestrationContext(input: {
  userText: string;
  lastAssistantText?: string | null;
  priorUserText?: string | null;
  conversationTurn?: number;
  taskLockState?: ActiveTaskLockState;
  overwhelmed?: boolean;
  pendingEstateInvitation?: boolean;
  inDirectEstateVisit?: boolean;
  informationalTurn?: boolean;
  currentPlaceId?: string | null;
  workspacePanel?: string | null;
}): EstateOrchestrationContext {
  const taskLockState = input.taskLockState ?? createActiveTaskLockState();
  return {
    userText: input.userText,
    lastAssistantText: input.lastAssistantText ?? null,
    priorUserText: input.priorUserText ?? null,
    conversationTurn: input.conversationTurn ?? 1,
    currentPlaceId: input.currentPlaceId ?? null,
    workspacePanel: input.workspacePanel ?? null,
    overwhelmed: input.overwhelmed ?? false,
    activeTask: taskLockState.activeTask,
    taskLockState,
    pendingEstateInvitation: input.pendingEstateInvitation ?? false,
    inDirectEstateVisit: input.inDirectEstateVisit ?? false,
    informationalTurn: input.informationalTurn ?? false,
  };
}

export function getOrchestrationShadowLog(): readonly EstateOrchestrationShadowLogEntry[] {
  return [...shadowLog];
}

export function clearOrchestrationShadowLog(): void {
  shadowLog.length = 0;
}

export function getLastOrchestrationShadowLogEntry():
  | EstateOrchestrationShadowLogEntry
  | undefined {
  return shadowLog[shadowLog.length - 1];
}

function appendShadowLog(entry: EstateOrchestrationShadowLogEntry): void {
  shadowLog.push(entry);
  if (shadowLog.length > MAX_SHADOW_LOG_ENTRIES) {
    shadowLog.shift();
  }
}
