import type { DecisionComparison, DecisionOption, ExecutiveDecision } from "../types";

function scoreOption(option: DecisionOption): number {
  const c = option.criteria;
  return (
    c.strategicValue * 0.2 +
    c.customerImpact * 0.2 +
    c.missionAlignment * 0.15 +
    c.revenuePotential * 0.1 +
    (100 - c.difficulty) * 0.1 +
    (100 - c.implementationComplexity) * 0.1 +
    (100 - c.founderEnergyRequired) * 0.1 +
    option.confidence.score * 0.05
  );
}

export function compareOptions(decision: ExecutiveDecision): DecisionComparison {
  const ranked = [...decision.options].sort((a, b) => scoreOption(b) - scoreOption(a));
  const top = ranked[0];
  const summary = top
    ? `Compared ${decision.options.length} options. Strongest balance: ${top.label}.`
    : "No options to compare.";

  return {
    decisionId: decision.id,
    options: ranked,
    comparedAt: new Date().toISOString(),
    summary,
  };
}

export function optionComparisonMatrix(decision: ExecutiveDecision) {
  return decision.options.map((opt) => ({
    optionId: opt.id,
    label: opt.label,
    score: Math.round(scoreOption(opt)),
    riskLevel: opt.riskLevel,
    founderEffort: opt.founderEffort,
    criteria: opt.criteria,
  }));
}
