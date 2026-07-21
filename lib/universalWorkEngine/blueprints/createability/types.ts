/**
 * Blueprint Createability Standard (233–236).
 * Typed output manifests — advice is not creation.
 */

export const BLUEPRINT_CREATEABILITY_STANDARD_ID =
  "standard.blueprint.createability" as const;

export const BLUEPRINT_CREATEABILITY_CERTIFICATION_ID =
  "certification.blueprint.createability" as const;

/** Allowed creation states (233). */
export type BlueprintOutputCreationState =
  | "direct"
  | "structured"
  | "composed"
  | "connected"
  | "draft_only"
  | "future";

/** Honest availability (235). */
export type BlueprintOutputAvailabilityStatus =
  | "available"
  | "available_with_limits"
  | "connected"
  | "draft_only"
  | "blocked"
  | "future";

export type BlueprintProjectHandoffBehavior =
  | "none"
  | "optional"
  | "recommended"
  | "required";

/** Minimum registry output types (234). */
export type BlueprintOutputType =
  | "document"
  | "brief"
  | "plan"
  | "workflow"
  | "procedure"
  | "checklist"
  | "template"
  | "campaign"
  | "calendar"
  | "timeline"
  | "dashboard"
  | "scorecard"
  | "calculation"
  | "financial_model"
  | "forecast"
  | "decision_brief"
  | "report"
  | "data_structure"
  | "visual_asset"
  | "content_asset"
  | "package"
  | "project"
  | "registry"
  | "assessment"
  | "map"
  | "matrix"
  | "other";

export const BLUEPRINT_OUTPUT_TYPES: readonly BlueprintOutputType[] = [
  "document",
  "brief",
  "plan",
  "workflow",
  "procedure",
  "checklist",
  "template",
  "campaign",
  "calendar",
  "timeline",
  "dashboard",
  "scorecard",
  "calculation",
  "financial_model",
  "forecast",
  "decision_brief",
  "report",
  "data_structure",
  "visual_asset",
  "content_asset",
  "package",
  "project",
  "registry",
  "assessment",
  "map",
  "matrix",
  "other",
] as const;

export type BlueprintOutputCreateabilityEntry = {
  outputId: string;
  outputName: string;
  outputType: BlueprintOutputType;
  creationState: BlueprintOutputCreationState;
  purpose: string;
  userInputs: readonly string[];
  questions: readonly string[];
  capabilityOwner: string;
  contributors: readonly string[];
  creationFlow: readonly string[];
  destination: string;
  sourceOfTruth: string;
  editable: boolean;
  resumable: boolean;
  reusable: boolean;
  projectHandoff: BlueprintProjectHandoffBehavior;
  exportFormats: readonly string[];
  validationRules: readonly string[];
  status: BlueprintOutputAvailabilityStatus;
  tests: readonly string[];
  /** Set when entry was inferred from deliverables[] without a hand-authored manifest. */
  provisional?: boolean;
  notes?: string;
};

export type BlueprintCreateabilityManifest = {
  blueprintId: string;
  blueprintVersion: string;
  standardId: typeof BLUEPRINT_CREATEABILITY_STANDARD_ID;
  outputs: readonly BlueprintOutputCreateabilityEntry[];
  auditedAt?: string;
};

export type BlueprintCreateabilityCertResult =
  | "pass"
  | "pass_with_declared_limits"
  | "fail"
  | "blocked";

export type BlueprintCreateabilityGateId =
  | "promise_integrity"
  | "input_completeness"
  | "capability_availability"
  | "creation_path"
  | "persistence"
  | "editability"
  | "exact_resume"
  | "reuse"
  | "project_handoff"
  | "export_integrity"
  | "calculation_integrity"
  | "status_honesty";

export type BlueprintCreateabilityIssue = {
  gate: BlueprintCreateabilityGateId;
  outputId?: string;
  blocking: boolean;
  title: string;
  detail: string;
};

export type BlueprintCreateabilityCertification = {
  certificationId: typeof BLUEPRINT_CREATEABILITY_CERTIFICATION_ID;
  blueprintId: string;
  blueprintVersion: string;
  result: BlueprintCreateabilityCertResult;
  issues: readonly BlueprintCreateabilityIssue[];
  outputCount: number;
  availableCount: number;
  blockedOrFutureCount: number;
  provisionalCount: number;
};

export type CreateabilityGapSeverity = "critical" | "high" | "moderate" | "low";

export type CreateabilityGapEntry = {
  blueprintId: string;
  blueprintVersion: string;
  outputId: string;
  outputName: string;
  severity: CreateabilityGapSeverity;
  gap: string;
  remediation:
    | "implement_direct"
    | "implement_structured"
    | "implement_composed"
    | "connect_destination"
    | "label_draft_only"
    | "move_to_future"
    | "remove_promise";
};

export type MasterBlueprintOutputRegistryRow = {
  blueprintId: string;
  blueprintVersion: string;
  workTypeIds: readonly string[];
  outputId: string;
  outputName: string;
  outputType: BlueprintOutputType;
  creationState: BlueprintOutputCreationState;
  status: BlueprintOutputAvailabilityStatus;
  destination: string;
  provisional: boolean;
};
