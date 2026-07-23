import type { StrategyWorkItem } from "../../types";

export function hasDesiredDirection(item: StrategyWorkItem): boolean {
  return Boolean(item.desiredDirection?.trim() || item.chosenDirection?.trim());
}

export function directionClarityGap(item: StrategyWorkItem): string | null {
  if (!item.decisionStatement?.trim()) {
    return "The central strategic question is still unclear.";
  }
  if (!item.desiredDirection?.trim() && !item.chosenDirection?.trim()) {
    return "The hoped-for outcome is not clear enough yet.";
  }
  return null;
}
