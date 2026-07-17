/**
 * CB-022 addendum — intent-first classification + workflow resume ownership.
 * Conversation Engine owns this alongside ActiveTopicState (Chamber).
 */

export type StrategyEntryMode = "browse" | "apply" | "create" | "resume";

export type RequestedArtifactType =
  | "strategy"
  | "document"
  | "project"
  | "plan"
  | "reminder"
  | "message"
  | "email"
  | "note"
  | "framework"
  | "checklist"
  | "unknown";

/** Resolved ADHD vs Business strategy path — persisted until contradicted. */
export type StrategyClassificationStatus =
  | "unresolved"
  | "awaiting_user"
  | "adhd_apply"
  | "business_create"
  | "adhd_aware_business"
  | "not_applicable";

export type IntentWorkflowStatus =
  | "active"
  | "paused"
  | "completed"
  | "cancelled";

export type StrategyContextSnapshot = {
  topic?: string;
  businessContext?: string;
  adhdAdaptation?: boolean;
  peopleInvolved?: string[];
  desiredOutcome?: string;
  obstacles?: string;
};

export type IntentWorkflowState = {
  interpretedGoal: string;
  artifactType: RequestedArtifactType;
  workflowType?: string;
  strategyEntryMode?: StrategyEntryMode;
  classificationStatus: StrategyClassificationStatus;
  classificationResolvedAtTurn?: number;
  context: StrategyContextSnapshot;
  responseOwner: "shari";
  status: IntentWorkflowStatus;
  startedAtTurn: number;
  updatedAtTurn: number;
  /** Prior strategy work parked when a new intent wins. */
  pausedGoal?: string;
};

export type WorkflowResumeReason =
  | "explicit_continue"
  | "high_confidence_match"
  | "stale_state"
  | "workflow_conflict"
  | "new_intent"
  | "insufficient_evidence";

export type WorkflowResumeDecision = {
  shouldResume: boolean;
  workflowId?: string;
  workflowType?: string;
  reason: WorkflowResumeReason;
  confidence: "high" | "medium" | "low";
};

export type StrategyLibraryOpenView =
  | "home"
  | "adhd"
  | "business"
  | "saved"
  | "recommended";
