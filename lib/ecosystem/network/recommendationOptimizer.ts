// Founder Ecosystem — Phase 17 Recommendation Optimizer.
// Improves suggestions using aggregate trends — never overrides Digital Twin.

import type { CompanionProfile } from "../companion/companionTypes";
import type { ID } from "../models";
import { MULTI_FOUNDER_CONFIG } from "./multiFounderConfig";
import {
  benchmarkSummaryLine,
  compareFounderToBenchmarks,
  isCohortReady,
} from "./benchmarkModel";
import type {
  AnonymizedFounderSnapshot,
  NetworkAggregate,
  OptimizedRecommendation,
  StageBenchmark,
} from "./networkTypes";

let recSeq = 0;
function recId(): ID {
  recSeq += 1;
  return `net-rec-${recSeq}`;
}

const HABIT_LABELS: Record<string, string> = {
  "monday-batching": "batching campaign and launch tasks early in the week",
  "morning-focus": "scheduling deep work in morning focus blocks",
  "time-blocking": "protecting calendar time blocks before reactive work",
  "automation-adoption": "using approved automations consistently",
  "scripted-outreach-block": "a short scripted outreach block (about 15 minutes)",
};

export function usesForbiddenLanguage(text: string): boolean {
  return MULTI_FOUNDER_CONFIG.userFacingLanguage.forbidden.some((phrase) =>
    text.toLowerCase().includes(phrase.toLowerCase()),
  );
}

export function usesTrendLanguage(text: string): boolean {
  return /\b(may|might|often|trend|similar|consider|worth trying|not a certainty|not a guarantee)\b/i.test(
    text,
  );
}

function wrapFraming(body: string): string {
  if (usesForbiddenLanguage(body)) {
    return `Based on similar workflows, you might consider this approach — ${body}`;
  }
  if (!usesTrendLanguage(body)) {
    return `One pattern we see is that ${body.charAt(0).toLowerCase()}${body.slice(1)} (trend, not a certainty).`;
  }
  return body;
}

export function optimizeRecommendations(
  snapshot: AnonymizedFounderSnapshot,
  aggregate: NetworkAggregate,
  benchmarks: StageBenchmark[],
  profile?: CompanionProfile | null,
): OptimizedRecommendation[] {
  const recs: OptimizedRecommendation[] = [];
  const cohortReady = isCohortReady(aggregate.cohortSize);
  const comparisons = compareFounderToBenchmarks(snapshot, benchmarks, cohortReady);

  if (snapshot.challengeTags.includes("lead-follow-up") || snapshot.challengeTags.includes("sales-follow-up")) {
    const outreach = aggregate.highImpactBehaviors.find(
      (b) => b.habit === "scripted-outreach-block" || b.habit === "time-blocking",
    );
    recs.push({
      id: recId(),
      strategy: "Try a short scripted outreach block",
      rationale:
        "Similar founders complete more follow-up when the task is time-boxed and scripted.",
      expectedLift: outreach?.correlatedProgressLift ?? null,
      probability: 62,
      framing: wrapFraming(
        "You may want to try a short scripted outreach block. Founders at a similar stage often complete follow-up more consistently when the task is time-boxed and scripted.",
      ),
      whyShown: "Your pattern suggests follow-up friction; the network shows higher completion with time-boxed outreach.",
      supportsDigitalTwin: true,
      doesNotOverrideTwin: true,
    });
  }

  if (snapshot.challengeTags.includes("campaign-launch-delay")) {
    const monday = aggregate.highImpactBehaviors.find((b) => b.habit === "monday-batching");
    if (monday) {
      recs.push({
        id: recId(),
        strategy: "Batch campaign tasks early in the week",
        rationale: monday.framing,
        expectedLift: monday.correlatedProgressLift,
        probability: Math.min(75, 45 + monday.correlatedProgressLift),
        framing: wrapFraming(
          `Based on trends from similar founders, batching campaign tasks early in the week may improve completion (roughly ${monday.correlatedProgressLift}% progress lift in this cohort — not a certainty).`,
        ),
        whyShown: "Network trend: monday-batching correlates with higher completion among similar founders.",
        supportsDigitalTwin: true,
        doesNotOverrideTwin: true,
      });
    }
  }

  for (const behavior of aggregate.highImpactBehaviors) {
    if (snapshot.productivityHabits.includes(behavior.habit)) continue;
    if (behavior.correlatedProgressLift < 15) continue;
    const label = HABIT_LABELS[behavior.habit] ?? behavior.habit;
    recs.push({
      id: recId(),
      strategy: `Experiment with ${label}`,
      rationale: behavior.framing,
      expectedLift: behavior.correlatedProgressLift,
      probability: Math.min(70, 40 + behavior.correlatedProgressLift),
      framing: wrapFraming(
        `Founders at a similar stage often benefit from ${label} — worth a one-week experiment.`,
      ),
      whyShown: `Cohort trend: ${behavior.habit} correlates with higher weekly progress.`,
      supportsDigitalTwin: true,
      doesNotOverrideTwin: true,
    });
  }

  for (const cmp of comparisons.filter((c) => c.deviation === "below").slice(0, 2)) {
    recs.push({
      id: recId(),
      strategy: `Improve ${cmp.metric}`,
      rationale: cmp.coachingNote,
      expectedLift: null,
      probability: 55,
      framing: wrapFraming(cmp.coachingNote),
      whyShown: `Your ${cmp.metric} is below the similar-stage median in the anonymized cohort.`,
      supportsDigitalTwin: true,
      doesNotOverrideTwin: true,
    });
  }

  const summary = benchmarkSummaryLine(snapshot, benchmarks, cohortReady);
  if (summary && recs.length === 0) {
    recs.push({
      id: recId(),
      strategy: "Use stage benchmarks as context",
      rationale: summary,
      expectedLift: null,
      probability: 50,
      framing: wrapFraming(summary),
      whyShown: "Stage benchmark available for context.",
      supportsDigitalTwin: true,
      doesNotOverrideTwin: true,
    });
  }

  if (profile?.decisionStyle.value === "avoidant" && recs.length > 0) {
    recs[0] = {
      ...recs[0]!,
      framing: `${recs[0]!.framing} This is a suggestion alongside your existing preferences — not a replacement.`,
    };
  }

  return recs.slice(0, 5).filter((r) => !usesForbiddenLanguage(r.framing));
}
