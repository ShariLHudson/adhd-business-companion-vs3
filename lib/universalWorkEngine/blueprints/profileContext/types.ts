/**
 * Blueprint Profile Context Connection Standard (273–278).
 * Prove business context is loaded, prefills, syncs, and isolates — not merely referenced.
 */

export const BLUEPRINT_PROFILE_CONTEXT_STANDARD_ID =
  "standard.blueprint.profile_context_connection" as const;

export const BLUEPRINT_CONTEXT_CONNECTION_CERTIFICATION_ID =
  "certification.blueprint.context_connection" as const;

/** Canonical entity families (274). */
export type CanonicalContextEntity =
  | "business"
  | "business_dna"
  | "client_avatar"
  | "offer"
  | "product_or_service"
  | "brand"
  | "blueprint_session";

/** Connection status for a declared dependency (277/278). */
export type ContextConnectionStatus =
  | "connected"
  | "connected_with_limits"
  | "missing"
  | "stale"
  | "conflict"
  | "blocked"
  | "future";

export type ContextPrefillBehavior =
  | "auto_prefill"
  | "confirm_if_ambiguous"
  | "ask_if_missing"
  | "never_ask_if_reliable"
  | "override_local_only"
  | "permissioned_canonical_update";

export type CanonicalFieldDef = {
  fieldId: string;
  entity: CanonicalContextEntity;
  name: string;
  required: boolean;
  sourceOfTruth: string;
};

/** One Blueprint → profile field dependency (277). */
export type BlueprintContextDependencyEntry = {
  dependencyId: string;
  questionId?: string;
  knownContextKey: string;
  canonicalFieldId: string;
  entity: CanonicalContextEntity;
  prefillBehavior: ContextPrefillBehavior;
  status: ContextConnectionStatus;
  /** Seeded from knownContextKeys without a live profile wire. */
  provisional?: boolean;
  notes?: string;
};

export type BlueprintProfileContextManifest = {
  blueprintId: string;
  blueprintVersion: string;
  standardId: typeof BLUEPRINT_PROFILE_CONTEXT_STANDARD_ID;
  dependencies: readonly BlueprintContextDependencyEntry[];
  auditedAt?: string;
};

export type BlueprintContextConnectionCertResult =
  | "pass"
  | "pass_with_declared_limits"
  | "fail"
  | "blocked";

export type BlueprintContextConnectionGateId =
  | "active_business"
  | "canonical_profile_load"
  | "avatar_offer_load"
  | "prefill"
  | "question_suppression"
  | "ambiguity_handling"
  | "override_control"
  | "canonical_update_permission"
  | "provenance"
  | "exact_resume"
  | "chamber_propagation"
  | "create_project_continuity"
  | "conflict_detection"
  | "staleness_handling"
  | "isolation";

export type BlueprintContextConnectionIssue = {
  gate: BlueprintContextConnectionGateId;
  dependencyId?: string;
  blocking: boolean;
  title: string;
  detail: string;
};

export type BlueprintContextConnectionCertification = {
  certificationId: typeof BLUEPRINT_CONTEXT_CONNECTION_CERTIFICATION_ID;
  blueprintId: string;
  blueprintVersion: string;
  result: BlueprintContextConnectionCertResult;
  issues: readonly BlueprintContextConnectionIssue[];
  dependencyCount: number;
  connectedCount: number;
  blockedOrMissingCount: number;
  provisionalCount: number;
};

export type ContextGapSeverity = "critical" | "high" | "moderate" | "low";

export type ContextSyncGapEntry = {
  blueprintId: string;
  blueprintVersion: string;
  dependencyId: string;
  knownContextKey: string;
  canonicalFieldId: string;
  severity: ContextGapSeverity;
  gap: string;
  remediation:
    | "wire_profile_load"
    | "implement_prefill"
    | "suppress_repeat_question"
    | "add_ambiguity_selector"
    | "add_override_scope"
    | "add_permissioned_sync"
    | "add_provenance"
    | "add_isolation_test"
    | "label_future";
};

export type MasterBlueprintContextRegistryRow = {
  blueprintId: string;
  blueprintVersion: string;
  workTypeIds: readonly string[];
  dependencyId: string;
  knownContextKey: string;
  canonicalFieldId: string;
  entity: CanonicalContextEntity;
  status: ContextConnectionStatus;
  provisional: boolean;
};

export type RepeatedQuestionRiskEntry = {
  blueprintId: string;
  questionId: string;
  knownContextKeys: readonly string[];
  risk: "high" | "moderate" | "low";
  reason: string;
};
