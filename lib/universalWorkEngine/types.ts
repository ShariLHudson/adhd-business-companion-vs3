/**
 * Universal Work Engine — shared types.
 * Work Type packages supply domain configuration only.
 */

export type CanonicalWorkId = string;

export type WorkIdAliasKind =
  | "event_record"
  | "create_session"
  | "workspace_duplicate"
  | "canonical_projects"
  | "runtime_creation"
  | "legacy_other";

export type WorkOrigin =
  | "create"
  | "event"
  | "projects"
  | "chamber"
  | "board"
  | "cartography"
  | "body_doubling"
  | "conversation"
  | "duplicate"
  | "migration"
  | "unknown";

export type WorkIdentityRecord = {
  /** Sole authoritative master identity. */
  workId: CanonicalWorkId;
  origin: WorkOrigin;
  workTypeId: string | null;
  aliases: readonly string[];
  createdAt: string;
  updatedAt: string;
};

export type WorkTypeCapabilityFlags = {
  tasks: boolean;
  milestones: boolean;
  research: boolean;
  chamberRouting: boolean;
  boardReview: boolean;
  cartography: boolean;
  projectBridge: boolean;
  print: boolean;
  export: boolean;
};

export type WorkTypeLifecycleConfig = {
  /** Section lifecycle statuses owned by createSectionLifecycle. */
  usesUniversalSectionLifecycle: true;
  /** Optional Work Type display phases (domain only). */
  domainPhases?: readonly string[];
};

export type WorkTypePackage = {
  workTypeId: string;
  version: string;
  displayName: string;
  /** Creation Experience id (estate / create surface). */
  creationExperienceId: string;
  /** Supported blueprint ids (domain). */
  blueprintIds: readonly string[];
  lifecycle: WorkTypeLifecycleConfig;
  /** Workshop Map sections — structure only. */
  sections: readonly { id: string; title: string; optional?: boolean }[];
  defaultFocusSectionIds?: readonly string[];
  /** Question / deliverable ids — domain configuration references. */
  questionDefinitionIds?: readonly string[];
  deliverableIds?: readonly string[];
  capabilities: WorkTypeCapabilityFlags;
  /** Certification requirement ids for this package. */
  certificationRequirementIds?: readonly string[];
};

export type WorkTaskStatus =
  | "todo"
  | "in_progress"
  | "blocked"
  | "done"
  | "cancelled";

export type WorkTask = {
  id: string;
  workId: CanonicalWorkId;
  title: string;
  status: WorkTaskStatus;
  owner?: string | null;
  dueDate?: string | null;
  parentTaskId?: string | null;
  dependsOnTaskIds?: readonly string[];
  sectionId?: string | null;
  projectId?: string | null;
  sourceContext?: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
};

export type WorkMilestone = {
  id: string;
  workId: CanonicalWorkId;
  title: string;
  dueDate?: string | null;
  status: "pending" | "done" | "skipped";
  sectionId?: string | null;
  projectId?: string | null;
  sourceContext?: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
};

export type ResearchApprovalStatus =
  | "draft"
  | "in_review"
  | "approved"
  | "rejected"
  | "applied";

export type ResearchAttachmentTarget =
  | { kind: "work"; workId: CanonicalWorkId }
  | { kind: "section"; workId: CanonicalWorkId; sectionId: string }
  | { kind: "task"; workId: CanonicalWorkId; taskId: string }
  | { kind: "milestone"; workId: CanonicalWorkId; milestoneId: string }
  | { kind: "decision"; workId: CanonicalWorkId; decisionId: string }
  | { kind: "project"; projectId: string; workId?: CanonicalWorkId }
  | { kind: "blueprint"; blueprintId: string; workId?: CanonicalWorkId }
  | { kind: "cartography_node"; nodeId: string; workId?: CanonicalWorkId };

export type ResearchRecord = {
  id: string;
  target: ResearchAttachmentTarget;
  researchQuestion: string;
  researchMode: string;
  sources: readonly string[];
  findings: string;
  date: string;
  confidence: "low" | "medium" | "high";
  relevance: string;
  affectedDecisions: readonly string[];
  proposedActions: readonly string[];
  approvalStatus: ResearchApprovalStatus;
  appliedChanges: readonly string[];
  originatingExperience: string;
  createdAt: string;
  updatedAt: string;
};

export type WorkRelationshipKind =
  | "supports"
  | "depends_on"
  | "contains"
  | "implements"
  | "informs"
  | "related_to"
  | "reused_from"
  | "part_of"
  | "visualizes";

export type WorkRelationship = {
  id: string;
  fromWorkId: CanonicalWorkId;
  toRef: {
    kind: "work" | "cartography_node" | "project" | "blueprint";
    id: string;
  };
  relationship: WorkRelationshipKind;
  createdAt: string;
  note?: string | null;
};

export class UnknownWorkTypeError extends Error {
  readonly workTypeId: string;
  constructor(workTypeId: string) {
    super(
      `Unknown or unregistered Work Type "${workTypeId}". Register a Work Type package before bootstrap — template fallthrough is not allowed for resolved Work Type IDs.`,
    );
    this.name = "UnknownWorkTypeError";
    this.workTypeId = workTypeId;
  }
}
