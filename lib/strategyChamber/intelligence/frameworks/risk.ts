import type { StrategyWorkItem } from "../../types";
import type { RiskAssessment } from "../types";
import { assessReversibility } from "./reversibility";

export function buildRiskAssessments(item: StrategyWorkItem): RiskAssessment[] {
  const fromItem = (item.risks ?? []).slice(0, 3).map((r) => {
    const text = r.trim();
    return {
      whatCouldHappen: text,
      whyItMatters: "It could affect trust, capacity, or the outcome you want.",
      likelihood: "unknown" as const,
      mitigation: undefined,
      earlyWarning: "Watch for early signs that people are confused or pulling back.",
      reversibility: assessReversibility(text),
    };
  });
  if (fromItem.length) return fromItem;

  const q = (item.decisionStatement || "").toLowerCase();
  const seeded: RiskAssessment[] = [];
  if (/\bprice|pricing\b/.test(q)) {
    seeded.push({
      whatCouldHappen: "Some current members may feel surprised or less loyal.",
      whyItMatters: "Trust with people already committed is hard to rebuild.",
      likelihood: "medium",
      mitigation: "Consider protecting current members or explaining value clearly.",
      earlyWarning: "Questions, cancellations, or quieter engagement after the change.",
      reversibility: "reversible_with_effort",
    });
  }
  if (/\bgrow|more customers\b/.test(q)) {
    seeded.push({
      whatCouldHappen: "Demand could outpace delivery quality.",
      whyItMatters: "Growth that breaks the promise can cost more than it earns.",
      likelihood: "medium",
      mitigation: "Check capacity before expanding acquisition.",
      earlyWarning: "Longer wait times or rising complaints.",
      reversibility: "reversible_with_effort",
    });
  }
  return seeded.slice(0, 2);
}
