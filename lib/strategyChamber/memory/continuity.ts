/**
 * Continuity helpers — help the member return to a decision journey
 * without replaying the whole conversation or treating memory as fact.
 */

import { getStrategyWorkItem, resumeStrategyWorkItem } from "../strategyWorkItemStore";
import {
  getStrategicDecisionMemory,
  getStrategicDecisionMemoryByWorkItem,
  listMemoriesAwaitingReview,
  listStrategicDecisionMemories,
} from "./strategicMemoryStore";
import type { StrategicDecisionMemory, StrategicMemoryEntry } from "./types";

export type StrategicContinuityBrief = {
  memoryId: string;
  strategyWorkItemId: string;
  title: string;
  strategicQuestion: string;
  chosenDirection?: string;
  why?: string;
  openAssumptions: string[];
  openUnknowns: string[];
  latestOutcome?: string;
  nextReviewDate?: string | null;
  /** Warm Shari-facing orientation — not a system dump. */
  memberFacingResume: string;
  /** Explicit: remembered context may have changed. */
  epistemicCaution: string;
};

function relevantContents(entries: StrategicMemoryEntry[], limit = 3): string[] {
  return entries
    .filter((e) => e.stillRelevant && e.truthStatus !== "outdated")
    .map((e) => e.content)
    .filter(Boolean)
    .slice(0, limit);
}

export function buildStrategicContinuityBrief(
  memory: StrategicDecisionMemory,
): StrategicContinuityBrief {
  const openAssumptions = relevantContents(memory.assumptionsAtDecisionTime);
  const openUnknowns = relevantContents(memory.unknownsAtDecisionTime);
  const latestOutcome = memory.outcomes[memory.outcomes.length - 1]?.whatHappened;

  const direction = memory.chosenDirection?.direction;
  const why = memory.chosenDirection?.rationale;

  const lines = [
    `You were deciding: ${memory.strategicQuestion}`,
    direction ? `You chose: ${direction}` : null,
    why ? `At the time, because: ${why}` : null,
    latestOutcome ? `Since then: ${latestOutcome}` : null,
    openAssumptions[0]
      ? `An assumption still worth checking: ${openAssumptions[0]}`
      : null,
  ].filter(Boolean);

  return {
    memoryId: memory.id,
    strategyWorkItemId: memory.strategyWorkItemId,
    title: memory.title,
    strategicQuestion: memory.strategicQuestion,
    chosenDirection: direction,
    why,
    openAssumptions,
    openUnknowns,
    latestOutcome,
    nextReviewDate: memory.nextReviewDate,
    memberFacingResume: lines.join(" "),
    epistemicCaution:
      "This is what we recorded at the time — some of it may have changed, and assumptions are not facts.",
  };
}

export function getContinuityBriefForWorkItem(
  strategyWorkItemId: string,
): StrategicContinuityBrief | null {
  const memory = getStrategicDecisionMemoryByWorkItem(strategyWorkItemId);
  return memory ? buildStrategicContinuityBrief(memory) : null;
}

export function listDecisionJourneysForResume(): StrategicContinuityBrief[] {
  return listStrategicDecisionMemories()
    .filter((m) => m.status !== "archived" && m.status !== "superseded")
    .slice(0, 8)
    .map(buildStrategicContinuityBrief);
}

export function listDecisionReviewsDue(): StrategicContinuityBrief[] {
  return listMemoriesAwaitingReview().map(buildStrategicContinuityBrief);
}

/**
 * Resume the Work Item behind a memory — Strategy Work Item stays source of truth.
 */
export function resumeDecisionJourney(
  memoryId: string,
): { workItemId: string; brief: StrategicContinuityBrief } | null {
  const memory = getStrategicDecisionMemory(memoryId);
  if (!memory) return null;
  const item = getStrategyWorkItem(memory.strategyWorkItemId);
  if (!item) return null;
  resumeStrategyWorkItem(item.id);
  return {
    workItemId: item.id,
    brief: buildStrategicContinuityBrief(memory),
  };
}

/**
 * Guard: assumptions in memory must never be presented as confirmed facts.
 */
export function assumptionsAreNotFacts(memory: StrategicDecisionMemory): boolean {
  return memory.assumptionsAtDecisionTime.every(
    (a) => a.truthStatus === "assumed" || a.truthStatus === "unknown",
  );
}
