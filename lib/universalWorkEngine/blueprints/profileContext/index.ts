export {
  BLUEPRINT_PROFILE_CONTEXT_STANDARD_ID,
  BLUEPRINT_CONTEXT_CONNECTION_CERTIFICATION_ID,
} from "./types";
export type {
  CanonicalContextEntity,
  ContextConnectionStatus,
  ContextPrefillBehavior,
  CanonicalFieldDef,
  BlueprintContextDependencyEntry,
  BlueprintProfileContextManifest,
  BlueprintContextConnectionCertResult,
  BlueprintContextConnectionGateId,
  BlueprintContextConnectionIssue,
  BlueprintContextConnectionCertification,
  ContextGapSeverity,
  ContextSyncGapEntry,
  MasterBlueprintContextRegistryRow,
  RepeatedQuestionRiskEntry,
} from "./types";

export {
  MASTER_CANONICAL_FIELDS,
  getCanonicalField,
} from "./canonicalFields";
export { mapKnownContextKey, makeDependencyId } from "./mapKnownContextKey";
export {
  seedProfileContextManifestFromKnownContext,
  resolveProfileContextManifest,
} from "./seedFromKnownContext";
export {
  validateProfileContextManifest,
  type ProfileContextManifestValidationIssue,
} from "./validateManifest";
export { certifyBlueprintContextConnection } from "./certifyContextConnection";
export {
  buildBlueprintProfileContextAudit,
  type BlueprintProfileContextAuditBundle,
} from "./buildMasterRegistry";
export {
  renderMasterContextRegistryMarkdown,
  renderMasterCanonicalFieldRegistryMarkdown,
  renderDependencyMatrixMarkdown,
  renderContextSyncGapRegisterMarkdown,
  renderRepeatedQuestionRegisterMarkdown,
  renderIsolationTestReportMarkdown,
  renderContextRetrofitBacklogMarkdown,
  renderContextCertificationDashboardMarkdown,
} from "./renderContextReports";
