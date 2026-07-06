import type {
  DiscoveredOpportunity,
  Opportunity,
  OpportunityDiscoveryFilter,
  OpportunityExecutiveFilter,
  OpportunityExecutiveSummary,
  OpportunityGroup,
} from "../types";
import { labelForCategory, labelForExecutiveFilter } from "../categories/opportunityCategories";
import {
  compareOpportunityScores,
  isHighImpact,
  isQuickWin,
  isStrategicBet,
  needsResearch,
} from "../scoring/opportunityScoring";
import { opportunitySampleRepository } from "../repositories/sample";
import { rankOpportunities } from "../ranking/opportunityRanking";

function enrich(opportunity: Opportunity): DiscoveredOpportunity {
  return {
    ...opportunity,
    signals: opportunitySampleRepository.signalsFor(opportunity.id),
    evidence: opportunitySampleRepository.evidenceFor(opportunity.id),
    recommendations: opportunitySampleRepository.recommendationsFor(opportunity.id),
    risks: opportunitySampleRepository.risksFor(opportunity.id),
  };
}

function matchesExecutiveFilter(
  opportunity: DiscoveredOpportunity,
  filter: OpportunityExecutiveFilter,
): boolean {
  switch (filter) {
    case "high-impact":
      return isHighImpact(opportunity.score);
    case "quick-win":
      return isQuickWin(opportunity.score);
    case "long-term-bet":
      return isStrategicBet(opportunity.score);
    case "needs-research":
      return needsResearch(opportunity.confidence.score);
    case "watch":
      return opportunity.status === "watch";
    case "ignore":
      return opportunity.status === "ignored";
    default:
      return true;
  }
}

function matchesFilter(
  opportunity: DiscoveredOpportunity,
  filter: OpportunityDiscoveryFilter = {},
): boolean {
  if (filter.category && opportunity.category !== filter.category) return false;
  if (filter.missionId && !opportunity.missionIds.includes(filter.missionId)) return false;
  if (filter.status && opportunity.status !== filter.status) return false;
  if (filter.minComposite !== undefined && opportunity.score.composite < filter.minComposite) {
    return false;
  }
  if (
    filter.executiveFilter &&
    !matchesExecutiveFilter(opportunity, filter.executiveFilter)
  ) {
    return false;
  }
  return true;
}

export function discover(filter: OpportunityDiscoveryFilter = {}): DiscoveredOpportunity[] {
  return opportunitySampleRepository
    .list()
    .map(enrich)
    .filter((o) => matchesFilter(o, filter));
}

export function findEmerging(): DiscoveredOpportunity[] {
  return discover({ status: "emerging" });
}

export function findHidden(): DiscoveredOpportunity[] {
  return discover()
    .filter(
      (o) =>
        o.tags.includes("hidden") ||
        (o.score.composite >= 75 && o.confidence.score < 70),
    )
    .sort((a, b) => compareOpportunityScores(a.score, b.score));
}

export function findRecurring(): DiscoveredOpportunity[] {
  return discover().filter((o) => o.signals.length >= 2);
}

export function findIgnored(): DiscoveredOpportunity[] {
  return discover({ status: "ignored" });
}

export function group(
  opportunities: DiscoveredOpportunity[],
  by: "category" | "executive-filter" = "category",
): OpportunityGroup[] {
  if (by === "category") {
    const categories = new Set(opportunities.map((o) => o.category));
    return [...categories].map((category) => ({
      id: `group-${category}`,
      label: labelForCategory(category),
      filter: category,
      opportunities: opportunities.filter((o) => o.category === category),
    }));
  }

  const filters: OpportunityExecutiveFilter[] = [
    "high-impact",
    "quick-win",
    "long-term-bet",
    "needs-research",
    "watch",
    "ignore",
  ];

  return filters
    .map((executiveFilter) => ({
      id: `group-${executiveFilter}`,
      label: labelForExecutiveFilter(executiveFilter),
      filter: executiveFilter,
      opportunities: opportunities.filter((o) => matchesExecutiveFilter(o, executiveFilter)),
    }))
    .filter((g) => g.opportunities.length > 0);
}

export function prepareExecutiveSummary(
  opportunities: DiscoveredOpportunity[] = discover(),
): OpportunityExecutiveSummary {
  const ranked = rankOpportunities(opportunities);
  const top = ranked.slice(0, 3);

  return {
    headline: "What you may not know yet",
    narrative:
      top.length > 0
        ? `${top[0].title} connects signals others would miss — ${top[0].reasoning.whyNow}`
        : "Discovery layer ready — opportunities will surface as signals accumulate.",
    topOpportunities: top,
    emergingCount: opportunities.filter((o) => o.status === "emerging").length,
    hiddenCount: findHidden().length,
    quickWinCount: opportunities.filter((o) => isQuickWin(o.score)).length,
    strategicBetCount: opportunities.filter((o) => isStrategicBet(o.score)).length,
    generatedAt: new Date().toISOString(),
  };
}
