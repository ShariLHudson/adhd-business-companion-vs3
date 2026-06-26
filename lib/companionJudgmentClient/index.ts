/**
 * Companion Judgment Client™ — Live Reality™ experience layer.
 * One reality. One brain. Many experiences.
 */

export type {
  LiveAdaptationResult,
  LiveJudgmentSnapshot,
  RealitySignal,
  RealitySignalKind,
  RealitySignalSource,
} from "./types";

export { gatherEcosystemMemory } from "./gatherEcosystemMemory";
export { detectMeaningfulShift } from "./detectMeaningfulShift";
export { formatAdaptationMessage } from "./adaptationMessage";
export {
  COMPANION_JUDGMENT_UPDATED,
  COMPANION_REALITY_UPDATED,
  readLiveJudgment,
  resetLiveJudgmentForTests,
} from "./liveJudgmentStore";
export {
  publishRealitySignal,
  reEvaluateLiveJudgment,
  ensureLiveJudgment,
  registerLiveEcosystemListeners,
} from "./liveEcosystem";
export { emitLiveAdaptationSignals } from "./emitLiveAdaptationSignals";
export { useLiveCompanionJudgment } from "./useLiveCompanionJudgment";
export {
  WORKSPACE_INTELLIGENCE_REGISTRY,
  workspaceIntelligenceFor,
} from "./workspaceIntelligence";
export type { WorkspaceIntelligenceEntry, WorkspaceIntelligenceRole } from "./workspaceIntelligence";
export { captureAffectsLiveReality, maybePublishCaptureReality } from "./realityFromCapture";
