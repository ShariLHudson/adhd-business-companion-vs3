/**
 * Universal Work Engine — public API.
 * Work Type packages and experiences import from here only.
 */

import "./packages/eventPlan/registerEventPlanWorkType";

export type {
  CanonicalWorkId,
  WorkIdentityRecord,
  WorkOrigin,
  WorkTypePackage,
  WorkTypeCapabilityFlags,
  WorkTask,
  WorkMilestone,
  WorkTaskStatus,
  ResearchRecord,
  ResearchAttachmentTarget,
  ResearchApprovalStatus,
  WorkRelationship,
  WorkRelationshipKind,
} from "./types";
export { UnknownWorkTypeError } from "./types";

export {
  allocateCanonicalWorkId,
  CANONICAL_WORK_ID_PREFIX,
  LEGACY_WORK_ID_PREFIXES,
  detectLegacyWorkIdKind,
  isCanonicalWorkIdFormat,
} from "./identity/allocateCanonicalWorkId";
export {
  resolveCanonicalWorkId,
  adoptLegacyWorkIdAsCanonical,
  coalesceWorkflowWorkId,
} from "./identity/resolveWorkIdentity";
export {
  getWorkIdentity,
  listWorkIdentities,
  resetWorkIdentityStoreForTests,
} from "./identity/workIdentityStore";

export {
  registerWorkTypePackage,
  getWorkTypePackage,
  requireWorkTypePackage,
  listWorkTypePackages,
  isWorkTypeRegistered,
  clearWorkTypePackageRegistryForTests,
  resolveWorkTypeIdFromMemberLabel,
} from "./registry/universalWorkTypeRegistry";
export {
  workTypePackageToSchema,
  registerSchemaAsWorkTypePackage,
  requireSchemaForWorkTypeId,
} from "./registry/bridgeWorkTypeSchema";

export {
  listWorkTasks,
  listWorkMilestones,
  addWorkTask,
  addWorkMilestone,
  upsertWorkTask,
  upsertWorkMilestone,
  syncEventTasksIntoUniversalWork,
  resetWorkTasksForTests,
} from "./tasks/workTasksApi";

export {
  createResearchRecord,
  getResearchRecord,
  listResearchForWork,
  submitResearchForReview,
  approveResearch,
  rejectResearch,
  applyApprovedResearch,
  resetResearchAttachmentsForTests,
} from "./research/researchAttachment";

export {
  linkWorkRelationship,
  listWorkRelationships,
  cartographyRefsForWork,
  resetWorkRelationshipsForTests,
} from "./cartography/workRelationships";

export {
  APPROVED_DURABLE_REPOSITORY,
  APPROVED_DURABLE_TABLE,
  APPROVED_DURABLE_RUNTIME_MODULES,
  FORBIDDEN_DURABLE_CALLER_GLOBS,
} from "./boundaries/durableAccessGuard";

export { ensureEventPlanWorkTypeRegistered } from "./packages/eventPlan/registerEventPlanWorkType";
