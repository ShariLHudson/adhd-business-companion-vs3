/**
 * Deduplicate and merge equivalent contributions across domains.
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

/** Semantic clusters that should merge into one integrated line. */
const SEMANTIC_MERGES: Array<{
  id: string;
  match: RegExp;
  mergedContent: string;
  type: StrategyDomainContribution["contributionType"];
}> = [
  {
    id: "sustainability",
    match:
      /financially sustainable|delivery can be sustained|sustainable at the current|current workload|current price.*sustain|delivery.*sustain/,
    mergedContent:
      "We need to understand whether the current price and delivery model are sustainable together.",
    type: "constraint",
  },
  {
    id: "capacity_before_volume",
    match: /deliver well|more demand|capacity for more|cannot support/,
    mergedContent:
      "More demand only helps if delivery and founder capacity can support it.",
    type: "capacity",
  },
];

/**
 * Merge contributions. Identical / synonymous content collapses.
 * Primary wins on exact ties; semantic merges produce one integrated line.
 */
export function mergeDomainContributions(
  primary: StrategyDomainContribution[],
  secondary: StrategyDomainContribution[],
): StrategyDomainContribution[] {
  const combined = [...primary, ...secondary].sort(
    (a, b) => b.priority - a.priority,
  );

  const semanticUsed = new Set<string>();
  const byKey = new Map<string, StrategyDomainContribution>();
  const mergedExtras: StrategyDomainContribution[] = [];

  for (const c of combined) {
    let absorbed = false;
    for (const rule of SEMANTIC_MERGES) {
      if (rule.match.test(c.content.toLowerCase())) {
        if (!semanticUsed.has(rule.id)) {
          semanticUsed.add(rule.id);
          mergedExtras.push({
            domainId: c.domainId,
            contributionType: rule.type,
            id: `merged-${rule.id}`,
            content: rule.mergedContent,
            priority: Math.max(c.priority, 90),
            userFacing: false,
          });
        }
        absorbed = true;
        break;
      }
    }
    if (absorbed) continue;

    const key = `${c.contributionType}:${normalizeKey(c.content)}`;
    if (!byKey.has(key)) byKey.set(key, c);
  }

  // Also collapse near-duplicate option pattern strings
  const optionSeen = new Set<string>();
  const cleaned = [...byKey.values()].filter((c) => {
    if (c.contributionType !== "option") return true;
    const k = normalizeKey(c.content);
    if (optionSeen.has(k)) return false;
    optionSeen.add(k);
    return true;
  });

  return [...mergedExtras, ...cleaned].sort((a, b) => b.priority - a.priority);
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

/** Deduplicate string lists (trade-offs, risks, evidence). */
export function dedupeLines(lines: string[], limit = 4): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const line of lines) {
    const key = normalizeKey(line);
    if (!key || seen.has(key)) continue;
    // Skip near-duplicates sharing first 40 chars
    const prefix = key.slice(0, 40);
    if ([...seen].some((s) => s.startsWith(prefix) || prefix.startsWith(s.slice(0, 40)))) {
      continue;
    }
    seen.add(key);
    out.push(line);
    if (out.length >= limit) break;
  }
  return out;
}
