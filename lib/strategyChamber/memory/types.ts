/**
 * Phase 6 — Strategic Memory & Decision Intelligence contracts.
 * Remembers decision reasoning and evolution. Does not replace Strategy Work Item
 * or Decision Record. Never promotes remembered text to permanent fact.
 */

import type { StrategyTypeId } from "../intelligence/types";
import type { ContinueJourneyDestinationId } from "../types";

export type StrategicMemoryStatus =
  | "active"
  | "awaiting_review"
  | "resolved"
  | "superseded"
  | "archived";

export type StrategicMemoryEntryType =
  | "decision"
  | "assumption"
  | "evidence"
  | "constraint"
  | "tradeoff"
  | "risk"
  | "experiment"
  | "review_trigger"
  | "outcome"
  | "revision"
  | "lesson"
  | "context"
  | "unknown";

export type StrategicMemoryConfidence = "low" | "moderate" | "high";

/**
 * Epistemic status — remembered ≠ true.
 * Assumed / interpreted / observed must not silently become confirmed.
 */
export type StrategicMemoryTruthStatus =
  | "confirmed"
  | "reported"
  | "observed"
  | "interpreted"
  | "assumed"
  | "unknown"
  | "disputed"
  | "outdated";

export type StrategicMemorySourceKind =
  | "strategy_work_item"
  | "decision_record"
  | "member_statement"
  | "companion_synthesis"
  | "domain_pack"
  | "contribution_return"
  | "connection"
  | "experiment"
  | "evidence"
  | "calendar"
  | "project"
  | "member_update";

export type StrategicSourceReference = {
  kind: StrategicMemorySourceKind;
  id: string;
  label?: string;
};

export type StrategicMemoryEntry = {
  id: string;
  entryType: StrategicMemoryEntryType;
  content: string;
  recordedAt: string;
  confidence: StrategicMemoryConfidence;
  truthStatus: StrategicMemoryTruthStatus;
  userConfirmed: boolean;
  source: StrategicSourceReference;
  /** Defaults true; set false when superseded or explicitly outdated. */
  stillRelevant: boolean;
  changedAt?: string;
  supersededByEntryId?: string;
};

export type StrategicOptionMemory = {
  id: string;
  title: string;
  whyItMayFit?: string;
  selected: boolean;
  /** Link back to Work Item option id when available. */
  sourceOptionId?: string;
};

export type StrategicChosenDirection = {
  direction: string;
  rationale?: string;
  decidedAt: string;
  userConfirmed: boolean;
  notChosen?: string[];
};

/** Snapshot of companion recommendation — never a confirmed decision. */
export type StrategicRecommendationMemory = {
  summary: string;
  recordedAt: string;
  isDecision: false;
};

export type StrategicExperimentMemory = {
  id: string;
  summary: string;
  assumptionBeingTested?: string;
  status: "planned" | "in_progress" | "reviewed" | "abandoned";
  recordedAt: string;
  truthStatus: StrategicMemoryTruthStatus;
  userConfirmed: boolean;
  source: StrategicSourceReference;
};

export type StrategicReviewTriggerMemory = {
  id: string;
  trigger: string;
  nextReviewDate?: string | null;
  active: boolean;
  recordedAt: string;
  source: StrategicSourceReference;
};

export type StrategicOutcomeMemory = {
  id: string;
  whatHappened: string;
  recordedAt: string;
  truthStatus: StrategicMemoryTruthStatus;
  userConfirmed: boolean;
  source: StrategicSourceReference;
  stillRelevant: boolean;
};

export type StrategicDecisionRevision = {
  id: string;
  revisedAt: string;
  previousDirection?: string;
  newDirection?: string;
  reason: string;
  /** When a new Work Item continues the same decision journey. */
  relatedWorkItemId?: string;
  userConfirmed: boolean;
};

/**
 * Durable continuity record for one strategic decision journey.
 * Work Item remains live source of truth; Memory holds confirmed reasoning + evolution.
 */
export type StrategicDecisionMemory = {
  id: string;
  strategyWorkItemId: string;
  /** Soft link — Decision Record is a view, not a stored entity. */
  decisionRecordId?: string;
  title: string;
  strategicQuestion: string;
  summary: string;
  primaryDomainId?: StrategyTypeId | string;
  secondaryDomainId?: StrategyTypeId | string;
  status: StrategicMemoryStatus;
  confidence: StrategicMemoryConfidence;
  createdAt: string;
  updatedAt: string;
  decisionDate?: string;
  nextReviewDate?: string | null;
  goalAtDecisionTime?: string;
  knownContextAtDecisionTime: StrategicMemoryEntry[];
  assumptionsAtDecisionTime: StrategicMemoryEntry[];
  constraintsAtDecisionTime: StrategicMemoryEntry[];
  unknownsAtDecisionTime: StrategicMemoryEntry[];
  optionsConsidered: StrategicOptionMemory[];
  chosenDirection?: StrategicChosenDirection;
  recommendationAtDecisionTime?: StrategicRecommendationMemory;
  tradeoffsAccepted: StrategicMemoryEntry[];
  risksAccepted: StrategicMemoryEntry[];
  experiments: StrategicExperimentMemory[];
  reviewTriggers: StrategicReviewTriggerMemory[];
  outcomes: StrategicOutcomeMemory[];
  revisions: StrategicDecisionRevision[];
  sourceReferences: StrategicSourceReference[];
  relatedWorkItemIds?: string[];
  relatedDecisionMemoryIds?: string[];
  recommendedNextDestination?: ContinueJourneyDestinationId | string | null;
  version: string;
};

export const STRATEGIC_MEMORY_MODEL_VERSION = "1";
