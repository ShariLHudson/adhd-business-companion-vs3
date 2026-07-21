/**
 * 051 — Universal Creation Engine types (Phase 1 skeleton).
 * Adapts domain records (Event Record, Canonical Work) — does not duplicate them.
 */

import type { ChamberMemberId } from "@/lib/chamber/chamberMemberRegistry";
import type { CreateBlueprint } from "@/lib/platformIntent/types";
import type { EventAssetRecommendation } from "@/lib/eventsIntelligence/eventAssetRegistry/types";
import type { EventRecord } from "@/lib/eventsIntelligence/types";

/** Extended creation intents beyond 045 core five */
export type UniversalCreationIntent =
  | "know"
  | "decide"
  | "create"
  | "improve"
  | "continue"
  | "organize"
  | "plan"
  | "review"
  | "compare"
  | "adapt"
  | "complete"
  | "archive"
  | "reuse";

export type CreationAudience = {
  label: string;
  role: "primary" | "secondary" | "other";
};

export type CreationConstraint = {
  kind: string;
  value: string;
};

export type CreationKnownFact = {
  field: string;
  value: string;
};

export type CreationDecision = {
  id: string;
  prompt: string;
  resolved: boolean;
  value?: string;
};

export type CreationAssetSummary = {
  assetTypeId: string;
  label: string;
  status: string;
  instanceId?: string;
};

export type CreationTaskSummary = {
  id: string;
  title: string;
  done: boolean;
};

export type CreationMilestoneSummary = {
  id: string;
  title: string;
  done: boolean;
};

export type CreationContributorContext = {
  chamberMemberId: ChamberMemberId;
  role: "owner" | "contributor";
};

export type BoardAdviceSummary = {
  advisorId: string;
  note: string;
};

export type CreationReadinessSummary = {
  overallPercent: number;
  byArea: Record<string, number>;
};

export type CreationRelationshipSummary = {
  edgeCount: number;
  assetCardCount: number;
};

export type CreationReturnState = {
  workspaceKind: string | null;
  phase: string | null;
  sectionId: string | null;
  lastUpdatedAt: string | null;
};

/**
 * Shared context injected into every turn inside a Creation Workspace.
 * Domain records remain authoritative; this is the assembled view.
 */
export type UniversalCreationContext = {
  creationRecordId: string;
  workspaceId: string;
  creationType: string;
  creationSubtype?: string;
  blueprintId: string;
  title: string;
  purpose?: string;
  intendedOutcomes: string[];
  audiences: CreationAudience[];
  constraints: CreationConstraint[];
  currentPhase: string;
  currentSectionId?: string;
  currentAssetId?: string;
  knownFacts: CreationKnownFact[];
  doNotReaskFields: string[];
  decisions: CreationDecision[];
  unresolvedDecisions: CreationDecision[];
  assets: CreationAssetSummary[];
  tasks: CreationTaskSummary[];
  milestones: CreationMilestoneSummary[];
  primaryOwner: ChamberMemberId | string;
  activeContributors: CreationContributorContext[];
  boardAdvice: BoardAdviceSummary[];
  readiness: CreationReadinessSummary;
  relationshipSummary: CreationRelationshipSummary;
  conversationIds: string[];
  latestUserGoal: string;
  returnState: CreationReturnState;
  version: string;
  /** Focused asset recommendations (052A) — never full dump */
  focusedRecommendations: EventAssetRecommendation[];
};

export type CreationResolution = {
  found: boolean;
  creationRecordId: string | null;
  workspaceId: string | null;
  eventRecordId: string | null;
  canonicalWorkId: string | null;
  projectHomeId: string | null;
  blueprint: CreateBlueprint | null;
  isDuplicateAttempt: boolean;
  resume: boolean;
  reason: string;
};

export type NextBestStep = {
  kind: "ask" | "acknowledge" | "recommend_asset" | "stay" | "answer_knowledge";
  prompt: string;
  sectionId?: string | null;
  assetTypeId?: string | null;
  doNotReask: string[];
};

export type UniversalCreationEngineResult = {
  handled: boolean;
  intent: UniversalCreationIntent;
  resolution: CreationResolution;
  context: UniversalCreationContext | null;
  nextStep: NextBestStep | null;
  /** Member-facing reply when the engine owns the turn */
  reply: string;
  /** Domain payload for Events adapter */
  eventRecordId: string | null;
  projectHomeId: string | null;
  projectHomeCreated: boolean;
  /** Forbidden phrase check */
  conversationSafe: boolean;
  /** Events-compatible turn kind for CPC drop-in */
  kind: "start" | "continue" | "domain" | "noop";
  /** Active Event Record when Events path handled the turn */
  record: EventRecord | null;
};
