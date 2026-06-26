/**
 * Companion Brain™ — public API.
 * Memory remembers. The Brain understands. Pages express.
 */

export { COMPANION_BRAIN_SERVICES } from "./constitution";
export { CompanionBrain, runReasoningCycle, runReflectionCycle } from "./orchestrator";
export { assembleContext } from "./assembleContext";
export { generateCompanionJudgment } from "./generateCompanionJudgment";
export { generateMomentumAction } from "./generateMomentumAction";
export { selectConfidenceOpportunity } from "./selectConfidenceOpportunity";
export { evaluatePermission } from "./evaluatePermission";
export { generateProposals } from "./generateProposals";
export { buildOrientation } from "./buildOrientation";
export {
  generateMorningPresence,
  formatMorningPresencePlain,
} from "./generateMorningPresence";
export { runCognitiveAudit } from "./runCognitiveAudit";
export { applyRelationshipProtection } from "./applyRelationshipProtection";
export { performReflection } from "./performReflection";
export { emitLearningSignals } from "./emitLearningSignals";
export { updateCompanionBrain } from "./updateCompanionBrain";
export { resolveDayMode } from "./resolveDayMode";
export { resolveCycleState } from "./resolveCycleState";
export {
  createDefaultCompanionBrainState,
  readCompanionBrainState,
  writeCompanionBrainState,
  isCooldownActive,
  setCooldown,
} from "./store";
export { classifyLifeArea } from "./classifyLifeArea";
export {
  getAllLifeAreas,
  getLifeAreaById,
  SYSTEM_LIFE_AREAS,
  createUserLifeArea,
  readUserLifeAreas,
  recordLifeAreaCorrection,
  readLifeAreaCorrections,
  detectSmartLifeAreaSuggestions,
  suppressSmartLifeArea,
} from "./lifeAreas";
export type {
  LifeArea,
  LifeAreaKind,
  LifeAreaCorrection,
  LifeAreaClassificationResult,
  ClassifyLifeAreaInput,
  SmartLifeAreaSuggestion,
  CreateUserLifeAreaInput,
} from "./lifeAreas/types";
export { LIFE_AREA_AUTO_APPLY_THRESHOLD } from "./lifeAreas/types";
export type * from "./types";
