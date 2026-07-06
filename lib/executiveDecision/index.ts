export type {
  ExecutiveDecision,
  DecisionOption,
  DecisionComparison,
  DecisionCriteria,
  DecisionRecommendation,
  DecisionPlan,
  ImplementationPlan,
  ImplementationTask,
  ApprovalStage,
  MonitoringPlan,
  ProgressCheckpoint,
  SuccessMetric,
  RiskAssessment,
  FallbackPlan,
  DecisionOutcome,
  LessonLearned,
  ExecutiveReview,
  DecisionConfidence,
  DecisionPriority,
  DecisionRelationship,
  DecisionLifecycleStep,
  CreateDecisionInput,
  FounderGuidance,
} from "./types";

export {
  SAMPLE_EXECUTIVE_DECISIONS,
  SAMPLE_DECISION_RELATIONSHIPS,
  getSampleDecision,
  listSampleDecisions,
  listSampleDecisionRelationships,
  decisionsForMission,
  decisionsByCategory,
} from "./sample";

export { executiveDecisionSampleRepository } from "./repositories/sample";

export { LIFECYCLE_STEPS, lifecycleProgress, advanceLifecycle, lifecycleNarrative } from "./lifecycle/decisionLifecycle";
export { optionComparisonMatrix } from "./lifecycle/optionComparison";
export { buildFounderGuidance } from "./lifecycle/recommendation";
export { prepareDecisionPlan } from "./planning/planPreparation";
export { prepareImplementation as buildImplementationPlan } from "./implementation/implementationPrep";
export { prepareApproval as buildApprovalStages, approvalBlocked, executiveControlSummary } from "./approvals/approvalFlow";
export { prepareMonitoring as buildMonitoringPlan } from "./monitoring/monitoringPlan";
export { reviewDecision as buildExecutiveReview } from "./reviews/executiveReview";
export { prepareAutomationDrafts, automationGuardrails } from "./automation/automationPrep";
export { captureDecisionHistorySnapshot } from "./history/decisionHistory";

export {
  ExecutiveDecisionService,
  executiveDecisionService,
  createDecision,
  compareOptionsForDecision as compareOptions,
  recommendOptionForDecision as recommendOption,
  prepareImplementationForDecision as prepareImplementation,
  prepareApprovalForDecision as prepareApproval,
  prepareMonitoringForDecision as prepareMonitoring,
  reviewDecisionById as reviewDecision,
  rememberDecisionOutcome as rememberOutcome,
  resetRuntimeExecutiveDecisions,
} from "./services/executiveDecisionService";
