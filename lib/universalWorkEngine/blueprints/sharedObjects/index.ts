export {
  MASTER_SHARED_OBJECT_LIBRARY_STANDARD_ID,
  SHARED_OBJECT_LIBRARY_CERTIFICATION_ID,
} from "./types";
export type {
  SharedObjectCreationAuthority,
  SharedObjectModelClass,
  SharedObjectTypeId,
  SharedObjectConnectionStatus,
  SharedObjectTypeDef,
  SharedRelationshipTypeDef,
  BlueprintSharedObjectDependencyEntry,
  BlueprintSharedObjectManifest,
  SharedObjectCertResult,
  SharedObjectGateId,
  SharedObjectIssue,
  SharedObjectCertification,
  SharedObjectGapSeverity,
  SharedObjectGapEntry,
  MasterObjectTypeRegistryRow,
  DuplicateObjectAuditRow,
} from "./types";

export {
  MASTER_OBJECT_TYPES,
  NON_DUPLICATION_OBJECT_TYPES,
  getObjectType,
} from "./objectTypes";
export { MASTER_RELATIONSHIP_TYPES } from "./relationshipTypes";
export {
  mapLabelToSharedObject,
  mapKnownContextKeyToObject,
  authorityFromCreateabilityState,
  makeSharedDependencyId,
} from "./mapToObjectType";
export {
  seedSharedObjectManifestFromBlueprint,
  resolveSharedObjectManifest,
  countAuthorities,
} from "./seedFromBlueprints";
export {
  validateSharedObjectManifest,
  type SharedObjectManifestValidationIssue,
} from "./validateManifest";
export { certifyBlueprintSharedObjects } from "./certifySharedObjects";
export {
  buildBlueprintSharedObjectAudit,
  type BlueprintSharedObjectAuditBundle,
} from "./buildMasterRegistry";
export {
  renderMasterObjectTypeRegistryMarkdown,
  renderMasterFieldRegistryMarkdown,
  renderMasterRelationshipRegistryMarkdown,
  renderBlueprintObjectDependencyMatrixMarkdown,
  renderExtensionRegistryMarkdown,
  renderDuplicateObjectAuditMarkdown,
  renderMigrationPlanMarkdown,
  renderValidationRegistryMarkdown,
  renderPermissionRegistryMarkdown,
  renderExternalMappingRegistryMarkdown,
  renderSharedObjectGapRegisterMarkdown,
  renderSharedObjectCertificationDashboardMarkdown,
} from "./renderSharedObjectReports";
