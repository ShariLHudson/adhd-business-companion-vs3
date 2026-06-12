// Founder Ecosystem — Phase 17 Network Insight Engine.
// Trend-based insights — probabilities only.

import type { ID } from "../models";
import { isCohortReady } from "./benchmarkModel";
import type {
  NetworkAggregate,
  NetworkInsight,
  StageBenchmark,
} from "./networkTypes";

let insightSeq = 0;
function insightId(): ID {
  insightSeq += 1;
  return `net-insight-${insightSeq}`;
}

export function generateNetworkInsights(
  aggregate: NetworkAggregate,
  benchmarks: StageBenchmark[],
  cohortReady: boolean,
): NetworkInsight[] {
  const insights: NetworkInsight[] = [];

  for (const driver of aggregate.commonMomentumDrivers.slice(0, 3)) {
    insights.push({
      id: insightId(),
      category: "momentum",
      headline: `Common momentum driver: ${driver.driver}`,
      body: `Roughly ${driver.rate}% of founders in this cohort show this momentum pattern.`,
      probability: driver.rate,
      confidence: driver.rate >= 40 ? "medium" : "low",
    });
  }

  for (const trigger of aggregate.commonOverwhelmTriggers.slice(0, 3)) {
    insights.push({
      id: insightId(),
      category: "overwhelm",
      headline: `Common overwhelm trigger`,
      body: `"${trigger.trigger}" appears in ~${trigger.rate}% of anonymized profiles.`,
      probability: trigger.rate,
      confidence: trigger.rate >= 30 ? "medium" : "low",
    });
  }

  for (const challenge of aggregate.recurringChallenges.slice(0, 4)) {
    insights.push({
      id: insightId(),
      category: "challenge",
      headline: `Common challenge: ${challenge.tag.replace(/^overwhelm:/, "")}`,
      body: `Roughly ${challenge.prevalence}% of founders in this cohort report similar patterns${challenge.typicalStage ? ` (often at the ${challenge.typicalStage} stage)` : ""}.`,
      probability: challenge.prevalence,
      confidence: challenge.founderCount >= 3 ? "medium" : "low",
    });
  }

  for (const behavior of aggregate.highImpactBehaviors.slice(0, 4)) {
    insights.push({
      id: insightId(),
      category: "behavior",
      headline: behavior.framing.split("(")[0]?.trim() ?? behavior.habit,
      body: behavior.framing,
      probability: Math.min(85, 50 + behavior.correlatedProgressLift),
      confidence: behavior.confidence,
    });
  }

  for (const risk of aggregate.stageSpecificRisks.slice(0, 3)) {
    insights.push({
      id: insightId(),
      category: "risk",
      headline: `Stage risk (${risk.stage})`,
      body: `${risk.risk} — observed in ~${risk.prevalence}% of founders at this stage (trend).`,
      probability: risk.prevalence,
      confidence: "medium",
    });
  }

  for (const opp of aggregate.stageSpecificOpportunities.slice(0, 3)) {
    insights.push({
      id: insightId(),
      category: "opportunity",
      headline: `Stage opportunity (${opp.stage})`,
      body: `${opp.opportunity} — seen in ~${opp.prevalence}% of similar-stage founders.`,
      probability: opp.prevalence,
      confidence: "medium",
    });
  }

  for (const warning of aggregate.lowCompletionWarningSigns) {
    if (warning.rate < 10) continue;
    insights.push({
      id: insightId(),
      category: "warning",
      headline: "Low completion warning sign",
      body: `${warning.sign} — ~${warning.rate}% of the cohort (trend).`,
      probability: warning.rate,
      confidence: "low",
    });
  }

  if (cohortReady && benchmarks.length > 0) {
    const sample = benchmarks[0]!;
    insights.push({
      id: insightId(),
      category: "benchmark",
      headline: `Stage benchmark (${sample.stage})`,
      body: `Similar-stage founders complete a median of ${sample.tasksCompletedPerWeek.median} tasks and ${sample.focusSessionsPerWeek.median} focus sessions per week in this cohort.`,
      probability: 60,
      confidence: sample.sampleSize >= 5 ? "high" : "medium",
    });
  }

  return insights;
}

export function networkGuidanceHints(
  aggregate: NetworkAggregate,
  recommendations: { framing: string }[],
): string[] {
  const hints: string[] = [
    "MULTI-FOUNDER NETWORK (aggregated trends only — never cite individual founders):",
  ];

  if (recommendations[0]) {
    hints.push(`• ${recommendations[0].framing}`);
  }

  const topBehavior = aggregate.highImpactBehaviors[0];
  if (topBehavior) {
    hints.push(`• Cohort trend: ${topBehavior.framing}`);
  }

  hints.push("• Frame all network insights as probabilities and trends, never certainties.");
  return hints;
}
