// Founder Ecosystem — Phase 4 Founder Intelligence Engine (composer).
//
// One call turns a founder's event stream into the full intelligence object,
// plus dashboard selectors over it. Everything is derived and explainable;
// business/productivity guidance only — no medical, mental-health, legal, or
// financial conclusions.

import type { FounderEvent, ID } from "../events";
import type {
  FounderInsight,
  FounderIntelligence,
  FounderOpportunity,
  FounderPattern,
  FounderRecommendation,
  FounderRisk,
  FounderWin,
} from "./intelligenceTypes";
import { detectPatterns } from "./patternDetection";
import { generateInsights } from "./insightEngine";
import { detectRisks } from "./riskEngine";
import { detectWins } from "./winEngine";
import { detectOpportunities } from "./opportunityEngine";
import { buildFounderMemory } from "./memory";
import { generateRecommendations } from "./recommendationEngine";

export function getFounderIntelligence(
  events: FounderEvent[],
  founderId: ID,
  now: string = new Date().toISOString(),
): FounderIntelligence {
  const mine = events.filter((e) => e.founderId === founderId);

  const patterns = detectPatterns(mine);
  const insights = generateInsights(mine, patterns);
  const risks = detectRisks(mine, now);
  const wins = detectWins(mine);
  const opportunities = detectOpportunities(mine);
  const memory = buildFounderMemory(mine);
  const recommendations = generateRecommendations(mine, {
    patterns,
    risks,
    wins,
    insights,
    memory,
  });

  return {
    patterns,
    insights,
    risks,
    wins,
    opportunities,
    recommendations,
    memory,
  };
}

// ---- Dashboard selectors over the intelligence object -------------------
export function selectRecentInsights(
  intel: FounderIntelligence,
  limit = 5,
): FounderInsight[] {
  return intel.insights.slice(0, limit);
}

export function selectCurrentRisks(intel: FounderIntelligence): FounderRisk[] {
  return intel.risks
    .slice()
    .sort((a, b) => sev(b.severity) - sev(a.severity));
}

export function selectRecentWins(
  intel: FounderIntelligence,
  limit = 8,
): FounderWin[] {
  return intel.wins.slice(0, limit); // already newest-first
}

export function selectOpportunities(
  intel: FounderIntelligence,
): FounderOpportunity[] {
  return intel.opportunities.filter((o) => o.status !== "completed");
}

export function selectRecommendedNextActions(
  intel: FounderIntelligence,
  limit = 3,
): FounderRecommendation[] {
  return intel.recommendations
    .slice()
    .sort((a, b) => sev(b.confidence) - sev(a.confidence))
    .slice(0, limit);
}

export function selectFounderPatterns(
  intel: FounderIntelligence,
): FounderPattern[] {
  return intel.patterns
    .slice()
    .sort((a, b) => sev(b.severity) - sev(a.severity));
}

function sev(s: "low" | "medium" | "high"): number {
  return s === "high" ? 3 : s === "medium" ? 2 : 1;
}
