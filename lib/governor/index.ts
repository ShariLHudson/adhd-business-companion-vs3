export type {
  IntelligenceSource,
  GovernorDisposition,
  GovernorConfidence,
  IncomingRecommendation,
  GovernorDecision,
  GovernorConflict,
  GovernorRecommendation,
  GovernorContext,
  GovernorView,
} from "./types";

export {
  GOVERNOR_PRINCIPLE,
  ATTENTION_PROTECTION_RULE,
  GOVERNOR_QUESTIONS,
  COORDINATED_INTELLIGENCE_SYSTEMS,
  EXECUTIVE_TRUST_RULES,
} from "./sample";

export { governorSampleRepository } from "./repositories/sample";
export { collectIncomingRecommendations, SOURCE_LABELS } from "./routing/intelligenceRouter";
export { evaluateAttentionPolicy, isFounderFacing } from "./policies/attentionPolicy";
export { resolveConflicts, dedupeByConflict } from "./policies/conflictResolution";
export { toGovernorRecommendation, prioritizeRecommendations } from "./priorities/priorityEngine";
export { composeGovernorContext } from "./contexts/governorContext";
export type { GovernorOperatingContext } from "./contexts/governorContext";
export {
  composeGovernor,
  governorPrimaryRecommendation,
  GovernorService,
  governorService,
} from "./services/governorService";
