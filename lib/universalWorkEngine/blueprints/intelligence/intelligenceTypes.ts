/**
 * Spark Blueprint™ Intelligence — Phase A types (100).
 * Attached to blueprint identity; does not replace BlueprintDefinition.
 */

export type BlueprintVisibility = "private" | "shared" | "system";
export type BlueprintLifecycleStatus = "draft" | "published" | "archived";

export type BlueprintHealthSeverity = "ok" | "advisory" | "attention";

export type BlueprintHealthFindingKind =
  | "purpose"
  | "structure"
  | "order"
  | "duplicate"
  | "missing_element"
  | "broad_section"
  | "orphan_group"
  | "dependency"
  | "relationship"
  | "prompt"
  | "output"
  | "reusability"
  | "accessibility"
  | "domain";

export type BlueprintHealthFinding = {
  id: string;
  kind: BlueprintHealthFindingKind;
  severity: BlueprintHealthSeverity;
  title: string;
  /** Why this matters — advisory, never a command. */
  why: string;
  expectedImpact?: string;
  sectionId?: string;
  groupId?: string;
  affectsExistingWorks: boolean;
  createsNewVersion: boolean;
  /** Fingerprint of evidence; new evidence may resurface a dismissed finding. */
  evidenceFingerprint: string;
};

export type BlueprintHealthOverall = "good" | "needs_attention" | "incomplete";

export type BlueprintHealthSnapshot = {
  evaluatedAt: string;
  overall: BlueprintHealthOverall;
  /** Plain language, e.g. "Good overall" — not a gamified percentage. */
  summaryLine: string;
  findings: readonly BlueprintHealthFinding[];
};

export type BlueprintSuggestionDispositionStatus =
  | "dismissed"
  | "saved_for_later"
  | "accepted";

export type BlueprintSuggestionDisposition = {
  findingId: string;
  blueprintId: string;
  status: BlueprintSuggestionDispositionStatus;
  at: string;
  evidenceFingerprint: string;
};

export type BlueprintUsageWorkRef = {
  workId: string;
  blueprintVersion: string;
  workTypeId: string;
};

export type BlueprintUsageSummary = {
  activeWorkCount: number;
  worksByVersion: Readonly<Record<string, number>>;
  linkedProjects: number;
  linkedCalendar: number;
  linkedTasks: number;
  linkedVisualThinking: number;
  linkedFiles: number;
  linkedResearch: number;
  linkedGoals: number;
  linkedPeople: number;
  relatedWork: number;
  brokenReferences: number;
  works: readonly BlueprintUsageWorkRef[];
};

export type BlueprintImpactPreview = {
  blueprintId: string;
  fromVersion: string | null;
  toVersion: string | null;
  activeWorksUsingBlueprint: number;
  versionsInUse: readonly string[];
  linkedProjects: number;
  linkedCalendar: number;
  linkedTasks: number;
  linkedVisualThinking: number;
  sectionsWithExternalConnections: number;
  /** Plain-language safety explanation. */
  memberMessage: string;
  addedSectionIds: readonly string[];
  removedSectionIds: readonly string[];
  renamedSections: readonly { id: string; from: string; to: string }[];
  movedSectionIds: readonly string[];
};

export type BlueprintCertificationStatus =
  | "ready_to_publish"
  | "ready_with_suggestions"
  | "not_ready";

export type BlueprintCertificationIssue = {
  id: string;
  blocking: boolean;
  title: string;
  detail: string;
};

export type BlueprintCertificationResult = {
  status: BlueprintCertificationStatus;
  evaluatedAt: string;
  blockers: readonly BlueprintCertificationIssue[];
  advisories: readonly BlueprintCertificationIssue[];
  canCreateWork: boolean;
  existingWorksProtected: boolean;
};

/** Quiet summary lines for Blueprint Home — counts from real relationships. */
export type BlueprintHomeQuietSummary = {
  usedByActiveWorksLabel: string;
  linkedProjectsLabel: string;
  linkedCalendarLabel: string;
  linkedTasksLabel: string;
  linkedVisualMapsLabel: string;
  healthLabel: string;
};

export type SparkBlueprintHomeModel = {
  blueprintId: string;
  name: string;
  purpose: string;
  currentVersion: string;
  status: BlueprintLifecycleStatus;
  visibility: BlueprintVisibility;
  lastUpdated: string | null;
  workTypeIds: readonly string[];
  primaryAction: "continue_editing" | "create_work" | "publish_version";
  quietSummary: BlueprintHomeQuietSummary;
  health: BlueprintHealthSnapshot;
  usage: BlueprintUsageSummary;
  certification: BlueprintCertificationResult;
  impact: BlueprintImpactPreview;
};
