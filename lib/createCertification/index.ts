export type {
  CertificationDecision,
  CertificationEvidence,
  CertificationStatus,
  CrossEntryTraceRow,
  DefectSeverity,
  RequirementTraceRow,
  StandardMatrixRow,
  TestResultStatus,
} from "./types";

export {
  assessCertification,
  canMarkCertified,
  severityBlocksCertification,
} from "./assessCertification";

export {
  CROSS_ENTRY_TRACE_MATRIX,
  MASTER_STANDARDS_MATRIX,
  REQUIREMENT_TRACE_MATRIX,
  getStandardMatrixRow,
  listTraceabilityGaps,
  listUncertifiedStandards,
  matrixHasInvalidCertificationClaims,
} from "./traceabilityMatrix";

export {
  formatCompletionReport,
  type CompletionReport,
} from "./completionReport";

export {
  CERTIFICATION_SPEC_TEMPLATE_PATH,
  CERTIFICATION_STANDARD_DOC_PATH,
  IMPLEMENTATION_SPEC_TEMPLATE_PATH,
  TRACEABILITY_MATRIX_DOC_PATH,
  assessCompanionArtifacts,
  certificationSpecFilename,
  implementationSpecFilename,
  type CompanionArtifactSet,
} from "./artifactTemplates";

export {
  CERTIFICATION_JOURNEYS,
  emptyBrowserEvidencePack,
  platformCertificationBlockedBy,
  type BrowserEvidencePack,
  type CertificationJourneyId,
  type CertificationJourneyRow,
} from "./certificationJourneys";

export {
  blankEmotionalQualityAudit,
  emotionalQualityPasses,
  EMOTIONAL_QUALITY_CHECKLIST,
  type EmotionalQualityAnswer,
  type EmotionalQualityQuestionId,
  type EmotionalQualityRow,
} from "./emotionalQuality";

export {
  buildCertificationDashboard,
  countCertifiedCapabilities,
  formatCertificationDashboardMarkdown,
  type CapabilityDashboardRow,
  type DashboardCategoryId,
} from "./certificationDashboard";

export {
  PRODUCTION_CREATE_FOUNDATION_CHECKS,
  productionCertCheckCount,
  type ProductionCertCheck,
  type ProductionCertCheckId,
  type ProductionCertDomain,
} from "./productionCreateFoundationCert";
