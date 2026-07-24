/**
 * Versioned destination handoff contracts for Creation Workspace.
 * Destinations must consume substantive work — not title/request shells.
 */

import type { CreationWorkspaceHandoffDestination } from "../types";

export const CREATION_WORKSPACE_CREATE_HANDOFF_VERSION =
  "creation-workspace-create-handoff-v1" as const;
export const CREATION_WORKSPACE_VISUAL_HANDOFF_VERSION =
  "creation-workspace-visual-handoff-v1" as const;
export const CREATION_WORKSPACE_PROJECT_HANDOFF_VERSION =
  "creation-workspace-project-handoff-v1" as const;
export const CREATION_WORKSPACE_STRATEGY_HANDOFF_VERSION =
  "creation-workspace-strategy-handoff-v1" as const;
export const CREATION_WORKSPACE_ESTATE_HANDOFF_VERSION =
  "creation-workspace-estate-handoff-v1" as const;

export type CreationWorkspaceHandoffSection = {
  id: string;
  title: string;
  body: string;
  order: number;
  hierarchy: number;
  itemType: string;
  userEdited: boolean;
  protected: boolean;
  sources: string[];
  notes: string[];
  placeholder: boolean;
  parentId: string | null;
  groupId: string | null;
};

export type CreationWorkspaceReturnContext = {
  workspaceId: string;
  activeSectionId: string | null;
  selectedSectionIds: string[];
  view: string | null;
  label: string;
};

export type CreationWorkspaceCreateHandoff = {
  version: typeof CREATION_WORKSPACE_CREATE_HANDOFF_VERSION;
  id: string;
  workspaceId: string;
  creationPackageId: string;
  requestUnderstandingId: string | null;
  blueprintId: string | null;
  title: string;
  purpose: string;
  intendedAudience: string | null;
  intendedUse: string | null;
  tone: string | null;
  creationFamily: string | null;
  creationSubtype: string | null;
  recommendedArtifactType: string;
  sections: CreationWorkspaceHandoffSection[];
  supportingItems: CreationWorkspaceHandoffSection[];
  researchCollectionIds: string[];
  sourceReferences: string[];
  assumptions: string[];
  unresolvedAreas: string[];
  userInputPlaceholders: string[];
  userEditedItemIds: string[];
  protectedItemIds: string[];
  sourceExperience: string;
  returnContext: CreationWorkspaceReturnContext;
  createdAt: string;
  /** Never used to regenerate destination content. */
  originalRequestEcho: string | null;
};

export type CreationWorkspaceVisualHandoff = {
  version: typeof CREATION_WORKSPACE_VISUAL_HANDOFF_VERSION;
  id: string;
  workspaceId: string;
  creationPackageId: string;
  requestUnderstandingId: string | null;
  title: string;
  purpose: string;
  intendedAudience: string | null;
  intendedCognitivePurpose: string | null;
  selectedSectionIds: string[];
  sections: CreationWorkspaceHandoffSection[];
  items: CreationWorkspaceHandoffSection[];
  sequences: Array<{ id: string; label: string; itemIds: string[] }>;
  relationships: Array<{ fromId: string; toId: string; label: string }>;
  groups: Array<{ id: string; label: string; itemIds: string[] }>;
  comparisons: Array<{ id: string; label: string; itemIds: string[] }>;
  timelines: Array<{ id: string; label: string; itemIds: string[] }>;
  decisionCandidates: CreationWorkspaceHandoffSection[];
  processSteps: CreationWorkspaceHandoffSection[];
  researchCollectionIds: string[];
  sourceReferences: string[];
  assumptions: string[];
  unresolvedQuestions: string[];
  userNotes: string[];
  protectedItemIds: string[];
  sourceExperience: string;
  returnContext: CreationWorkspaceReturnContext;
  createdAt: string;
};

export type CreationWorkspaceProjectProposalTask = {
  id: string;
  title: string;
  description: string;
  selected: boolean;
  sourceSectionIds: string[];
};

export type CreationWorkspaceProjectProposalPhase = {
  id: string;
  name: string;
  description: string;
  selected: boolean;
  milestones: Array<{
    id: string;
    title: string;
    selected: boolean;
    sourceSectionIds: string[];
  }>;
  tasks: CreationWorkspaceProjectProposalTask[];
};

export type CreationWorkspaceProjectHandoff = {
  version: typeof CREATION_WORKSPACE_PROJECT_HANDOFF_VERSION;
  id: string;
  workspaceId: string;
  creationPackageId: string;
  requestUnderstandingId: string | null;
  proposedTitle: string;
  purpose: string;
  phases: CreationWorkspaceProjectProposalPhase[];
  dependencies: string[];
  risks: string[];
  decisions: string[];
  resources: string[];
  completionCriteria: string[];
  sourceSections: CreationWorkspaceHandoffSection[];
  researchCollectionIds: string[];
  sourceReferences: string[];
  requiresReview: true;
  sourceExperience: string;
  returnContext: CreationWorkspaceReturnContext;
  createdAt: string;
};

export type CreationWorkspaceStrategyCandidate = {
  id: string;
  kind:
    | "objective"
    | "evidence"
    | "assumption"
    | "option"
    | "tradeoff"
    | "risk"
    | "criterion"
    | "priority"
    | "initiative"
    | "measure"
    | "unresolved";
  title: string;
  body: string;
  selected: boolean;
  approved: boolean;
  sourceSectionIds: string[];
};

export type CreationWorkspaceStrategyHandoff = {
  version: typeof CREATION_WORKSPACE_STRATEGY_HANDOFF_VERSION;
  id: string;
  workspaceId: string;
  creationPackageId: string;
  requestUnderstandingId: string | null;
  strategicQuestion: string;
  objective: string;
  evidence: CreationWorkspaceStrategyCandidate[];
  assumptions: CreationWorkspaceStrategyCandidate[];
  options: CreationWorkspaceStrategyCandidate[];
  tradeoffs: CreationWorkspaceStrategyCandidate[];
  risks: CreationWorkspaceStrategyCandidate[];
  decisionCriteria: CreationWorkspaceStrategyCandidate[];
  proposedPriorities: CreationWorkspaceStrategyCandidate[];
  possibleInitiatives: CreationWorkspaceStrategyCandidate[];
  possibleMeasures: CreationWorkspaceStrategyCandidate[];
  unresolvedQuestions: CreationWorkspaceStrategyCandidate[];
  researchCollectionIds: string[];
  sourceReferences: string[];
  requiresReview: true;
  autoApproved: false;
  sourceExperience: string;
  returnContext: CreationWorkspaceReturnContext;
  createdAt: string;
};

export type CreationWorkspaceEstateProposalField = {
  id: string;
  destinationField: string;
  currentValue: string | null;
  proposedValue: string;
  sourceEvidence: string[];
  approved: boolean;
  proposalType:
    | "audience_update"
    | "offer_update"
    | "positioning_update"
    | "framework_draft"
    | "system_description"
    | "process_update"
    | "market_insight"
    | "customer_journey"
    | "business_note";
};

export type CreationWorkspaceEstateHandoff = {
  version: typeof CREATION_WORKSPACE_ESTATE_HANDOFF_VERSION;
  id: string;
  workspaceId: string;
  creationPackageId: string;
  proposals: CreationWorkspaceEstateProposalField[];
  researchCollectionIds: string[];
  sourceReferences: string[];
  requiresFieldApproval: true;
  silentWritebackAllowed: false;
  sourceExperience: string;
  returnContext: CreationWorkspaceReturnContext;
  createdAt: string;
};

export type AnyCreationWorkspaceDestinationHandoff =
  | CreationWorkspaceCreateHandoff
  | CreationWorkspaceVisualHandoff
  | CreationWorkspaceProjectHandoff
  | CreationWorkspaceStrategyHandoff
  | CreationWorkspaceEstateHandoff;

export type CreationWorkspaceRegistryStatus =
  | "prepared"
  | "opening"
  | "consumed"
  | "ready_for_review"
  | "approved"
  | "completed"
  | "failed"
  | "cancelled"
  | "superseded";

export type CreationWorkspaceHandoffRegistryEntry = {
  handoffId: string;
  workspaceId: string;
  packageId: string;
  destination: CreationWorkspaceHandoffDestination;
  payloadVersion: string;
  status: CreationWorkspaceRegistryStatus;
  destinationEntityId: string | null;
  createdAt: string;
  consumedAt: string | null;
  failureStage: string | null;
  retryAction: string | null;
  lastSynchronizationAt: string | null;
};

export const MAX_HANDOFF_AGE_MS = 1000 * 60 * 60 * 24; // 24h
