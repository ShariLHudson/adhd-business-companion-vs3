/**
 * Aggregate signals from all intelligence modules.
 */

import { buildFounderActivationReport } from "@/lib/activation/founderActivationReporting";
import { buildFounderAdaptiveReport } from "@/lib/adaptive-companion/founderAdaptiveReporting";
import { buildFounderCognitiveLoadReport } from "@/lib/cognitive-load/founderCognitiveLoadReporting";
import { buildFounderDayDesignerReport } from "@/lib/day-designer/founderDayDesignerReporting";
import { buildFounderDecisionReport } from "@/lib/decision-intelligence/founderDecisionReporting";
import { buildFounderBusinessOSReport } from "@/lib/business-os/founderBusinessReporting";
import { buildFounderChiefReport } from "@/lib/chief-of-staff/founderChiefReporting";
import { buildFounderEcosystemReport } from "@/lib/ecosystem-intelligence/founderEcosystemReporting";
import { buildFounderPredictiveReport } from "@/lib/predictive-support/founderPredictiveReporting";
import { buildFounderEnvironmentReport } from "@/lib/environment-intelligence/founderEnvironmentReporting";
import { buildFounderMomentumReport } from "@/lib/momentum-intelligence/founderMomentumReporting";
import { getFutureShariStore } from "@/lib/future-shari/futureStore";
import { buildFounderLoopReport } from "@/lib/loop-intelligence/founderLoopReporting";
import { buildFounderOpportunityReport } from "@/lib/opportunity-intelligence/founderOpportunityReporting";
import { buildFounderRecognitionReport } from "@/lib/recognition/founderReporting";
import { buildFounderRecoveryReport } from "@/lib/recovery-intelligence/founderRecoveryReporting";
import { buildFounderRelationshipReport } from "@/lib/relationship-intelligence/founderRelationshipReporting";
import { buildFounderUserHealthReport } from "@/lib/user-health/founderUserHealthReporting";
import type { BriefingItem } from "./types";

const MS_DAY = 86_400_000;

export type IntelligenceAggregate = {
  userHealth: ReturnType<typeof buildFounderUserHealthReport>;
  cognitiveLoad: ReturnType<typeof buildFounderCognitiveLoadReport>;
  recovery: ReturnType<typeof buildFounderRecoveryReport>;
  activation: ReturnType<typeof buildFounderActivationReport>;
  loops: ReturnType<typeof buildFounderLoopReport>;
  decisions: ReturnType<typeof buildFounderDecisionReport>;
  opportunities: ReturnType<typeof buildFounderOpportunityReport>;
  relationships: ReturnType<typeof buildFounderRelationshipReport>;
  recognition: ReturnType<typeof buildFounderRecognitionReport>;
  adaptive: ReturnType<typeof buildFounderAdaptiveReport>;
  dayDesigner: ReturnType<typeof buildFounderDayDesignerReport>;
  momentum: ReturnType<typeof buildFounderMomentumReport>;
  environment: ReturnType<typeof buildFounderEnvironmentReport>;
  businessOS: ReturnType<typeof buildFounderBusinessOSReport>;
  chiefOfStaff: ReturnType<typeof buildFounderChiefReport>;
  ecosystem: ReturnType<typeof buildFounderEcosystemReport>;
  predictive: ReturnType<typeof buildFounderPredictiveReport>;
  momentumWeekEvents: number;
  futureFriction: { label: string; count: number }[];
  environmentFriction: { label: string; count: number }[];
};

export function gatherIntelligenceReports(now = new Date()): IntelligenceAggregate {
  const since7d = now.getTime() - 7 * MS_DAY;
  const futureStore = getFutureShariStore();
  const futureRecent = futureStore.founderSamples.filter(
    (s) => new Date(s.at).getTime() >= since7d,
  );
  const frictionCounts = new Map<string, number>();
  for (const s of futureRecent) {
    if (s.frictionPoint) {
      frictionCounts.set(
        s.frictionPoint,
        (frictionCounts.get(s.frictionPoint) ?? 0) + 1,
      );
    }
  }

  const momentumReport = buildFounderMomentumReport(now);
  const environmentReport = buildFounderEnvironmentReport(now);

  return {
    userHealth: buildFounderUserHealthReport(now),
    cognitiveLoad: buildFounderCognitiveLoadReport(now),
    recovery: buildFounderRecoveryReport(now),
    activation: buildFounderActivationReport(now),
    loops: buildFounderLoopReport(now),
    decisions: buildFounderDecisionReport(now),
    opportunities: buildFounderOpportunityReport(now),
    relationships: buildFounderRelationshipReport(now),
    recognition: buildFounderRecognitionReport(now),
    adaptive: buildFounderAdaptiveReport(now),
    dayDesigner: buildFounderDayDesignerReport(now),
    momentum: momentumReport,
    environment: environmentReport,
    businessOS: buildFounderBusinessOSReport(now),
    chiefOfStaff: buildFounderChiefReport(now),
    ecosystem: buildFounderEcosystemReport(now),
    predictive: buildFounderPredictiveReport(now),
    momentumWeekEvents: momentumReport.sampleSize,
    futureFriction: [...frictionCounts.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4),
    environmentFriction: environmentReport.frictionPoints.map((p) => ({
      label: p.label,
      count: p.count,
    })),
  };
}

export function buildPriorityCandidates(agg: IntelligenceAggregate): BriefingItem[] {
  const items: BriefingItem[] = [];

  if (agg.userHealth.overloadedCount > 0) {
    items.push({
      id: "health-overload",
      title: "Review overload support flows",
      reason: `${agg.userHealth.overloadedCount} overloaded user signal(s) this week`,
      weight: 8,
      source: "user_health",
    });
  }
  if (agg.decisions.stuckInLoopCount >= 2) {
    items.push({
      id: "decision-fatigue",
      title: "Create content around decision fatigue",
      reason: `${agg.decisions.stuckInLoopCount} stuck decision patterns`,
      weight: 7,
      source: "decision",
    });
  }
  if (agg.loops.emergingLoops.length > 0) {
    const loop = agg.loops.emergingLoops[0]!;
    items.push({
      id: `loop-${loop.type}`,
      title: `Address rising ${loop.label.toLowerCase()} loops`,
      reason: loop.trend === "new" ? "New loop pattern emerging" : "Loop trend rising",
      weight: 7,
      source: "loop",
    });
  }
  if (agg.cognitiveLoad.commonContributors[0]) {
    const c = agg.cognitiveLoad.commonContributors[0];
    items.push({
      id: `load-${c.id}`,
      title: `Investigate ${c.label.toLowerCase()} load trend`,
      reason: `Common cognitive load contributor (${c.count}×)`,
      weight: 6,
      source: "cognitive_load",
    });
  }
  if (agg.activation.commonBlockers[0]) {
    const b = agg.activation.commonBlockers[0];
    items.push({
      id: `activation-${b.type}`,
      title: `Improve ${b.label.toLowerCase()} activation support`,
      reason: `Top activation blocker (${b.count}×)`,
      weight: 6,
      source: "activation",
    });
  }
  if (agg.dayDesigner.commonPlanningBlockers[0]) {
    const b = agg.dayDesigner.commonPlanningBlockers[0];
    items.push({
      id: `day-${b.id}`,
      title: "Simplify day planning friction",
      reason: `${b.label} blocking plans (${b.count}×)`,
      weight: 5,
      source: "day_designer",
    });
  }

  return items;
}

export function buildOpportunityCandidates(agg: IntelligenceAggregate): BriefingItem[] {
  const items: BriefingItem[] = [];

  for (const opp of agg.opportunities.highImpactLowEffort.slice(0, 2)) {
    items.push({
      id: `opp-${opp.title}`,
      title: opp.title,
      reason: `High impact, low effort (${opp.type.replace(/_/g, " ")})`,
      weight: 8,
      source: "opportunity",
    });
  }
  if (agg.opportunities.contentOpportunities > 0) {
    items.push({
      id: "content-opp",
      title: "Content opportunity around user needs",
      reason: `${agg.opportunities.contentOpportunities} content-related signals`,
      weight: 6,
      source: "opportunity",
    });
  }
  if (agg.loops.contentOpportunities.length > 0) {
    items.push({
      id: "loop-content",
      title: agg.loops.contentOpportunities[0]!,
      reason: "Loop intelligence content angle",
      weight: 6,
      source: "loop",
    });
  }
  if (agg.relationships.followUpOpportunities.length > 0) {
    items.push({
      id: "rel-followup",
      title: "Relationship follow-up opportunity",
      reason: `${agg.relationships.followUpOpportunities.length} follow-up(s) tracked`,
      weight: 5,
      source: "relationship",
    });
  }
  if (agg.dayDesigner.sampleSize >= 3) {
    items.push({
      id: "planning-demand",
      title: "High demand for planning support",
      reason: `${agg.dayDesigner.plansCreated} day plans created`,
      weight: 5,
      source: "day_designer",
    });
  }

  return items;
}

export function buildRiskCandidates(agg: IntelligenceAggregate): BriefingItem[] {
  const items: BriefingItem[] = [];

  if (agg.recovery.burnoutRiskCount > 0) {
    items.push({
      id: "burnout-risk",
      title: "Burnout risk increasing",
      reason: `${agg.recovery.burnoutRiskCount} burnout/depleted signal(s)`,
      weight: 9,
      source: "recovery",
    });
  }
  if (agg.recovery.decliningEnergyCount > 0) {
    items.push({
      id: "declining-energy",
      title: "Declining energy trends",
      reason: `${agg.recovery.decliningEnergyCount} declining energy sample(s)`,
      weight: 7,
      source: "recovery",
    });
  }
  for (const line of agg.recovery.recoveryImprovements) {
    items.push({
      id: `recovery-${line.slice(0, 24)}`,
      title: line,
      reason: "Recovery intelligence trend",
      weight: 6,
      source: "recovery",
    });
  }
  if (agg.loops.loadTrend === "rising") {
    items.push({
      id: "loops-rising",
      title: "Loop patterns increasing",
      reason: "More loop observations this week",
      weight: 6,
      source: "loop",
    });
  }
  const researchLoop = agg.loops.commonLoopTypes.find(
    (l) => l.type === "research_loop" || l.type === "planning_loop",
  );
  if (researchLoop && researchLoop.count >= 2) {
    items.push({
      id: "research-loops",
      title: "Research/planning loops increasing",
      reason: `${researchLoop.label} (${researchLoop.count}×)`,
      weight: 6,
      source: "loop",
    });
  }
  if (agg.userHealth.disengagingCount > 0) {
    items.push({
      id: "disengaging",
      title: "Disengagement signals present",
      reason: `${agg.userHealth.disengagingCount} disengaging sample(s)`,
      weight: 5,
      source: "user_health",
    });
  }
  if (agg.decisions.parkedCount > agg.decisions.resolvedCount) {
    items.push({
      id: "unresolved-decisions",
      title: "Unresolved decisions parked",
      reason: `${agg.decisions.parkedCount} parked vs ${agg.decisions.resolvedCount} resolved`,
      weight: 5,
      source: "decision",
    });
  }

  return items;
}

export function buildWinCandidates(agg: IntelligenceAggregate): BriefingItem[] {
  const items: BriefingItem[] = [];

  if (agg.userHealth.recoveringCount > 0) {
    items.push({
      id: "recovering-users",
      title: "Users recovering momentum",
      reason: `${agg.userHealth.recoveringCount} recovering sample(s)`,
      weight: 6,
      source: "user_health",
    });
  }
  if (agg.momentumWeekEvents >= 3) {
    items.push({
      id: "momentum-events",
      title: "Momentum building",
      reason: `${agg.momentumWeekEvents} movement events this week`,
      weight: 6,
      source: "momentum",
    });
  }
  if (agg.cognitiveLoad.loadTrend === "easing") {
    items.push({
      id: "load-easing",
      title: "Cognitive load easing",
      reason: "Average load trending down",
      weight: 5,
      source: "cognitive_load",
    });
  }
  if (agg.activation.stuckOrFrozenCount === 0 && agg.activation.sampleSize > 0) {
    items.push({
      id: "activation-success",
      title: "Increased activation success",
      reason: "No stuck/frozen activation samples this week",
      weight: 5,
      source: "activation",
    });
  }
  if (agg.decisions.resolvedCount > 0) {
    items.push({
      id: "decisions-resolved",
      title: "Decisions moving forward",
      reason: `${agg.decisions.resolvedCount} decision(s) resolved`,
      weight: 4,
      source: "decision",
    });
  }
  if (
    (agg.recognition.eventsSentLast30Days.project_milestone ?? 0) > 0 ||
    (agg.recognition.eventsSentLast30Days.business_milestone ?? 0) > 0 ||
    (agg.recognition.eventsSentLast30Days.conversation_milestone ?? 0) > 0
  ) {
    items.push({
      id: "milestones",
      title: "Recognition milestones landing",
      reason: "Users celebrating progress",
      weight: 4,
      source: "recognition",
    });
  }

  return items;
}

export function buildRecommendationCandidates(
  agg: IntelligenceAggregate,
): string[] {
  const recs = [
    agg.recovery.recommendedFounderAction,
    agg.decisions.recommendedFounderAction,
    agg.loops.recommendedFounderAction,
    agg.opportunities.recommendedFounderAction,
    agg.userHealth.recommendedFounderAction,
    agg.activation.recommendedFounderAction,
    agg.dayDesigner.recommendedFounderAction,
    agg.relationships.recommendedFounderAction,
    agg.momentum.recommendedFounderAction,
    agg.environment.recommendedFounderAction,
    agg.businessOS.recommendedFounderAction,
    agg.chiefOfStaff.recommendedFounderAction,
    agg.ecosystem.recommendedSystemImprovement,
    agg.predictive.recommendedFounderAction,
  ].filter(Boolean);

  return [...new Set(recs)];
}
