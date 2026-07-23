/**
 * Typed handoff contracts — Strategy Chamber owns the decision record.
 * Destinations contribute; they must not create a second strategy work item.
 */

import type {
  StrategyConnectionEntityType,
  StrategyWorkItem,
} from "./types";

export type StrategyHandoffApproval = {
  /** Required before mutating another destination */
  memberApproved: boolean;
};

export type ChamberStrategyBrief = {
  strategyWorkItemId: string;
  title: string;
  currentQuestion: string;
  currentStage: StrategyWorkItem["currentStage"];
  relevantFacts: string[];
  assumptions: string[];
  optionsBeingConsidered: string[];
  constraints: string[];
  guidanceRequested: string;
};

export type BoardStrategyBriefing = {
  strategyWorkItemId: string;
  decision: string;
  whyItMatters: string;
  options: string[];
  relevantFacts: string[];
  assumptions: string[];
  constraints: string[];
  risks: string[];
  desiredOutcome: string;
  decisionDeadline?: string | null;
  questionsForBoard: string[];
};

export type TalkItOutStrategyContext = {
  strategyWorkItemId: string;
  plainLanguageSummary: string;
  /** Soft context — no formal strategy jargon forced */
  whatFeelsTangled?: string;
};

export type CreateStrategyHandoff = {
  strategyWorkItemId: string;
  suggestedArtifact: string;
  decisionSummary: string;
  guardrails: string[];
};

export type ProjectStrategyHandoff = {
  strategyWorkItemId: string;
  chosenDirection: string;
  strategicPriorities: string[];
  guardrails: string[];
  risks: string[];
  measures: string[];
  assumptionsToTest: string[];
  recommendedWorkstreams: string[];
  reviewDate?: string | null;
};

export type ExecutionManagerHandoff = {
  strategyWorkItemId: string;
  chosenDirection: string;
  milestonesHint: string[];
  risks: string[];
};

export type CalendarStrategyHandoff = {
  strategyWorkItemId: string;
  eventKind:
    | "decision_deadline"
    | "review"
    | "experiment"
    | "checkpoint"
    | "board_session"
    | "planning";
  suggestedLabel: string;
  suggestedDate?: string | null;
};

export type PlanMyDayStrategyHandoff = {
  strategyWorkItemId: string;
  /** At most a small set — never the whole plan */
  nextActions: string[];
};

export type RhythmReminderHandoff = {
  strategyWorkItemId: string;
  kind: "rhythm" | "reminder";
  label: string;
  cadenceHint?: string;
};

export type JournalEvidenceHandoff = {
  strategyWorkItemId: string;
  kind: "journal" | "evidence";
  summary: string;
};

export type BusinessEstateProposedUpdate = {
  strategyWorkItemId: string;
  fieldHints: string[];
  proposedSummary: string;
  /** Always false until member confirms */
  applyWithoutApproval: false;
};

export type CelebrationHandoff = {
  strategyWorkItemId: string;
  winSummary: string;
  optional: true;
};

export type StrategyContributionReturn = {
  strategyWorkItemId: string;
  from: StrategyConnectionEntityType;
  sourceId: string;
  conciseContribution: string;
  /** Full conversation stays in the source destination */
  linkedConversationId?: string;
};

export function buildChamberBrief(
  item: StrategyWorkItem,
  guidanceRequested: string,
): ChamberStrategyBrief {
  return {
    strategyWorkItemId: item.id,
    title: item.title,
    currentQuestion: item.decisionStatement || item.title,
    currentStage: item.currentStage,
    relevantFacts: item.knownFacts ?? [],
    assumptions: item.assumptions ?? [],
    optionsBeingConsidered: (item.optionsConsidered ?? []).map((o) => o.title),
    constraints: item.constraints ?? [],
    guidanceRequested,
  };
}

export function buildBoardBriefing(
  item: StrategyWorkItem,
  questionsForBoard: string[] = [],
): BoardStrategyBriefing {
  return {
    strategyWorkItemId: item.id,
    decision: item.decisionStatement || item.title,
    whyItMatters: item.plainLanguageSummary,
    options: (item.optionsConsidered ?? []).map((o) => o.title),
    relevantFacts: item.knownFacts ?? [],
    assumptions: item.assumptions ?? [],
    constraints: item.constraints ?? [],
    risks: item.risks ?? [],
    desiredOutcome: item.desiredDirection || item.chosenDirection || "",
    decisionDeadline: item.reviewDate,
    questionsForBoard:
      questionsForBoard.length > 0
        ? questionsForBoard
        : ["What are we missing?", "What would you watch?"],
  };
}

export function buildProjectHandoff(item: StrategyWorkItem): ProjectStrategyHandoff {
  return {
    strategyWorkItemId: item.id,
    chosenDirection: item.chosenDirection || item.desiredDirection || item.title,
    strategicPriorities: item.decisionCriteria ?? [],
    guardrails: item.guardrails ?? [],
    risks: item.risks ?? [],
    measures: item.successSignals ?? [],
    assumptionsToTest: item.assumptions ?? [],
    recommendedWorkstreams: [],
    reviewDate: item.reviewDate,
  };
}

export function assertApproved(approval: StrategyHandoffApproval): void {
  if (!approval.memberApproved) {
    throw new Error(
      "Strategy Chamber requires member approval before updating another destination.",
    );
  }
}

/** Destinations that must never mint a second strategy_work_item */
export const STRATEGY_RECORD_OWNER = "strategy_chamber" as const;
