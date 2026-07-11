import type {
  SparkConnection,
  SparkIntelligenceBundle,
  SparkOverview,
  SparkPattern,
  SparkPrepareContext,
} from "../types";
import { sparkObservationService } from "../observations/observationService";
import { sparkPatternService } from "../patterns/patternEngine";
import { sparkPriorityService } from "../priorities/priorityService";
import { sparkRecommendationService } from "../recommendations/recommendationPreparationService";
import { sparkKnowledgeGraphStore } from "../knowledge/knowledgeService";
import { sparkRelationshipService } from "../relationships/relationshipEngine";
import { sparkScoringService, type SparkScoringInput } from "../scoring/scoringEngine";
import { sparkSignalService } from "../signals/signalService";
import { sparkOpportunityService } from "../opportunities/opportunityService";
import { sparkRiskService } from "../risks/riskService";
import { sparkKnowledgeService } from "../knowledge/knowledgeService";
import { sparkFindingService } from "../findings/findingService";
import { sparkSampleRepository } from "../repositories";

export type SparkObserveResult = {
  sources: ReturnType<typeof sparkSampleRepository.sources>;
  signals: ReturnType<typeof sparkSignalService.listSignals>;
  observations: ReturnType<typeof sparkObservationService.listObservations>;
  findings: ReturnType<typeof sparkFindingService.listFindings>;
  patterns: ReturnType<typeof sparkPatternService.findPatterns>;
  themes: ReturnType<typeof sparkPatternService.identifyThemes>;
};

export type SparkConnectResult = {
  lineage: ReturnType<typeof sparkRelationshipService.buildLineageRelationship>;
  graph: ReturnType<typeof sparkKnowledgeGraphStore.getGraph>;
  connections: ReturnType<typeof sparkRelationshipService.listConnections>;
};

export type SparkPrepareResult = {
  recommendations: ReturnType<typeof sparkRecommendationService.prepare>;
  priorities: ReturnType<typeof sparkPriorityService.topPriorities>;
  opportunities: ReturnType<typeof sparkOpportunityService.listOpportunities>;
  risks: ReturnType<typeof sparkRiskService.listRisks>;
};

/**
 * SPARK public API — Strategic Pattern Analysis & Recommendation Kernel
 * No UI. No AI. No product-specific logic.
 */
export const Spark = {
  observe(): SparkObserveResult {
    return {
      sources: sparkSampleRepository.sources(),
      signals: sparkSignalService.listSignals(),
      observations: sparkObservationService.listObservations(),
      findings: sparkFindingService.listFindings(),
      patterns: sparkPatternService.findPatterns(),
      themes: sparkPatternService.identifyThemes(),
    };
  },

  score(input: SparkScoringInput) {
    return sparkScoringService.score(input);
  },

  prioritize(limit = 5) {
    return sparkPriorityService.topPriorities(limit);
  },

  connect(nodeId?: string): SparkConnectResult {
    return {
      lineage: sparkRelationshipService.buildLineageRelationship(),
      graph: nodeId
        ? sparkKnowledgeGraphStore.neighbors(nodeId)
        : sparkKnowledgeGraphStore.getGraph(),
      connections: sparkRelationshipService.listConnections(),
    };
  },

  connectEntities(
    connection: Omit<SparkConnection, "id" | "createdAt" | "updatedAt">,
  ): SparkConnection {
    const now = new Date().toISOString();
    return { ...connection, id: `conn-${Date.now()}`, createdAt: now, updatedAt: now };
  },

  prepare(context: SparkPrepareContext = { product: "ecosystem" }): SparkPrepareResult {
    return {
      recommendations: sparkRecommendationService.prepare(context),
      priorities: sparkPriorityService.topPriorities(context.limit ?? 5),
      opportunities: sparkOpportunityService.listOpportunities(),
      risks: sparkRiskService.listRisks(),
    };
  },

  prepareRecommendations(context: SparkPrepareContext = { product: "ecosystem" }) {
    return sparkRecommendationService.prepare(context);
  },

  findPatterns(): SparkPattern[] {
    return sparkPatternService.findPatterns();
  },

  getKnowledgeItems() {
    return sparkKnowledgeService.getKnowledgeItems();
  },

  getSparkOverview(context: SparkPrepareContext = { product: "ecosystem" }): SparkOverview {
    const observed = this.observe();
    const patterns = sparkPatternService.rankImportance();
    const priorities = sparkPriorityService.topPriorities(1);
    const recommendations = sparkRecommendationService.prepare({
      ...context,
      limit: context.limit ?? 10,
    });
    return {
      headline: "SPARK ecosystem intelligence overview",
      sourceCount: observed.sources.length,
      signalCount: observed.signals.length,
      observationCount: observed.observations.length,
      findingCount: observed.findings.length,
      patternCount: observed.patterns.length,
      priorityCount: sparkPriorityService.listPriorities().length,
      recommendationCount: recommendations.length,
      topPatternTitle: patterns[0]?.title,
      topPriorityTitle: priorities[0]?.title,
      preparedAt: new Date().toISOString(),
    };
  },

  /** @deprecated Use getSparkOverview */
  summarize(): SparkOverview {
    return this.getSparkOverview();
  },

  bundle(): SparkIntelligenceBundle {
    const observed = this.observe();
    const prepared = this.prepare();
    const connected = this.connect();
    return {
      sources: observed.sources,
      signals: observed.signals,
      observations: observed.observations,
      findings: observed.findings,
      patterns: observed.patterns,
      themes: observed.themes,
      priorities: prepared.priorities,
      recommendations: prepared.recommendations,
      opportunities: prepared.opportunities,
      risks: prepared.risks,
      knowledge: sparkKnowledgeService.getKnowledgeItems(),
      graph: connected.graph,
    };
  },
};

export type SparkApi = typeof Spark;
