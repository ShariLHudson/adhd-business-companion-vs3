/**
 * Immutable turn decision store — Phase A enforcement.
 *
 * One ConversationDecision per user turn. Downstream code may annotate
 * (owner, route, action) and tighten permissions, but must not replace
 * the primary decision or loosen scenic/breathe/navigation permissions.
 */

import type {
  ConversationDecision,
  ConversationPermission,
  ConversationResponseMode,
} from "./conversationDecision";

export type TurnDecisionAnnotation = {
  routeSelected?: string;
  finalResponseOwner?: string;
  actionExecuted?: string;
  bypassDetected?: string | null;
  pendingState?: string;
};

type TurnState = {
  turnId: string;
  decision: ConversationDecision;
  annotation: TurnDecisionAnnotation;
  createdAt: number;
};

const PERMISSION_RANK: Record<ConversationPermission, number> = {
  denied: 0,
  ask_first: 1,
  allowed: 2,
};

let active: TurnState | null = null;

function cloneDecision(decision: ConversationDecision): ConversationDecision {
  return {
    ...decision,
    selectedIntelligence: [...decision.selectedIntelligence],
    arbitration: { ...decision.arbitration },
  };
}

/** Begin the turn with the once-built decision. Replaces any stale turn. */
export function beginTurnDecision(
  turnId: string,
  decision: ConversationDecision,
): ConversationDecision {
  active = {
    turnId,
    decision: cloneDecision(decision),
    annotation: {},
    createdAt: Date.now(),
  };
  return active.decision;
}

export function getActiveTurnDecision(): ConversationDecision | null {
  return active?.decision ?? null;
}

export function getActiveTurnId(): string | null {
  return active?.turnId ?? null;
}

export function getTurnAnnotation(): TurnDecisionAnnotation | null {
  return active ? { ...active.annotation } : null;
}

/**
 * Annotate runtime metadata. Permissions / responseMode are not changed here
 * except finalResponseOwner (bookkeeping).
 */
export function annotateTurnDecision(patch: TurnDecisionAnnotation): void {
  if (!active) return;
  active.annotation = { ...active.annotation, ...patch };
  if (patch.finalResponseOwner != null) {
    active.decision = {
      ...active.decision,
      finalResponseOwner: patch.finalResponseOwner,
    };
  }
}

type RestrictablePermission =
  | "scenicMenuPermission"
  | "breatheAutoOpenPermission"
  | "navigationPermission"
  | "kernelPlaceMenuPermission"
  | "creationPermission"
  | "actionPermission";

/** Permissions may only become more restrictive. */
export function restrictTurnPermission(
  key: RestrictablePermission,
  next: ConversationPermission,
): boolean {
  if (!active) return false;
  const current = active.decision[key];
  if (PERMISSION_RANK[next] >= PERMISSION_RANK[current]) {
    return false;
  }
  active.decision = { ...active.decision, [key]: next };
  return true;
}

/** responseMode is immutable once the turn begins — only annotate owner/route. */
export function getTurnResponseMode(): ConversationResponseMode | null {
  return active?.decision.responseMode ?? null;
}

export function turnAllowsScenicMenu(): boolean {
  const d = getActiveTurnDecision();
  if (!d) return true;
  return d.scenicMenuPermission === "allowed";
}

export function turnAllowsBreatheAutoOpen(): boolean {
  const d = getActiveTurnDecision();
  if (!d) return true;
  return d.breatheAutoOpenPermission === "allowed";
}

export function turnAllowsNavigation(): boolean {
  const d = getActiveTurnDecision();
  if (!d) return true;
  return d.navigationPermission !== "denied";
}

export function endTurnDecision(): void {
  active = null;
}

/** Structured metadata for dev/test logging (no chain-of-thought). */
export function buildTurnDecisionLogRecord(): Record<string, unknown> | null {
  if (!active) return null;
  const d = active.decision;
  const a = active.annotation;
  return {
    turnId: active.turnId,
    primaryIntent: d.primaryIntent,
    activeWorkflow: d.arbitration.sessionLocked
      ? d.arbitration.goal
      : null,
    pendingState: a.pendingState ?? null,
    emotionalCondition: d.emotionalCondition,
    responseMode: d.responseMode,
    scenicPermission: d.scenicMenuPermission,
    breathingPermission: d.breatheAutoOpenPermission,
    navigationPermission: d.navigationPermission,
    intelligenceHints: d.selectedIntelligence,
    routeSelected: a.routeSelected ?? null,
    finalResponseOwner: a.finalResponseOwner ?? d.finalResponseOwner ?? null,
    actionExecuted: a.actionExecuted ?? null,
    bypassDetected: a.bypassDetected ?? null,
  };
}
