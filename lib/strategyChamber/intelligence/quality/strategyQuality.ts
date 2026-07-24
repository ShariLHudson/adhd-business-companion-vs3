import { axisForPattern } from "../frameworks/optionCatalog";
import type { StrategicOption } from "../optionContract";
import type { EnrichedStrategyOption } from "../types";

export function optionsAreMeaningfullyDifferent(
  options: EnrichedStrategyOption[],
): boolean {
  if (options.length < 2) return true;
  const patterns = new Set(
    options.map((o) => o.patternId || o.title.toLowerCase().slice(0, 24)),
  );
  if (patterns.size < Math.min(2, options.length)) return false;
  const axes = new Set(
    options
      .map((o) => (o.patternId ? axisForPattern(o.patternId) : null))
      .filter(Boolean),
  );
  // Prefer different strategic axes when patterns are present
  if (options.every((o) => o.patternId) && axes.size < Math.min(2, options.length)) {
    return false;
  }
  return true;
}

export function strategyQualityIssues(options: EnrichedStrategyOption[]): string[] {
  const issues: string[] = [];
  if (options.length > 3) issues.push("more_than_three_options");
  if (!optionsAreMeaningfullyDifferent(options)) {
    issues.push("options_too_similar");
  }
  for (const o of options) {
    if (!o.tradeoffs?.length && !o.mainTradeoff) {
      issues.push(`missing_tradeoff:${o.id}`);
    }
  }
  return issues;
}

export function fullOptionQualityIssues(options: StrategicOption[]): string[] {
  const issues = strategyQualityIssues(options);
  for (const o of options) {
    if (!o.risksDetailed.length) issues.push(`missing_risk:${o.id}`);
    if (!o.reversibility) issues.push(`missing_reversibility:${o.id}`);
    if (!o.smallestUsefulTest && !o.experiment) {
      issues.push(`missing_experiment:${o.id}`);
    }
  }
  return issues;
}
