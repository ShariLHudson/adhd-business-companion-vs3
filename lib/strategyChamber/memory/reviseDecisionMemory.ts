/**
 * Record evolution of a strategic decision. Never silently overwrites history.
 */

import { getStrategyWorkItem, updateStrategyWorkItem } from "../strategyWorkItemStore";
import { captureStrategicDecisionMemory } from "./captureDecisionMemory";
import {
  getStrategicDecisionMemory,
  getStrategicDecisionMemoryByWorkItem,
  updateStrategicDecisionMemory,
} from "./strategicMemoryStore";
import type { StrategicDecisionMemory, StrategicDecisionRevision } from "./types";

function nowIso(): string {
  return new Date().toISOString();
}

function newId(): string {
  return `rev_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

/**
 * Append a revision and optionally update the live Work Item direction.
 * Previous direction remains in revision history.
 */
export function reviseStrategicDecision(input: {
  memoryId?: string;
  strategyWorkItemId?: string;
  newDirection: string;
  reason: string;
  updateWorkItem?: boolean;
  relatedWorkItemId?: string;
}): StrategicDecisionMemory | null {
  const direction = input.newDirection.trim();
  const reason = input.reason.trim();
  if (!direction || !reason) return null;

  let memory = input.memoryId
    ? getStrategicDecisionMemory(input.memoryId)
    : input.strategyWorkItemId
      ? getStrategicDecisionMemoryByWorkItem(input.strategyWorkItemId)
      : null;

  // Ensure a memory shell exists when revising a confirmed work item
  if (!memory && input.strategyWorkItemId) {
    memory = captureStrategicDecisionMemory(input.strategyWorkItemId, {
      force: true,
    });
  }
  if (!memory) return null;

  const revision: StrategicDecisionRevision = {
    id: newId(),
    revisedAt: nowIso(),
    previousDirection: memory.chosenDirection?.direction,
    newDirection: direction,
    reason,
    relatedWorkItemId: input.relatedWorkItemId,
    userConfirmed: true,
  };

  const related = new Set(memory.relatedWorkItemIds ?? []);
  if (input.relatedWorkItemId) related.add(input.relatedWorkItemId);

  const updated = updateStrategicDecisionMemory(memory.id, {
    revisions: [...memory.revisions, revision],
    chosenDirection: {
      direction,
      rationale: reason,
      decidedAt: nowIso(),
      userConfirmed: true,
      notChosen: memory.chosenDirection?.notChosen,
    },
    summary: `Revised direction: ${direction} — ${reason}`,
    status: "active",
    relatedWorkItemIds: [...related],
  });

  if (input.updateWorkItem !== false) {
    const item = getStrategyWorkItem(memory.strategyWorkItemId);
    if (item) {
      updateStrategyWorkItem(item.id, {
        chosenDirection: direction,
        decisionRationale: reason,
        status: "under_review",
        decisionRecordConfirmed: true,
      });
      captureStrategicDecisionMemory(item.id, { force: true });
    }
  }

  return updated;
}

/**
 * Mark a prior decision memory superseded when a new Work Item replaces it.
 */
export function supersedeStrategicDecisionMemory(input: {
  previousMemoryId: string;
  successorWorkItemId: string;
  reason: string;
}): StrategicDecisionMemory | null {
  const previous = getStrategicDecisionMemory(input.previousMemoryId);
  if (!previous) return null;

  const revision: StrategicDecisionRevision = {
    id: newId(),
    revisedAt: nowIso(),
    previousDirection: previous.chosenDirection?.direction,
    reason: input.reason.trim() || "Continued in a new Strategy Work Item",
    relatedWorkItemId: input.successorWorkItemId,
    userConfirmed: true,
  };

  return updateStrategicDecisionMemory(previous.id, {
    status: "superseded",
    revisions: [...previous.revisions, revision],
    relatedWorkItemIds: Array.from(
      new Set([...(previous.relatedWorkItemIds ?? []), input.successorWorkItemId]),
    ),
  });
}
