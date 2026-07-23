import type { EnrichedStrategyOption } from "../types";

export function optionsAreMeaningfullyDifferent(
  options: EnrichedStrategyOption[],
): boolean {
  if (options.length < 2) return true;
  const patterns = new Set(
    options.map((o) => o.patternId || o.title.toLowerCase().slice(0, 24)),
  );
  return patterns.size >= Math.min(2, options.length);
}

export function strategyQualityIssues(options: EnrichedStrategyOption[]): string[] {
  const issues: string[] = [];
  if (options.length > 3) issues.push("more_than_three_options");
  if (!optionsAreMeaningfullyDifferent(options)) {
    issues.push("options_too_similar");
  }
  return issues;
}
