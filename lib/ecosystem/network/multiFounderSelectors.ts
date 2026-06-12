// Founder Ecosystem — Phase 17 Dashboard selectors.
// Returns safe summary data only — no individual founder identity.

import type { FounderEvent } from "../events";
import type { ID } from "../models";
import { buildCompanionProfile } from "../companion/companionProfile";
import { assertSafeForNetworkExport } from "./privacyGuard";
import { benchmarkLines, isCohortReady } from "./benchmarkModel";
import { COHORT_TOO_SMALL_MESSAGE } from "./multiFounderConfig";
import {
  buildMultiFounderNetwork,
  buildSafeNetworkSummary,
  enrichFounderWithNetwork,
} from "./multiFounderIntelligence";
import type { NetworkDashboard } from "./networkTypes";

export function selectNetworkDashboard(
  events: FounderEvent[],
  founderId: ID,
  cohortIds?: ID[],
  now: Date = new Date(),
): NetworkDashboard {
  const enrichment = enrichFounderWithNetwork(events, founderId, cohortIds, now);
  const network = buildMultiFounderNetwork(
    events,
    cohortIds ?? [...new Set(events.map((e) => e.founderId))],
    now,
  );

  const stageTrends = Object.entries(network.aggregate.stageDistribution).map(
    ([stage, count]) => ({
      stage: stage as NetworkDashboard["stageTrends"][0]["stage"],
      trend: `${count} founders in cohort at ${stage} stage (anonymized aggregate).`,
    }),
  );

  return {
    cohortReady: network.cohortReady,
    benchmarkMessage: network.cohortReady ? null : COHORT_TOO_SMALL_MESSAGE,
    networkBenchmarks: network.cohortReady
      ? benchmarkLines(network.benchmarks)
      : [{ label: "Benchmarks", value: COHORT_TOO_SMALL_MESSAGE }],
    stageTrends,
    commonMomentumDrivers: network.aggregate.commonMomentumDrivers
      .slice(0, 5)
      .map((d) => `${d.driver} (~${d.rate}% of cohort)`),
    commonOverwhelmTriggers: network.aggregate.commonOverwhelmTriggers
      .slice(0, 5)
      .map((t) => `${t.trigger} (~${t.rate}%)`),
    recommendedExperiments: enrichment.recommendations,
    stageSpecificRisks: network.aggregate.stageSpecificRisks,
    stageSpecificOpportunities: network.aggregate.stageSpecificOpportunities,
    insights: enrichment.insights,
  };
}

/** Validates dashboard output contains no PII before display. */
export function isDashboardSafe(dashboard: NetworkDashboard): boolean {
  return assertSafeForNetworkExport(dashboard);
}

/** Confirms network recommendations supplement — not replace — the Digital Twin. */
export function recommendationsRespectDigitalTwin(
  events: FounderEvent[],
  founderId: ID,
): boolean {
  const profile = buildCompanionProfile(
    events.filter((e) => e.founderId === founderId),
    founderId,
  );
  const summary = buildSafeNetworkSummary(events, founderId);
  if (!summary.cohortReady) return true;
  return summary.recommendedExperiments.every(
    (r) => r.doesNotOverrideTwin && r.supportsDigitalTwin,
  ) && profile.founderId === founderId;
}
