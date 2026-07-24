import type { StrategyWorkItem } from "../../types";
import type { StrategicRisk } from "../optionContract";
import type { RiskAssessment } from "../types";
import { assessReversibility } from "./reversibility";

function toAssessment(risk: StrategicRisk): RiskAssessment {
  const likelihoodMap = {
    low: "low" as const,
    moderate: "medium" as const,
    high: "high" as const,
    unknown: "unknown" as const,
  };
  return {
    whatCouldHappen: risk.description,
    whyItMatters:
      risk.whyItMatters ||
      "It could affect trust, capacity, or the outcome you want.",
    likelihood: likelihoodMap[risk.likelihood],
    mitigation: risk.mitigations[0],
    earlyWarning: risk.warningSigns[0],
    reversibility: risk.reversibility,
  };
}

/** Proportionate StrategicRisk list — only the most meaningful risks. */
export function buildStrategicRisks(item: StrategyWorkItem): StrategicRisk[] {
  const fromItem = (item.risks ?? []).slice(0, 2).map((r, i) => {
    const text = r.trim();
    return {
      id: `item-risk-${i + 1}`,
      description: text,
      likelihood: "unknown" as const,
      impact: "moderate" as const,
      detectability: "unclear" as const,
      controllability: "moderate" as const,
      reversibility: assessReversibility(text),
      warningSigns: [
        "Early signs that people are confused or pulling back",
      ],
      mitigations: ["Slow down and check the assumption before going further"],
      whyItMatters: "It could affect trust, capacity, or the outcome you want.",
    };
  });
  if (fromItem.length) return fromItem;

  const q = (item.decisionStatement || "").toLowerCase();
  const seeded: StrategicRisk[] = [];
  if (/\bprice|pricing\b/.test(q)) {
    seeded.push({
      id: "pricing-trust",
      description: "Some current members may feel surprised by a price change.",
      likelihood: "moderate",
      impact: "high",
      detectability: "early",
      controllability: "moderate",
      reversibility: "moderately_reversible",
      warningSigns: [
        "More questions after the announcement",
        "Quieter engagement or early cancellations",
      ],
      mitigations: [
        "Protect current members or explain value clearly before a broad change",
      ],
      whyItMatters: "Trust with people already committed is hard to rebuild.",
      acceptable: true,
    });
  }
  if (/\bgrow|more customers\b/.test(q)) {
    seeded.push({
      id: "growth-capacity",
      description: "Demand could outpace delivery quality.",
      likelihood: "moderate",
      impact: "high",
      detectability: "early",
      controllability: "high",
      reversibility: "moderately_reversible",
      warningSigns: ["Longer wait times", "Rising complaints"],
      mitigations: ["Check capacity before expanding acquisition"],
      whyItMatters: "Growth that breaks the promise can cost more than it earns.",
      acceptable: true,
    });
  }
  if (/\bhire|va|assistant|delegate\b/.test(q)) {
    seeded.push({
      id: "hiring-management",
      description: "Help can add management work before it adds relief.",
      likelihood: "moderate",
      impact: "moderate",
      detectability: "early",
      controllability: "high",
      reversibility: "moderately_reversible",
      warningSigns: ["Oversight time exceeds time saved", "Rework rises"],
      mitigations: ["Start with one well-defined task and a short trial"],
      whyItMatters: "The goal is relief, not a new full-time coordination load.",
      acceptable: true,
    });
  }
  if (/\bclos(e|ing)|shut down|walk away\b/.test(q)) {
    seeded.push({
      id: "close-irreversible",
      description: "Closing may be difficult to reverse once announced.",
      likelihood: "moderate",
      impact: "high",
      detectability: "delayed",
      controllability: "low",
      reversibility: "difficult_to_reverse",
      warningSigns: ["Rushing the announcement before alternatives are checked"],
      mitigations: [
        "Explore pause, reduce scope, or restructure before a permanent close",
      ],
      whyItMatters: "This kind of choice deserves care and clearer evidence.",
      acceptable: false,
    });
  }
  return seeded.slice(0, 2);
}

export function buildRiskAssessments(item: StrategyWorkItem): RiskAssessment[] {
  return buildStrategicRisks(item).map(toAssessment);
}

/** Fear-heavy copy detector for tests / quality. */
export function riskCopyIsCalm(text: string): boolean {
  return !/\b(disaster|catastrophe|ruin|devastat|terrified|panic)\b/i.test(text);
}
