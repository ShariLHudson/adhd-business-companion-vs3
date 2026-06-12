// Founder Ecosystem — Phase 5 Board dashboard selectors.
// Builds the "Founder Board Summary" from the intelligence layer + advisor
// memory. Pure; no UI.

import type { AdvisorId } from "./advisorTypes";
import type { AdvisorMemory } from "./advisorMemory";
import type {
  FounderIntelligence,
  FounderOpportunity,
  FounderRisk,
} from "../intelligence/intelligenceTypes";

export type BoardSummary = {
  mostActiveAdvisor: AdvisorId | null;
  currentRecommendations: { text: string; reason: string }[];
  topRisks: FounderRisk[];
  topOpportunities: FounderOpportunity[];
  recommendedNextActions: string[];
};

const sev = (s: "low" | "medium" | "high") =>
  s === "high" ? 3 : s === "medium" ? 2 : 1;

export function buildBoardSummary(
  intel: FounderIntelligence,
  memory?: AdvisorMemory,
): BoardSummary {
  return {
    mostActiveAdvisor: memory?.mostUsedAdvisors[0]?.advisor ?? null,
    currentRecommendations: intel.recommendations
      .slice(0, 3)
      .map((r) => ({ text: r.text, reason: r.reason })),
    topRisks: intel.risks
      .slice()
      .sort((a, b) => sev(b.severity) - sev(a.severity))
      .slice(0, 3),
    topOpportunities: intel.opportunities
      .filter((o) => o.status !== "completed")
      .slice(0, 3),
    recommendedNextActions: intel.recommendations.slice(0, 3).map((r) => r.text),
  };
}
