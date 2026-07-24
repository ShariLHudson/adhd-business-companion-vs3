/**
 * Merge primary + secondary contributions: dedupe, primary wins ties.
 */

import type { StrategyDomainContribution } from "./types";

function normalizeKey(content: string): string {
  return content
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

/**
 * Merge contributions. Same content (normalized) → keep higher priority (primary).
 */
export function mergeDomainContributions(
  primary: StrategyDomainContribution[],
  secondary: StrategyDomainContribution[],
): StrategyDomainContribution[] {
  const byKey = new Map<string, StrategyDomainContribution>();
  const ordered = [...primary, ...secondary].sort(
    (a, b) => b.priority - a.priority,
  );
  for (const c of ordered) {
    const key = `${c.contributionType}:${normalizeKey(c.content)}`;
    if (!byKey.has(key)) byKey.set(key, c);
  }
  return [...byKey.values()].sort((a, b) => b.priority - a.priority);
}

export function contributionsOfType(
  contributions: StrategyDomainContribution[],
  type: StrategyDomainContribution["contributionType"],
  limit = 5,
): string[] {
  return contributions
    .filter((c) => c.contributionType === type)
    .slice(0, limit)
    .map((c) => c.content);
}
