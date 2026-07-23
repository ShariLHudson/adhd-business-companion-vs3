import type { StrategyWorkItem } from "../../types";
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
