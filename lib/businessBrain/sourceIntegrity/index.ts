export type {
  KnowledgeSourceType,
  SourceVerificationStatus,
  SourceConfidenceLevel,
  KnowledgeClaimKind,
  KnowledgeContentClaim,
  KnowledgeCardContentLayers,
  SourceIntegrityChecklistId,
  SourceIntegrityChecklistAnswers,
  SourceIntegrityChecklistResult,
  SourceIntegrityValidationIssue,
  SourceIntegrityValidationResult,
} from "./types";

export {
  KNOWLEDGE_SOURCE_TYPE_IDS,
  SOURCE_VERIFICATION_STATUS_IDS,
  SOURCE_CONFIDENCE_LEVEL_IDS,
  KNOWLEDGE_CLAIM_KIND_IDS,
  KNOWLEDGE_CLAIM_KIND_LABELS,
  EMPTY_KNOWLEDGE_CARD_CONTENT_LAYERS,
  SOURCE_INTEGRITY_CHECKLIST,
  SOURCE_INTEGRITY_CHECKLIST_IDS,
} from "./types";

export {
  isSourceEligibleForTeaching,
  filterSourcesEligibleForTeaching,
  rejectUnverifiedForTeaching,
  checklistPassed,
  evaluateSourceIntegrityChecklist,
  validateContentClaim,
  validateKnowledgeCardContentLayers,
  canPublishLesson,
  SOURCE_INTEGRITY_RULES,
} from "./validators";
