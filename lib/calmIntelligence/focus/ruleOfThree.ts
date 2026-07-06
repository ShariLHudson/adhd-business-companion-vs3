import type { RuleOfThree } from "../types";
import { RULE_OF_THREE_PRINCIPLE } from "../sample";

export function applyRuleOfThree<T extends { id: string }>(
  items: T[],
  max = 3,
): RuleOfThree<T> {
  const visible = items.slice(0, max);
  return {
    items: visible,
    hiddenCount: Math.max(0, items.length - max),
    principle: RULE_OF_THREE_PRINCIPLE,
  };
}
