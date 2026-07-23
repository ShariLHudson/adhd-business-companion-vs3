import type { StrategyWorkItem } from "../../types";

export function hasCurrentReality(item: StrategyWorkItem): boolean {
  const reality = item.currentReality?.trim();
  const question = item.decisionStatement?.trim();
  if (!reality) return false;
  if (question && reality === question) return false;
  return true;
}

export function summarizeKnownReality(item: StrategyWorkItem): string[] {
  const parts: string[] = [];
  if (hasCurrentReality(item)) parts.push(item.currentReality!.trim());
  for (const o of item.observations ?? []) {
    if (o.trim()) parts.push(o.trim());
  }
  for (const f of item.knownFacts ?? []) {
    if (f.trim()) parts.push(f.trim());
  }
  return parts.slice(0, 6);
}
