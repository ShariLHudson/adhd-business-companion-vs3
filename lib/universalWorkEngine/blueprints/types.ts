/**
 * Universal Blueprint Framework — shared types.
 * Owned by the Universal Work Engine. Work Type packages supply definitions only.
 */

import type { CanonicalWorkId, WorkOrigin, WorkRelationshipKind } from "../types";
import type { BlueprintCreateabilityManifest } from "./createability/types";

export type BlueprintCategory =
  | "spark"
  | "personal"
  | "company"
  | "adaptive"
  | "from_previous_work";

export type BlueprintDepthMode =
  | "quick_start"
  | "guided_build"
  | "complete_planning";

export type BlueprintComplexity = "simple" | "moderate" | "complex";

export type BlueprintSectionRole =
  | "required"
  | "conditional"
  | "optional"
  | "hidden_system";

export type BlueprintCondition =
  | { kind: "always" }
  | { kind: "known_context_equals"; key: string; value: string }
  | { kind: "known_context_truthy"; key: string }
  | { kind: "question_answered"; questionId: string }
  | { kind: "question_equals"; questionId: string; value: string }
  | { kind: "depth_at_least"; mode: BlueprintDepthMode }
  | { kind: "and"; conditions: readonly BlueprintCondition[] }
  | { kind: "or"; conditions: readonly BlueprintCondition[] };

export type BlueprintSectionDef = {
  id: string;
  title: string;
  role: BlueprintSectionRole;
  condition?: BlueprintCondition;
  defaultValue?: string;
  /** Group membership for Workshop Map (099). */
  groupId?: string | null;
  order?: number;
  required?: boolean;
  skippable?: boolean;
  starterPrompt?: string;
  helpPrompt?: string;
  outputHeading?: string;
  /** Soft-deleted from structure; excluded from maps until undone. */
  softDeleted?: boolean;
  protected?: boolean;
};

/** Collapsible Workshop Map group — structure only (099). */
export type BlueprintGroup = {
  groupId: string;
  title: string;
  description?: string;
  order: number;
  collapsedByDefault?: boolean;
  /** Section ids in display order within the group. */
  sectionIds: readonly string[];
};

export type BlueprintAdaptiveQuestion = {
  id: string;
  prompt: string;
  /** Lower-friction wording when adaptive engine prefers it. */
  lowerFrictionPrompt?: string;
  /** Depth-specific wording (overrides prompt when present for that mode). */
  promptByDepth?: Partial<Readonly<Record<BlueprintDepthMode, string>>>;
  /** Extra-soft wording when member energy is low. */
  lowEnergyPrompt?: string;
  /** Why Spark asks — domain guidance (not shown as a form label by default). */
  purpose?: string;
  whyItMatters?: string;
  examples?: readonly string[];
  dontKnowBehavior?: string;
  skipBehavior?: string;
  postponeBehavior?: string;
  followUpRules?: string;
  sectionsAffected?: readonly string[];
  deliverablesAffected?: readonly string[];
  tasksAffected?: readonly string[];
  researchOpportunities?: readonly string[];
  sectionId?: string;
  /** Modes where this question is considered. */
  requiredInModes: readonly BlueprintDepthMode[];
  /** Question ids that must be answered before this one. */
  dependencies?: readonly string[];
  /** Known-context keys that satisfy this question without asking. */
  knownContextKeys?: readonly string[];
  postponable?: boolean;
  /** When false, answering rarely changes the immediate next step. */
  materialChangeNextStep?: boolean;
  /** Safe inference key → value when context allows. */
  inferFromContext?: { key: string; asAnswer: string };
};

export type BlueprintSuggestedTask = {
  id: string;
  title: string;
  sectionId?: string;
  depthModes?: readonly BlueprintDepthMode[];
};

export type BlueprintSuggestedMilestone = {
  id: string;
  title: string;
  depthModes?: readonly BlueprintDepthMode[];
};

export type BlueprintCartographyRecommendation = {
  relationship: WorkRelationshipKind;
  note?: string;
};

/** Domain extras (people/roles, budget, timeline, communications, follow-up). */
export type BlueprintDomainExtensions = {
  peopleAndRoles?: readonly string[];
  budgetConsiderations?: readonly string[];
  timelineRecommendations?: readonly string[];
  communications?: readonly string[];
  followUpRequirements?: readonly string[];
  [key: string]: unknown;
};

export type BlueprintDefinition = {
  blueprintId: string;
  version: string;
  category: BlueprintCategory;
  compatibleWorkTypeIds: readonly string[];
  title: string;
  description: string;
  intendedUse: string;
  complexity: BlueprintComplexity;
  /** All three modes are always supported by the framework; listed for clarity. */
  supportedDepthModes: readonly BlueprintDepthMode[];
  sections: readonly BlueprintSectionDef[];
  /** Optional map groups — long maps; short maps may omit. */
  groups?: readonly BlueprintGroup[];
  /** Include group titles in assembled output (default false). */
  includeGroupHeadingsInAssembly?: boolean;
  defaultValues?: Readonly<Record<string, string>>;
  adaptiveQuestions: readonly BlueprintAdaptiveQuestion[];
  suggestedTasks: readonly BlueprintSuggestedTask[];
  suggestedMilestones: readonly BlueprintSuggestedMilestone[];
  commonlyForgottenItems: readonly string[];
  riskPrompts: readonly string[];
  researchPrompts: readonly string[];
  deliverables: readonly string[];
  /**
   * Typed Output Createability Manifest (233–236).
   * When omitted, deliverables[] seed a provisional blocked manifest for audit only.
   */
  createabilityManifest?: BlueprintCreateabilityManifest;
  chamberRoutingRecommendations: readonly string[];
  boardReviewRecommendations: readonly string[];
  projectBridgeRecommendations: readonly string[];
  cartographyRelationshipRecommendations: readonly BlueprintCartographyRecommendation[];
  completionCriteria: readonly string[];
  certificationRules: readonly string[];
  domainExtensions?: BlueprintDomainExtensions;
  /** Optional parent Blueprint for inheritance. */
  inheritsFromBlueprintId?: string | null;
};

export type BlueprintProvenance =
  | {
      kind: "blueprint";
      sourceBlueprintId: string;
      sourceBlueprintVersion: string;
    }
  | {
      kind: "previous_work";
      sourceWorkId: CanonicalWorkId;
      sourceBlueprintId?: string | null;
      sourceBlueprintVersion?: string | null;
      reusedSectionIds: readonly string[];
    }
  | {
      kind: "save_as";
      sourceWorkId: CanonicalWorkId;
      savedAsCategory: "personal" | "company";
    };

export type WorkBlueprintState = {
  workId: CanonicalWorkId;
  workTypeId: string;
  blueprintId: string;
  blueprintVersion: string;
  depthMode: BlueprintDepthMode;
  origin: WorkOrigin;
  sectionContent: Record<string, string>;
  answeredQuestions: Record<string, string>;
  skippedQuestionIds: string[];
  knownContext: Record<string, string>;
  /** Conditional section ids currently triggered. */
  activeConditionalSectionIds: string[];
  provenance: BlueprintProvenance;
  /** True when an upgrade preserved user edits pending approval for conflicts. */
  pendingOverwriteApprovals?: Readonly<Record<string, string>>;
  createdAt: string;
  updatedAt: string;
};

export type AdaptiveQuestionDecision =
  | {
      action: "skip_known";
      questionId: string;
      knownValue: string;
      reason: string;
    }
  | {
      action: "infer";
      questionId: string;
      inferredValue: string;
      reason: string;
    }
  | {
      action: "postpone";
      questionId: string;
      reason: string;
    }
  | {
      action: "ask";
      questionId: string;
      prompt: string;
      reason: string;
    }
  | {
      action: "not_required_now";
      questionId: string;
      reason: string;
    };

export type SaveAsBlueprintReview = {
  proposedBlueprintId: string;
  proposedVersion: string;
  category: "personal" | "company";
  title: string;
  description: string;
  sourceWorkId: CanonicalWorkId;
  /** Sections after instance-specific sanitization. */
  sanitizedSectionDefaults: Record<string, string>;
  removedFields: readonly string[];
  requiresExplicitRetain: readonly string[];
};

export type BuildFromPreviousOptions = {
  sourceWorkId: CanonicalWorkId;
  targetWorkTypeId: string;
  blueprintId: string;
  depthMode?: BlueprintDepthMode;
  /** Section ids approved for reuse. Empty = none. */
  approvedSectionIds: readonly string[];
  origin?: WorkOrigin;
  knownContext?: Record<string, string>;
};

export type BlueprintAuditEvent = {
  id: string;
  at: string;
  blueprintId: string;
  blueprintVersion?: string | null;
  workId?: CanonicalWorkId | null;
  action:
    | "register"
    | "initialize"
    | "change_depth"
    | "upgrade"
    | "save_as_personal"
    | "save_as_company"
    | "build_from_previous"
    | "duplicate"
    | "inherit"
    | "answer_question"
    | "skip_question"
    | "recover_question"
    | "approve_overwrite";
  detail?: string | null;
};

export class UnknownBlueprintError extends Error {
  readonly blueprintId: string;
  constructor(blueprintId: string) {
    super(
      `Unknown or unregistered Blueprint "${blueprintId}". Register through the Universal Blueprint registry before use.`,
    );
    this.name = "UnknownBlueprintError";
    this.blueprintId = blueprintId;
  }
}

export class IncompatibleBlueprintError extends Error {
  readonly blueprintId: string;
  readonly workTypeId: string;
  constructor(blueprintId: string, workTypeId: string) {
    super(
      `Blueprint "${blueprintId}" is not compatible with Work Type "${workTypeId}".`,
    );
    this.name = "IncompatibleBlueprintError";
    this.blueprintId = blueprintId;
    this.workTypeId = workTypeId;
  }
}

export const ALL_BLUEPRINT_DEPTH_MODES: readonly BlueprintDepthMode[] = [
  "quick_start",
  "guided_build",
  "complete_planning",
] as const;

export const DEPTH_RANK: Record<BlueprintDepthMode, number> = {
  quick_start: 1,
  guided_build: 2,
  complete_planning: 3,
};
