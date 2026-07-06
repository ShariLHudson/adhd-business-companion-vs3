import type {
  SparkConnection,
  SparkIntelligenceBundle,
  SparkPrepareContext,
  SparkSummary,
} from "../types";
import { observationService } from "../observations/observationService";
import { patternEngine } from "../patterns/patternEngine";
import { priorityService } from "../priorities/priorityService";
import { recommendationPreparationService } from "../recommendations/recommendationPreparationService";
import { knowledgeGraph } from "../knowledge/knowledgeService";
import { relationshipService } from "../relationships/relationshipEngine";
import { scoringEngine, type SparkScoringInput } from "../scoring/scoringEngine";
import { signalService } from "../signals/signalService";
import { opportunityService } from "../opportunities/opportunityService";
import { riskService } from "../risks/riskService";
import { knowledgeService } from "../knowledge/knowledgeService";

export type SparkObserveResult = {
  signals: ReturnType<typeof signalService.listSignals>;
  observations: ReturnType<typeof observationService.listObservations>;
  patterns: ReturnType<typeof patternEngine.findPatterns>;
  themes: ReturnType<typeof patternEngine.identifyThemes>;
};

export type SparkConnectResult = {
  lineage: ReturnType<typeof relationshipService.buildLineageRelationship>;
  graph: ReturnType<typeof knowledgeGraph.getGraph>;
};

export type SparkPrepareResult = {
  recommendations: ReturnType<typeof recommendationPreparationService.prepare>;
  priorities: ReturnType<typeof priorityService.topPriorities>;
  opportunities: ReturnType<typeof opportunityService.listOpportunities>;
  risks: ReturnType<typeof riskService.listRisks>;
};

/**
 * SPARK™ public API — ecosystem intelligence OS.
 * No UI. No product-specific logic. Consumed by Companion, Founder, PostCraft, Team Hub, FLAME, FIRE.
 */
export const Spark = {
  observe(): SparkObserveResult {
    return {
      signals: signalService.listSignals(),
      observations: observationService.listObservations(),
      patterns: patternEngine.findPatterns(),
      themes: patternEngine.identifyThemes(),
    };
  },

  score(input: SparkScoringInput) {
    return scoringEngine.score(input);
  },

  prioritize(limit = 5) {
    return priorityService.topPriorities(limit);
  },

  connect(nodeId?: string): SparkConnectResult {
    return {
      lineage: relationshipService.buildLineageRelationship(),
      graph: nodeId ? knowledgeGraph.neighbors(nodeId) : knowledgeGraph.getGraph(),
    };
  },

  connectEntities(connection: Omit<SparkConnection, "id" | "notedAt">): SparkConnection {
    return {
      ...connection,
      id: `conn-${Date.now()}`,
      notedAt: new Date().toISOString(),
    };
  },

  prepare(context: SparkPrepareContext = { product: "ecosystem" }): SparkPrepareResult {
    return {
      recommendations: recommendationPreparationService.prepare(context),
      priorities: priorityService.topPriorities(context.limit ?? 5),
      opportunities: opportunityService.listOpportunities(),
      risks: riskService.listRisks(),
    };
  },

  summarize(): SparkSummary {
    const observed = this.observe();
    const top = priorityService.topPriorities(1)[0];
    return {
      headline: "SPARK intelligence snapshot",
      observationCount: observed.observations.length,
      patternCount: observed.patterns.length,
      topPriorityTitle: top?.title,
      preparedAt: new Date().toISOString(),
    };
  },

  bundle(): SparkIntelligenceBundle {
    const observed = this.observe();
    const prepared = this.prepare();
    const connected = this.connect();
    return {
      signals: observed.signals,
      observations: observed.observations,
      patterns: observed.patterns,
      themes: observed.themes,
      priorities: prepared.priorities,
      recommendations: prepared.recommendations,
      opportunities: prepared.opportunities,
      risks: prepared.risks,
      knowledge: knowledgeService.listKnowledge(),
      graph: connected.graph,
    };
  },
};

export type SparkApi = typeof Spark;
