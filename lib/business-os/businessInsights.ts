/**
 * Business OS insights — area summaries, health, and recommended actions.
 */

import {
  ALL_BUSINESS_AREAS,
  businessAreaLabel,
  businessHealthLabel,
} from "./businessAreas";
import type {
  BusinessAction,
  BusinessArea,
  BusinessAreaStatus,
  BusinessAreaSummary,
  BusinessHealthLevel,
  BusinessOpportunityItem,
  BusinessOSSnapshot,
  BusinessRisk,
  FounderLoadLevel,
} from "./types";
import type { BusinessSignalContext, BusinessSignalHit } from "./businessSignals";

export function buildBusinessOSSnapshot(
  context: BusinessSignalContext,
): BusinessOSSnapshot {
  const risks = buildRisks(context.hits);
  const opportunities = buildOpportunities(context.hits);
  const founderLoad = inferFounderLoad(context);
  const businessHealth = inferBusinessHealth(context, risks, founderLoad);
  const businessAreas = buildAreaSummaries(context);
  const recommendedActions = pickRecommendedActions(
    context,
    risks,
    opportunities,
    founderLoad,
  );
  const highestRiskArea = pickHighestRiskArea(risks, businessAreas);

  return {
    businessHealth,
    businessAreas,
    activeRisks: risks,
    activeOpportunities: opportunities,
    recommendedActions,
    founderLoad,
    highestRiskArea,
    createdAt: context.now.toISOString(),
  };
}

function buildRisks(hits: BusinessSignalHit[]): BusinessRisk[] {
  return hits
    .filter((h) => h.kind === "risk" || h.kind === "friction" || h.kind === "capacity")
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 8)
    .map((h) => ({
      id: h.id,
      area: h.area,
      label: h.label,
      reason: h.reason,
      severity: weightToSeverity(h.weight),
    }));
}

function buildOpportunities(
  hits: BusinessSignalHit[],
): BusinessOpportunityItem[] {
  return hits
    .filter((h) => h.kind === "opportunity")
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 6)
    .map((h) => ({
      id: h.id,
      area: h.area,
      label: h.label,
      reason: h.reason,
      impact: weightToImpact(h.weight),
    }));
}

function weightToSeverity(weight: number): BusinessRisk["severity"] {
  if (weight >= 7) return "high";
  if (weight >= 4) return "medium";
  return "low";
}

function weightToImpact(weight: number): BusinessOpportunityItem["impact"] {
  if (weight >= 6) return "high";
  if (weight >= 3) return "medium";
  return "low";
}

function inferFounderLoad(context: BusinessSignalContext): FounderLoadLevel {
  const capacityWeight = context.hits
    .filter((h) => h.kind === "capacity")
    .reduce((sum, h) => sum + h.weight, 0);
  const projectWeight = context.activeProjectCount * 2;
  const total = capacityWeight + projectWeight;

  if (total >= 14) return "critical";
  if (total >= 9) return "high";
  if (total >= 4) return "moderate";
  return "low";
}

function inferBusinessHealth(
  context: BusinessSignalContext,
  risks: BusinessRisk[],
  founderLoad: FounderLoadLevel,
): BusinessHealthLevel {
  if (!context.hits.length) return "unknown";

  const highRisks = risks.filter((r) => r.severity === "high").length;
  if (founderLoad === "critical" || highRisks >= 2) return "overloaded";
  if (founderLoad === "high" || risks.length >= 4) return "needs_attention";
  if (risks.length >= 1) return "stable";
  return "healthy";
}

function buildAreaSummaries(
  context: BusinessSignalContext,
): BusinessAreaSummary[] {
  return ALL_BUSINESS_AREAS.map((area) => {
    const areaHits = context.hits.filter((h) => h.area === area);
    const riskWeight = areaHits
      .filter((h) => h.kind === "risk" || h.kind === "capacity")
      .reduce((s, h) => s + h.weight, 0);
    const status: BusinessAreaStatus =
      riskWeight >= 7
        ? "needs_attention"
        : riskWeight >= 3
          ? "watch"
          : "healthy";

    return {
      area,
      label: businessAreaLabel(area),
      status,
      summary: summarizeArea(area, areaHits, context),
      signalCount: areaHits.length,
    };
  }).filter((a) => a.signalCount > 0 || a.area === "founder_capacity");
}

function summarizeArea(
  area: BusinessArea,
  hits: BusinessSignalHit[],
  context: BusinessSignalContext,
): string {
  switch (area) {
    case "marketing":
      if (context.marketingIdeaCount > 0) {
        return "Marketing has several ideas but no clear current campaign.";
      }
      return hits[0]?.reason ?? "Marketing signals are quiet.";
    case "relationships":
      if (context.followUpCount > 0) {
        const n = context.followUpCount;
        return `There are ${n} possible follow-up${n > 1 ? "s" : ""} worth reviewing.`;
      }
      return hits[0]?.reason ?? "Relationships look steady.";
    case "operations":
      if (context.workflowFrictionCount > 0) {
        return "Repeated setup steps may be ready to become a workflow.";
      }
      return hits[0]?.reason ?? "Operations look manageable.";
    case "founder_capacity":
      if (context.founderBottleneckCount > 0) {
        return "Founder load appears high. Avoid adding a new project today.";
      }
      return "Founder capacity looks manageable.";
    case "projects":
      if (context.activeProjectCount > 0) {
        return "Several projects are active — focus may help more than starting.";
      }
      return hits[0]?.reason ?? "Projects look steady.";
    case "offers":
      if (context.stalledProjectCount > 0) {
        return "Some offers or projects may need a single next step.";
      }
      return hits[0]?.reason ?? "Offers look steady.";
    case "delivery":
      if (context.deliveryLoadCount > 0) {
        return "Delivery load is elevated — protect finish lines.";
      }
      return hits[0]?.reason ?? "Delivery looks steady.";
    case "customer_support":
      if (context.supportFrictionCount > 0) {
        return "User friction is worth reviewing before new features.";
      }
      return hits[0]?.reason ?? "Support signals are quiet.";
    case "finances":
      if (context.revenuePlaceholderCount > 0) {
        return "Revenue opportunities are present but not yet focused.";
      }
      return "Finances look steady.";
    default:
      return hits[0]?.reason ?? `${businessAreaLabel(area)} looks steady.`;
  }
}

function pickHighestRiskArea(
  risks: BusinessRisk[],
  areas: BusinessAreaSummary[],
): BusinessArea | null {
  const topRisk = risks.sort((a, b) => {
    const sev = { high: 3, medium: 2, low: 1 };
    return sev[b.severity] - sev[a.severity];
  })[0];
  if (topRisk) return topRisk.area;

  const watchArea = areas
    .filter((a) => a.status === "needs_attention")
    .sort((a, b) => b.signalCount - a.signalCount)[0];
  return watchArea?.area ?? null;
}

function pickRecommendedActions(
  context: BusinessSignalContext,
  risks: BusinessRisk[],
  opportunities: BusinessOpportunityItem[],
  founderLoad: FounderLoadLevel,
): BusinessAction[] {
  const actions: BusinessAction[] = [];

  if (context.activeProjectCount >= 3) {
    actions.push({
      id: "focus-one-project",
      label: "Pick one project to focus on today",
      reason: "Several active projects — narrowing reduces cognitive load",
      area: "projects",
    });
  }

  if (context.followUpCount > 0) {
    actions.push({
      id: "one-follow-up",
      label: "Follow up with one warm relationship",
      reason: "Small relationship touches often move the business gently",
      area: "relationships",
    });
  }

  if (context.workflowFrictionCount > 0) {
    actions.push({
      id: "workflow-system",
      label: "Turn repeated launch steps into a workflow",
      reason: "Repeated steps are a system waiting to happen",
      area: "operations",
    });
  }

  if (context.stalledProjectCount > 0) {
    actions.push({
      id: "park-ideas",
      label: "Park new ideas until the current project moves forward",
      reason: "A current project needs movement before new scope",
      area: "projects",
    });
  }

  if (context.supportFrictionCount > 0) {
    actions.push({
      id: "review-friction",
      label: "Review user friction before creating new features",
      reason: "Ease existing pain before adding scope",
      area: "customer_support",
    });
  }

  if (context.marketingIdeaCount > 0) {
    actions.push({
      id: "one-offer-focus",
      label: "Pick one offer to focus on",
      reason: "Marketing clarity beats scattered ideas",
      area: "offers",
    });
  }

  if (founderLoad === "high" || founderLoad === "critical") {
    actions.push({
      id: "protect-capacity",
      label: "Protect founder capacity before adding growth tasks",
      reason: "Well-being comes before growth pressure",
      area: "founder_capacity",
    });
  }

  if (!actions.length && opportunities[0]) {
    actions.push({
      id: `opp-${opportunities[0].id}`,
      label: opportunities[0].label,
      reason: opportunities[0].reason,
      area: opportunities[0].area,
    });
  }

  return dedupeActions(actions).slice(0, 3);
}

function dedupeActions(actions: BusinessAction[]): BusinessAction[] {
  const seen = new Set<string>();
  return actions.filter((a) => {
    if (seen.has(a.id)) return false;
    seen.add(a.id);
    return true;
  });
}

export function explainBusinessHealth(snapshot: BusinessOSSnapshot): string {
  const parts = [
    `Health: ${businessHealthLabel(snapshot.businessHealth)}`,
    `Founder load: ${snapshot.founderLoad}`,
    `${snapshot.activeRisks.length} risk(s), ${snapshot.activeOpportunities.length} opportunity signal(s)`,
  ];
  if (snapshot.highestRiskArea) {
    parts.push(`Highest-risk area: ${businessAreaLabel(snapshot.highestRiskArea)}`);
  }
  return parts.join(" · ");
}

export { businessHealthLabel };
