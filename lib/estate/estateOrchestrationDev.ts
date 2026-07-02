/**
 * Estate Orchestration Dev™ — Phase 2B shadow observe (development only).
 *
 * Wired from handleSend. No member-visible behavior change.
 *
 * @see docs/estate/ESTATE_TURN_ORCHESTRATION_PLAN.md
 */

import {
  buildOrchestrationContext,
  clearOrchestrationShadowLog,
  evaluateEstateOrchestrationShadow,
  getLastOrchestrationShadowLogEntry,
  getOrchestrationShadowLog,
  type EstateOrchestrationShadowLogEntry,
  type EstateOrchestrationShadowResult,
} from "./estateOrchestrationShadow";
import { loadActiveTaskLockState } from "./activeTaskLock";

export type ObserveEstateOrchestrationShadowInput = {
  userText: string;
  lastAssistantText?: string | null;
  priorUserText?: string | null;
  conversationTurn: number;
  currentPlaceId?: string | null;
  workspacePanel?: string | null;
  overwhelmed?: boolean;
  informationalTurn?: boolean;
  inDirectEstateVisit?: boolean;
  pendingEstateInvitation?: boolean;
};

export type EstateOrchestrationShadowMetrics = {
  observedTurns: number;
  routingMismatches: number;
  hijackRisks: number;
  lastEntry: EstateOrchestrationShadowLogEntry | null;
};

function isDevEnvironment(): boolean {
  return (
    typeof process !== "undefined" && process.env.NODE_ENV === "development"
  );
}

let observedTurns = 0;
let routingMismatches = 0;
let hijackRisks = 0;

export function isEstateOrchestrationShadowDevEnabled(): boolean {
  return isDevEnvironment();
}

export function resetEstateOrchestrationShadowDevState(): void {
  observedTurns = 0;
  routingMismatches = 0;
  hijackRisks = 0;
  clearOrchestrationShadowLog();
}

export function getEstateOrchestrationShadowMetrics(): EstateOrchestrationShadowMetrics {
  return {
    observedTurns,
    routingMismatches,
    hijackRisks,
    lastEntry: getLastOrchestrationShadowLogEntry() ?? null,
  };
}

/**
 * Observe one handleSend turn — dev only. Updates shadow task state for multi-turn mismatch tracking.
 * Does not affect legacy routing or member-visible behavior.
 */
export function observeEstateOrchestrationShadowTurn(
  input: ObserveEstateOrchestrationShadowInput,
): EstateOrchestrationShadowResult | null {
  if (!isDevEnvironment()) return null;

  const shadow = evaluateEstateOrchestrationShadow(
    buildOrchestrationContext({
      userText: input.userText,
      lastAssistantText: input.lastAssistantText,
      priorUserText: input.priorUserText,
      conversationTurn: input.conversationTurn,
      currentPlaceId: input.currentPlaceId ?? null,
      workspacePanel: input.workspacePanel ?? null,
      overwhelmed: input.overwhelmed ?? false,
      informationalTurn: input.informationalTurn ?? false,
      inDirectEstateVisit: input.inDirectEstateVisit ?? false,
      pendingEstateInvitation: input.pendingEstateInvitation ?? false,
      taskLockState: loadActiveTaskLockState(),
    }),
    "handleSend",
  );

  observedTurns += 1;
  if (shadow.routingMismatch) routingMismatches += 1;
  if (shadow.hijackRisk) hijackRisks += 1;

  if (shadow.routingMismatch || shadow.hijackRisk) {
    // eslint-disable-next-line no-console
    console.info("[estate-orchestration-shadow] routing mismatch", {
      turn: input.conversationTurn,
      preview: shadow.orchestration.decision.kind,
      legacy: shadow.legacyMatcherTop?.entryId ?? "place-suggest",
      shadowReason: shadow.orchestration.decision.reason,
      suppressRoomRouting: shadow.orchestration.suppressRoomRouting,
      routingMismatch: shadow.routingMismatch,
      hijackRisk: shadow.hijackRisk,
    });
  }

  return shadow;
}

/** Dev-only global for founder QA — not exposed in production. */
export function exposeEstateOrchestrationShadowToWindow(): void {
  if (typeof window === "undefined" || !isDevEnvironment()) return;

  const api = {
    getLog: () => getOrchestrationShadowLog(),
    getLast: () => getLastOrchestrationShadowLogEntry(),
    getMetrics: () => getEstateOrchestrationShadowMetrics(),
    clear: () => resetEstateOrchestrationShadowDevState(),
  };

  (
    window as unknown as {
      __sparkEstateOrchestrationShadow?: typeof api;
    }
  ).__sparkEstateOrchestrationShadow = api;
}
