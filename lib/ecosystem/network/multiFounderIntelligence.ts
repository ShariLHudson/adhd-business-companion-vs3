// Founder Ecosystem — Phase 17 Multi-Founder Intelligence Network.
// Orchestrates anonymized aggregation, benchmarks, and adaptive guidance.
// Never overwrites individual Digital Twins — only informs recommendations.

import type { FounderEvent } from "../events";
import type { ID } from "../models";
import type { CompanionProfile } from "../companion/companionTypes";
import type { FounderAction } from "../actions/actionTypes";
import type { Level } from "../dashboardTypes";
import {
  aggregateSnapshots,
  extractAnonymizedSnapshot,
  extractCohortSnapshots,
} from "./aggregationEngine";
import {
  benchmarkSummaryLine,
  buildStageBenchmarks,
  compareFounderToBenchmarks,
  isCohortReady,
} from "./benchmarkModel";
import { COHORT_TOO_SMALL_MESSAGE } from "./multiFounderConfig";
import { generateNetworkInsights, networkGuidanceHints } from "./networkInsights";
import { assertSafeForNetworkExport } from "./privacyGuard";
import { optimizeRecommendations } from "./recommendationOptimizer";
import { buildCompanionProfile } from "../companion/companionProfile";
import type {
  MultiFounderNetwork,
  NetworkEnrichment,
  SafeNetworkSummary,
} from "./networkTypes";

export type { NetworkEnrichment };

/** Build the full anonymized network from a multi-founder event stream. */
export function buildMultiFounderNetwork(
  events: FounderEvent[],
  founderIds: ID[],
  now: Date = new Date(),
): MultiFounderNetwork {
  const snapshots = extractCohortSnapshots(events, founderIds, now);
  const cohortReady = isCohortReady(snapshots.length);
  const aggregate = aggregateSnapshots(snapshots, now);
  const benchmarks = buildStageBenchmarks(snapshots, snapshots.length);

  return {
    aggregate,
    benchmarks,
    cohortReady,
    _snapshots: snapshots,
  };
}

/** Enrich guidance for one founder using aggregated network data. */
export function enrichFounderWithNetwork(
  events: FounderEvent[],
  founderId: ID,
  networkOrCohort?: MultiFounderNetwork | ID[],
  now: Date = new Date(),
): NetworkEnrichment {
  const network = Array.isArray(networkOrCohort)
    ? buildMultiFounderNetwork(events, networkOrCohort.includes(founderId) ? networkOrCohort : [...networkOrCohort, founderId], now)
    : (networkOrCohort ?? buildMultiFounderNetwork(
        events,
        [...new Set(events.map((e) => e.founderId))],
        now,
      ));

  const snapshot = extractAnonymizedSnapshot(events, founderId, now);
  const profile = buildCompanionProfile(
    events.filter((e) => e.founderId === founderId),
    founderId,
  );

  const recommendations = optimizeRecommendations(
    snapshot,
    network.aggregate,
    network.benchmarks,
    profile,
  );
  const insights = generateNetworkInsights(
    network.aggregate,
    network.benchmarks,
    network.cohortReady,
  );
  const benchmarks = compareFounderToBenchmarks(
    snapshot,
    network.benchmarks,
    network.cohortReady,
  );

  return {
    snapshot,
    insights,
    recommendations,
    benchmarks,
    guidanceHints: networkGuidanceHints(network.aggregate, recommendations),
    benchmarkSummary: benchmarkSummaryLine(snapshot, network.benchmarks, network.cohortReady),
    cohortReady: network.cohortReady,
  };
}

export function getNetworkEnrichmentForFounder(
  events: FounderEvent[],
  founderId: ID,
  cohortIds?: ID[],
  now: Date = new Date(),
): NetworkEnrichment {
  const ids =
    cohortIds ??
    [...new Set(events.map((e) => e.founderId))];
  const allIds = ids.includes(founderId) ? ids : [...ids, founderId];
  return enrichFounderWithNetwork(events, founderId, allIds, now);
}

/** Final success-test shape — safe for export, no individual data. */
export function buildSafeNetworkSummary(
  events: FounderEvent[],
  founderId: ID,
  cohortIds?: ID[],
  now: Date = new Date(),
): SafeNetworkSummary {
  const enrichment = getNetworkEnrichmentForFounder(events, founderId, cohortIds, now);
  const network = buildMultiFounderNetwork(
    events,
    cohortIds ?? [...new Set(events.map((e) => e.founderId))],
    now,
  );

  const summary: SafeNetworkSummary = {
    benchmarks: network.cohortReady
      ? network.benchmarks
      : { message: COHORT_TOO_SMALL_MESSAGE },
    networkInsights: enrichment.insights,
    recommendedExperiments: enrichment.recommendations,
    stageSpecificRisks: network.aggregate.stageSpecificRisks,
    stageSpecificOpportunities: network.aggregate.stageSpecificOpportunities,
    cohortReady: network.cohortReady,
  };

  if (!assertSafeForNetworkExport(summary)) {
    return {
      benchmarks: { message: COHORT_TOO_SMALL_MESSAGE },
      networkInsights: [],
      recommendedExperiments: [],
      stageSpecificRisks: [],
      stageSpecificOpportunities: [],
      cohortReady: false,
    };
  }

  return summary;
}

function scoreToPriority(probability: number): Level {
  if (probability >= 65) return "high";
  if (probability >= 45) return "medium";
  return "low";
}

export function enrichActionsWithNetwork(
  actions: FounderAction[],
  enrichment: NetworkEnrichment,
): FounderAction[] {
  const boostTitles = new Set(
    enrichment.recommendations
      .filter((r) => (r.probability ?? 0) >= 55)
      .map((r) => r.strategy.toLowerCase()),
  );

  const priorityOrder: Record<Level, number> = { high: 0, medium: 1, low: 2 };

  return [...actions]
    .map((a) => {
      const match = [...boostTitles].some(
        (t) =>
          a.title.toLowerCase().includes(t.slice(0, 12)) ||
          t.includes(a.title.toLowerCase().slice(0, 8)),
      );
      if (!match) return a;
      const priority = scoreToPriority(enrichment.recommendations[0]?.probability ?? 55);
      return { ...a, priority };
    })
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}

export function multiFounderPromptHints(
  profile: CompanionProfile | null,
  enrichment: NetworkEnrichment,
): string[] {
  const hints = [...enrichment.guidanceHints];
  if (profile?.planningStyle.value === "spontaneous") {
    hints.push("• This founder prefers spontaneity — offer one network-backed experiment, not a rigid plan.");
  }
  if (enrichment.benchmarkSummary && enrichment.benchmarkSummary !== COHORT_TOO_SMALL_MESSAGE) {
    hints.push(`• Benchmark context: ${enrichment.benchmarkSummary}`);
  }
  return hints;
}

export function publicNetworkView(network: MultiFounderNetwork) {
  return {
    generatedAt: network.aggregate.generatedAt,
    cohortSize: network.aggregate.cohortSize,
    cohortReady: network.cohortReady,
    stageDistribution: network.aggregate.stageDistribution,
    recurringChallenges: network.aggregate.recurringChallenges,
    highImpactBehaviors: network.aggregate.highImpactBehaviors,
    rareStrategies: network.aggregate.rareStrategies,
    benchmarks: network.cohortReady ? network.benchmarks : [],
    benchmarkMessage: network.cohortReady ? null : COHORT_TOO_SMALL_MESSAGE,
  };
}

// Re-export for backward compatibility
export { optimizeRecommendations as suggestNetworkStrategies } from "./recommendationOptimizer";
