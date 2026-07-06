/** Pattern engine — alias for ecosystem service naming. */
export { PatternEngine as PatternService, patternEngine as patternService } from "../patterns/patternEngine";

export { RelationshipService, relationshipService } from "../relationships/relationshipEngine";

export { PriorityService, priorityService } from "../priorities/priorityService";

export { ScoringEngine as ScoringService, scoringEngine as scoringService } from "../scoring/scoringEngine";

export {
  RecommendationPreparationService,
  recommendationPreparationService,
} from "../recommendations/recommendationPreparationService";

export { KnowledgeService, KnowledgeGraph, knowledgeService, knowledgeGraph } from "../knowledge/knowledgeService";

export { SignalService, signalService } from "../signals/signalService";

export { OpportunityService, opportunityService } from "../opportunities/opportunityService";

export { RiskService, riskService } from "../risks/riskService";

export { ObservationService, observationService } from "../observations/observationService";

export { MemoryReferenceService, memoryReferenceService } from "../memory/memoryReferenceService";

export { RankingService, rankingService } from "../ranking/rankingService";
