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
export type * from "./types";
