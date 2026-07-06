export type * from "./types";

export {
  ExecutiveBriefService,
  executiveBriefService,
  getExecutiveBrief,
  getFounderAlerts,
  getIfIWereRunningSection,
} from "./services/executiveBriefService";

export {
  buildExecutiveBrief,
  buildBriefWithEvidenceExpansion,
  briefReadabilityReport,
  ensureFounderAlertsFirst,
  sortBriefItemsByPriority,
} from "./builders/briefBuilder";

export {
  buildExecutiveExplanation,
  buildExecutiveLearning,
  labelForActionKind,
} from "./explanations/explanationBuilder";

export {
  stripExecutiveJargon,
  isPlainEnglish,
  readabilityScore,
  ensureShortSentences,
} from "./explanations/readabilityHelpers";

export {
  buildEvidence,
  evidenceForMission,
  evidenceForResearch,
  listExpandableEvidence,
} from "./explanations/evidenceHelpers";

export {
  priorityFromScore,
  comparePriority,
  labelForPriority,
  isFounderAlertPriority,
} from "./presentation/priorityPresentation";

export {
  labelForTimeSensitivity,
  timeSensitivityFromUrgency,
} from "./presentation/timeSensitivity";

export { learningSectionsForItem, attachLearningLayers } from "./presentation/learningLayers";

export {
  listFounderAlerts,
  founderAlertsForDomains,
  SAMPLE_FOUNDER_ALERTS,
} from "./alerts/founderAlerts";

export {
  buildIfIWereRunningSection,
  topAdvisorRecommendations,
  IF_I_WERE_RUNNING_HEADLINE,
  SAMPLE_ADVISOR_RECOMMENDATIONS,
} from "./recommendations/advisorSection";

export {
  listSampleOpportunities,
  listSampleRisks,
  listSampleRecommendations,
} from "./recommendations/recommendationBuilder";

export { SAMPLE_EXECUTIVE_BRIEF, composeExecutiveBriefFromOvernight } from "./sample";
