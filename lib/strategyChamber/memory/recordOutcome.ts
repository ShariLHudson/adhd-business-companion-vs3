/**
 * Record what happened after a strategic decision — without rewriting the decision.
 */

import type { StrategyContributionReturn } from "../connectionContracts";
import {
  getStrategicDecisionMemory,
  getStrategicDecisionMemoryByWorkItem,
  updateStrategicDecisionMemory,
} from "./strategicMemoryStore";
import type {
  StrategicDecisionMemory,
  StrategicOutcomeMemory,
  StrategicMemoryTruthStatus,
} from "./types";

function nowIso(): string {
  return new Date().toISOString();
}

function newId(): string {
  return `outcome_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

export function recordStrategicOutcome(input: {
  memoryId?: string;
  strategyWorkItemId?: string;
  whatHappened: string;
  truthStatus?: StrategicMemoryTruthStatus;
  userConfirmed?: boolean;
  sourceKind?: StrategicOutcomeMemory["source"]["kind"];
  sourceId?: string;
  markAwaitingReview?: boolean;
}): StrategicDecisionMemory | null {
  const note = input.whatHappened.trim();
  if (!note) return null;

  const memory = input.memoryId
    ? getStrategicDecisionMemory(input.memoryId)
    : input.strategyWorkItemId
      ? getStrategicDecisionMemoryByWorkItem(input.strategyWorkItemId)
      : null;
  if (!memory) return null;

  const outcome: StrategicOutcomeMemory = {
    id: newId(),
    whatHappened: note,
    recordedAt: nowIso(),
    truthStatus: input.truthStatus ?? "reported",
    userConfirmed: input.userConfirmed ?? true,
    source: {
      kind: input.sourceKind ?? "member_update",
      id: input.sourceId ?? memory.strategyWorkItemId,
    },
    stillRelevant: true,
  };

  return updateStrategicDecisionMemory(memory.id, {
    outcomes: [...memory.outcomes, outcome],
    status: input.markAwaitingReview ? "awaiting_review" : memory.status,
  });
}

/**
 * When another destination returns a contribution, optionally attach as an outcome.
 * Does not overwrite chosen direction.
 */
export function recordOutcomeFromContribution(
  contribution: StrategyContributionReturn,
): StrategicDecisionMemory | null {
  const note = contribution.conciseContribution.trim();
  if (!note) return null;
  return recordStrategicOutcome({
    strategyWorkItemId: contribution.strategyWorkItemId,
    whatHappened: note,
    truthStatus: "reported",
    userConfirmed: true,
    sourceKind: "contribution_return",
    sourceId:
      contribution.sourceId ||
      contribution.linkedConversationId ||
      contribution.from,
  });
}
