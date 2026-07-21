/**
 * Master Shared Object Library (295–300).
 * One canonical object graph — plus honest creation authority:
 * fully create · prepare · user-provided · completed elsewhere.
 */

export const MASTER_SHARED_OBJECT_LIBRARY_STANDARD_ID =
  "standard.master_shared_object_library" as const;

export const SHARED_OBJECT_LIBRARY_CERTIFICATION_ID =
  "certification.shared_object_library" as const;

/**
 * What Spark may honestly do with an object dependency (platform rule).
 * Distinct from createability creationState — this names responsibility.
 */
export type SharedObjectCreationAuthority =
  | "fully_create"
  | "prepare"
  | "user_provided"
  | "completed_elsewhere";

export type SharedObjectModelClass =
  | "canonical"
  | "extension"
  | "relationship"
  | "snapshot"
  | "temporary_session_state"
  | "duplicate_requiring_migration"
  | "deprecated"
  | "unknown_requiring_review";

export type SharedObjectTypeId =
  | "business"
  | "person"
  | "organization"
  | "business_dna"
  | "client_avatar"
  | "relationship"
  | "client_account"
  | "vendor_account"
  | "partner_account"
  | "role_assignment"
  | "offer"
  | "product"
  | "service"
  | "package"
  | "pricing_model"
  | "opportunity"
  | "proposal"
  | "agreement"
  | "order"
  | "invoice"
  | "payment"
  | "subscription"
  | "universal_work"
  | "create_artifact"
  | "project"
  | "milestone"
  | "task"
  | "checklist"
  | "appointment"
  | "event"
  | "location"
  | "asset"
  | "inventory_item"
  | "reservation"
  | "work_order"
  | "schedule"
  | "knowledge_item"
  | "content_asset"
  | "template"
  | "communication"
  | "decision"
  | "approval"
  | "risk"
  | "incident"
  | "goal"
  | "metric_definition"
  | "metric_observation"
  | "dashboard";

export type SharedObjectConnectionStatus =
  | "connected"
  | "connected_with_limits"
  | "missing"
  | "duplicate_risk"
  | "blocked"
  | "future";

export type SharedObjectTypeDef = {
  objectTypeId: SharedObjectTypeId;
  name: string;
  family:
    | "business_relationship"
    | "offer_commerce_financial"
    | "work_project_operations"
    | "knowledge_content_decision_measurement";
  identityField: string;
  requiredFields: readonly string[];
  defaultAuthority: SharedObjectCreationAuthority;
  notes?: string;
};

export type SharedRelationshipTypeDef = {
  relationshipTypeId: string;
  name: string;
  sourceTypes: readonly SharedObjectTypeId[];
  targetTypes: readonly SharedObjectTypeId[];
  notes?: string;
};

export type BlueprintSharedObjectDependencyEntry = {
  dependencyId: string;
  objectTypeId: SharedObjectTypeId;
  /** How Spark may treat this dependency honestly. */
  creationAuthority: SharedObjectCreationAuthority;
  status: SharedObjectConnectionStatus;
  source:
    | "deliverable"
    | "known_context"
    | "createability_destination"
    | "system_required";
  sourceLabel: string;
  provisional?: boolean;
  notes?: string;
};

export type BlueprintSharedObjectManifest = {
  blueprintId: string;
  blueprintVersion: string;
  standardId: typeof MASTER_SHARED_OBJECT_LIBRARY_STANDARD_ID;
  dependencies: readonly BlueprintSharedObjectDependencyEntry[];
  auditedAt?: string;
};

export type SharedObjectCertResult =
  | "pass"
  | "pass_with_declared_limits"
  | "fail"
  | "blocked";

export type SharedObjectGateId =
  | "canonical_identity"
  | "relationship_integrity"
  | "blueprint_reuse"
  | "context_integrity"
  | "lifecycle"
  | "version_provenance"
  | "access_isolation"
  | "create_project_integrity"
  | "reporting"
  | "migration"
  | "integration"
  | "performance_usability"
  | "creation_authority_honesty";

export type SharedObjectIssue = {
  gate: SharedObjectGateId;
  dependencyId?: string;
  blocking: boolean;
  title: string;
  detail: string;
};

export type SharedObjectCertification = {
  certificationId: typeof SHARED_OBJECT_LIBRARY_CERTIFICATION_ID;
  blueprintId: string;
  blueprintVersion: string;
  result: SharedObjectCertResult;
  issues: readonly SharedObjectIssue[];
  dependencyCount: number;
  connectedCount: number;
  blockedCount: number;
  provisionalCount: number;
  authorityCounts: Readonly<Record<SharedObjectCreationAuthority, number>>;
};

export type SharedObjectGapSeverity = "critical" | "high" | "moderate" | "low";

export type SharedObjectGapEntry = {
  blueprintId: string;
  dependencyId: string;
  objectTypeId: SharedObjectTypeId;
  creationAuthority: SharedObjectCreationAuthority;
  severity: SharedObjectGapSeverity;
  gap: string;
  remediation:
    | "map_to_canonical"
    | "add_relationship"
    | "declare_extension"
    | "migrate_duplicate"
    | "wire_create_artifact"
    | "wire_project_link"
    | "label_user_provided"
    | "label_completed_elsewhere"
    | "label_prepare_only";
};

export type MasterObjectTypeRegistryRow = SharedObjectTypeDef & {
  blueprintDependencyCount: number;
};

export type DuplicateObjectAuditRow = {
  concept: string;
  objectTypeId: SharedObjectTypeId;
  modelClass: SharedObjectModelClass;
  finding: string;
  remediation: string;
};
