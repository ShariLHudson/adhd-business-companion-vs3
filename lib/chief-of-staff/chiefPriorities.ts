/**
 * Chief of Staff priorities — what matters, what to ignore, where attention goes.
 */

import type {
  ChiefAssessmentLevel,
  ChiefFounderCapacity,
  ChiefOfStaffSnapshot,
  ChiefProjectAttention,
} from "./types";
import type { ChiefSignalContext } from "./chiefSignals";

export function inferOverallAssessment(
  context: ChiefSignalContext,
): ChiefAssessmentLevel {
  const { businessOS } = context;
  if (
    businessOS.founderLoad === "critical" ||
    businessOS.businessHealth === "overloaded" ||
    context.recoveryStrained
  ) {
    return "critical";
  }
  if (
    businessOS.founderLoad === "high" ||
    businessOS.businessHealth === "needs_attention"
  ) {
    return "overloaded";
  }
  if (
    context.activeProjects.length >= 3 ||
    context.newOpportunityCount >= 4 ||
    context.decisionFatigue
  ) {
    return "stretched";
  }
  if (businessOS.businessHealth === "stable" && context.activeProjects.length <= 2) {
    return "focused";
  }
  if (businessOS.businessHealth === "healthy") {
    return "calm";
  }
  return "focused";
}

export function inferFounderCapacity(
  context: ChiefSignalContext,
): ChiefFounderCapacity {
  if (context.recoveryStrained) return "depleted";
  if (context.businessOS.founderLoad === "high" || context.businessOS.founderLoad === "critical") {
    return "strained";
  }
  if (context.businessOS.founderLoad === "moderate" || context.momentumStalled) {
    return "limited";
  }
  return "available";
}

export function pickBiggestRisk(context: ChiefSignalContext): string {
  const top = context.businessOS.activeRisks[0];
  if (top) return `${top.label} — ${top.reason}`;
  if (context.briefingRisks[0]) return context.briefingRisks[0];
  if (context.recoveryStrained) {
    return "Founder energy is strained — protect recovery before growth.";
  }
  return "No urgent risks detected — keep pace gentle.";
}

export function pickBiggestOpportunity(context: ChiefSignalContext): string {
  const top = context.businessOS.activeOpportunities[0];
  if (top) return `${top.label} — ${top.reason}`;
  if (context.followUpCount > 0) {
    return `Warm relationship follow-up (${context.followUpCount} possible)`;
  }
  if (context.briefingOpportunities[0]) return context.briefingOpportunities[0];
  return "Small consistent steps may matter more than a big new push.";
}

export function pickRecommendedFocus(context: ChiefSignalContext): string {
  if (context.briefingPriorities[0]) return context.briefingPriorities[0];
  const action = context.businessOS.recommendedActions[0];
  if (action) return action.label;
  const focusProject = context.activeProjects.find(
    (p) => p.status === "active-focus" || p.horizon === "now",
  );
  if (focusProject) return `Move "${focusProject.name}" one step forward`;
  return "One meaningful step on your most active work";
}

export function pickProjectsNeedingAttention(
  context: ChiefSignalContext,
): ChiefProjectAttention[] {
  const out: ChiefProjectAttention[] = [];

  for (const p of context.activeProjects) {
    if (p.horizon !== "now") continue;
    if (p.status === "active-focus" || p.status === "in-progress") {
      out.push({
        id: p.id,
        name: p.name,
        reason:
          p.status === "active-focus"
            ? "Active focus — protect finish line"
            : "In progress — needs a clear next step",
      });
    }
  }

  if (!out.length && context.businessOS.activeRisks[0]) {
    out.push({
      id: "risk-focus",
      name: context.businessOS.activeRisks[0].label,
      reason: context.businessOS.activeRisks[0].reason,
    });
  }

  return out.slice(0, 4);
}

export function pickProjectsToIgnore(context: ChiefSignalContext): string[] {
  const ignore: string[] = [];

  if (context.newOpportunityCount >= 2) {
    ignore.push("New opportunity ideas until current work moves");
  }
  if (context.activeProjects.filter((p) => p.horizon === "later").length > 0) {
    ignore.push("Parked / later projects");
  }
  if (context.businessOS.businessHealth !== "healthy") {
    ignore.push("Redesign ideas");
    ignore.push("Future feature requests");
  }
  if (context.decisionFatigue) {
    ignore.push("Low-priority content ideas");
  }
  const marketingFriction = context.businessOS.businessAreas.find(
    (a) => a.area === "marketing" && a.status !== "healthy",
  );
  if (marketingFriction) {
    ignore.push("Starting a new marketing campaign");
  }

  const laterProjects = context.activeProjects
    .filter((p) => p.horizon === "later")
    .map((p) => p.name);
  ignore.push(...laterProjects.slice(0, 2));

  if (!ignore.length) {
    ignore.push("Side quests that don't serve this week's focus");
  }

  return [...new Set(ignore)].slice(0, 5);
}

export function buildChiefSnapshot(context: ChiefSignalContext): ChiefOfStaffSnapshot {
  return {
    overallAssessment: inferOverallAssessment(context),
    founderCapacity: inferFounderCapacity(context),
    biggestRisk: pickBiggestRisk(context),
    biggestOpportunity: pickBiggestOpportunity(context),
    recommendedFocus: pickRecommendedFocus(context),
    recommendedActions: [], // filled by chiefRecommendations
    projectsNeedingAttention: pickProjectsNeedingAttention(context),
    projectsToIgnore: pickProjectsToIgnore(context),
    createdAt: context.now.toISOString(),
  };
}
