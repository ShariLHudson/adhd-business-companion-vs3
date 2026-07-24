import type { StrategyWorkItem } from "../../types";
import type { StrategicOption } from "../optionContract";
import type { EnrichedStrategyOption } from "../types";

export function opportunityCostPrompt(item: StrategyWorkItem): string | null {
  if (!item.optionsConsidered?.length && !item.chosenDirection?.trim()) {
    return null;
  }
  return "What would this make harder to pursue, or what would need less attention?";
}

export function opportunityCostNote(
  option: EnrichedStrategyOption,
): string | null {
  if (option.mainTradeoff) {
    return `Choosing this may mean accepting: ${option.mainTradeoff}`;
  }
  if (option.tradeoffs?.[0]) {
    return `Choosing this may mean accepting: ${option.tradeoffs[0]}`;
  }
  return null;
}

/** Phase 3 — explicit opportunity costs from the full option contract. */
export function opportunityCostsForOption(option: StrategicOption): string[] {
  if (option.opportunityCosts.length) return option.opportunityCosts;
  if (option.tradeoffs.length) return option.tradeoffs.slice(0, 2);
  return [];
}

export function opportunityCostLinesForOptions(
  options: StrategicOption[],
): string[] {
  return options.slice(0, 3).flatMap((o) => {
    const costs = opportunityCostsForOption(o);
    if (!costs.length) return [];
    return [`${o.name}: ${costs[0]}`];
  });
}
