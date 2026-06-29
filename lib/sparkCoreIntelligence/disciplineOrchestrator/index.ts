export {
  runExecutiveDisciplineOrchestrator,
  selectExecutiveDisciplines,
  detectScenario,
  executeDisciplinesParallel,
  resolveConflicts,
  synthesizeUnifiedRecommendation,
  getActivationLog,
  clearActivationLog,
} from "./disciplineOrchestrator";
export type {
  CoreOrchestratorInput,
  CoreOrchestratorResult,
  ExecutiveDisciplineId,
  OrchestrationScenario,
  UnifiedRecommendation,
  ActivationLogEntry,
  DisciplinePerformanceScore,
} from "./types";
