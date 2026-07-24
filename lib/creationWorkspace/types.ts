/**
 * Creation Workspace — develop Creation Packages before destination commitment.
 */

export type CreationWorkspaceStatus =
  | "forming"
  | "first_draft"
  | "developing"
  | "needs_research"
  | "needs_user_input"
  | "ready_for_review"
  | "ready_for_destination"
  | "handed_off"
  | "paused"
  | "archived";

export type CreationWorkspaceView =
  | "draft"
  | "sections"
  | "research"
  | "questions"
  | "alternatives"
  | "sources"
  | "readiness";

export type CreationWorkspaceItemType =
  | "section"
  | "paragraph"
  | "idea"
  | "finding"
  | "example"
  | "option"
  | "recommendation"
  | "question"
  | "decision_candidate"
  | "task_candidate"
  | "milestone_candidate"
  | "process_step"
  | "checklist_item"
  | "form_field"
  | "timeline_item"
  | "comparison_item"
  | "strategy_candidate"
  | "risk"
  | "resource"
  | "note"
  | "placeholder_for_user_input";

export type CreationWorkspaceItem = {
  id: string;
  workspaceId: string;
  parentId: string | null;
  type: CreationWorkspaceItemType;
  title: string;
  summary: string;
  body: string;
  order: number;
  depth: number;
  groupId: string | null;
  origin: "generated" | "research" | "user" | "alternative" | "system";
  status: "draft" | "ready" | "needs_input" | "suggested" | "removed";
  confidence: "high" | "medium" | "low";
  verificationStatus: "verified" | "partially_verified" | "unverified";
  sourceKnowledgeItemIds: string[];
  sourceResearchFindingIds: string[];
  sourceReferences: string[];
  userCreated: boolean;
  userEdited: boolean;
  protected: boolean;
  locked: boolean;
  destinationEligibility: string[];
  presentationHints: string[];
  createdAt: string;
  updatedAt: string;
};

export type CreationWorkspaceVersion = {
  id: string;
  workspaceId: string;
  label: string;
  snapshotItemIds: string[];
  items: CreationWorkspaceItem[];
  origin: string;
  createdAt: string;
};

export type CreationWorkspaceAlternative = {
  id: string;
  workspaceId: string;
  label: string;
  description: string;
  items: CreationWorkspaceItem[];
  createdAt: string;
};

export type CreationWorkspaceHandoffDestination =
  | "create"
  | "projects"
  | "visual_thinking"
  | "strategic_planning"
  | "business_estate"
  | "research_library"
  | "learning"
  | "save";

export type CreationWorkspaceHandoff = {
  id: string;
  workspaceId: string;
  creationPackageId: string;
  destination: CreationWorkspaceHandoffDestination;
  requestedOutcome: string;
  includedSectionIds: string[];
  includedItemIds: string[];
  includedResearchCollectionIds: string[];
  sourceReferences: string[];
  userNotes: string[];
  protectedContent: string[];
  unresolvedAreas: string[];
  proposedChanges: string[];
  requiresReview: boolean;
  status:
    | "proposed"
    | "preparing"
    | "ready_for_review"
    | "approved"
    | "completed"
    | "failed"
    | "cancelled";
  payload: string;
  createdAt: string;
  completedAt: string | null;
};

export type CreationWorkspace = {
  id: string;
  title: string;
  purpose: string;
  status: CreationWorkspaceStatus;
  requestUnderstandingId: string | null;
  blueprintId: string | null;
  creationPackageId: string | null;
  researchCollectionIds: string[];
  sourceExperience: string | null;
  sourceConversationId: string | null;
  sourceSessionId: string | null;
  sourceEntityIds: string[];
  primaryOutcome: string;
  intendedAudience: string | null;
  intendedUse: string | null;
  sectionIds: string[];
  itemIds: string[];
  noteIds: string[];
  questionIds: string[];
  alternativeIds: string[];
  suggestionIds: string[];
  selectedSectionIds: string[];
  activeSectionId: string | null;
  activeView: CreationWorkspaceView;
  currentVersionId: string | null;
  versionHistoryIds: string[];
  protectedContentIds: string[];
  lockedContentIds: string[];
  availableHandoffs: string[];
  completedHandoffIds: string[];
  returnContext: string | null;
  researchStatus: string | null;
  missingPieces: string[];
  items: CreationWorkspaceItem[];
  versions: CreationWorkspaceVersion[];
  alternatives: CreationWorkspaceAlternative[];
  handoffs: CreationWorkspaceHandoff[];
  createdAt: string;
  updatedAt: string;
  lastOpenedAt: string;
  workspaceVersion: number;
};

export type CreationWorkspaceSubstanceValidation = {
  valid: boolean;
  primaryOutcomePresent: boolean;
  substantiveSectionCount: number;
  substantiveItemCount: number;
  requestEchoDetected: boolean;
  warningOnlyDetected: boolean;
  placeholderOnlyDetected: boolean;
  emptyRequiredSections: string[];
  durationPreserved: boolean;
  quantityPreserved: boolean;
  seriesPreserved: boolean;
  deliverablePreserved: boolean;
  validationFailures: string[];
  repairInstructions: string[];
};

export type CreationWorkspaceUseOption = {
  id: string;
  label: string;
  description: string;
  destination: CreationWorkspaceHandoffDestination;
  reason: string;
  confidence: number;
  primary: boolean;
  requiresClarification: boolean;
};

export type CreationWorkspaceOpenDecision =
  | { open: true; reason: string }
  | { open: false; reason: string; bypassTo: "create" | "visual_thinking" | "projects" | "research" | "stay" };

export const CREATION_WORKSPACE_TITLE = "Creation Workspace";
export const CREATION_WORKSPACE_SUPPORTING =
  "Develop your research, ideas, plans, and drafts before deciding how you want to use them.";
export const CREATION_WORKSPACE_STORAGE_KEY =
  "companion-creation-workspace-store-v1";
export const CREATION_WORKSPACE_ACTIVE_KEY =
  "companion-creation-workspace-active-v1";