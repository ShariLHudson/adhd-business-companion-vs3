export {
  FOUNDER_VALIDATION_EVIDENCE_ROOT,
  FOUNDER_VALIDATION_STORAGE_KEY,
  type FounderStatusApproval,
  type FounderValidationStore,
  type JourneyRunRecord,
  type JourneyStatusOverlay,
  type JourneySuccessCriterion,
  type JourneyVerdict,
  type ScreenshotReference,
} from "./types";

export {
  getJourneyDefinition,
  getJourneySuccessCriteria,
  listValidationJourneyIds,
} from "./journeyCriteria";

export {
  CERTIFY_CONFIRMATION_PHRASE,
  STATUS_CHANGE_CONFIRMATION_PHRASE,
  browserStatusFromVerdict,
  buildApprovalRecord,
  canApproveStatusChange,
  certificationAfterRunRecord,
  type ApprovalGateResult,
  type ProposedStatusChange,
} from "./approvalGate";

export {
  applyApprovedOverlay,
  emptyValidationStore,
  evidenceRelativePathForRun,
  exportRunEvidenceJson,
  exportStoreSnapshotJson,
  finishJourneyRun,
  getOverlay,
  loadValidationStore,
  saveValidationStore,
  startJourneyRun,
} from "./evidenceStore";

export {
  buildFounderValidationDashboard,
  formatFounderValidationDashboardMarkdown,
} from "./mergeDashboard";
