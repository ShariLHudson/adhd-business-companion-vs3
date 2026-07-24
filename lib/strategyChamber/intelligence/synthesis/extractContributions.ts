/**
 * Extract only high-value contributions — not full domain dumps.
 * Budgets: primary ≤5, secondary ≤3 (after relevance ranking).
 */

import { getDomainIntelligence } from "../domainIntelligence";
import { summarizeDomainContributions } from "../domainIntelligence/contributions";
import type { StrategyTypeId } from "../types";
import type { StrategyDomainContribution, StrategyDomainContributionType } from "./types";
import {
  PRIMARY_CONTRIBUTION_BUDGET,
  SECONDARY_CONTRIBUTION_BUDGET,
} from "./types";

function relevanceBoost(content: string, text: string): number {
  const c = content.toLowerCase();
  const t = text.toLowerCase();
  let score = 0;
  const tokens = c.split(/\s+/).filter((w) => w.length > 4).slice(0, 8);
  for (const tok of tokens) {
    if (t.includes(tok)) score += 2;
  }
  if (/capacity|delivery/.test(c) && /capacity|delivery|overwhelm|too much/.test(t)) score += 8;
  if (/price|pricing|value/.test(c) && /price|charge|revenue|fee/.test(t)) score += 8;
  if (/retention|churn/.test(c) && /retention|churn|stay|leave/.test(t)) score += 8;
  if (/audience|fit|position/.test(c) && /audience|customers|fit|who/.test(t)) score += 6;
  if (/hire|delegat/.test(c) && /hire|va|assistant|delegat/.test(t)) score += 6;
  if (/grow|acquisition|customer/.test(c) && /grow|customer|revenue/.test(t)) score += 4;
  return score;
}

function pushTyped(
  out: StrategyDomainContribution[],
  domainId: StrategyTypeId,
  type: StrategyDomainContributionType,
  contents: string[],
  basePriority: number,
  text: string,
  limit: number,
) {
  let i = 0;
  for (const content of contents.slice(0, limit)) {
    out.push({
      domainId,
      contributionType: type,
      id: `${domainId}-${type}-${i}`,
      content,
      priority: basePriority - i + relevanceBoost(content, text),
      userFacing: false,
    });
    i += 1;
  }
}

/**
 * Pull candidate contributions then keep only the budgeted high-value set.
 */
export function extractDomainContributions(
  domainId: StrategyTypeId,
  role: "primary" | "secondary",
  text = "",
): StrategyDomainContribution[] {
  const domain = getDomainIntelligence(domainId);
  if (!domain) return [];

  const summary = summarizeDomainContributions(domain);
  const basePriority = role === "primary" ? 100 : 60;
  const candidates: StrategyDomainContribution[] = [];

  // Prefer one of each high-value type rather than flooding one type
  pushTyped(candidates, domainId, "question", summary.hiddenUnderlyingQuestions, basePriority, text, 2);
  pushTyped(candidates, domainId, "evidence", summary.evidenceNeeded, basePriority - 5, text, 1);
  pushTyped(candidates, domainId, "assumption", summary.commonFalseAssumptions, basePriority - 8, text, 1);
  pushTyped(candidates, domainId, "capacity", summary.capacityChecks, basePriority - 4, text, 1);
  pushTyped(candidates, domainId, "constraint", domain.guidingPrinciples ?? [], basePriority - 6, text, 1);
  pushTyped(candidates, domainId, "tradeoff", summary.materialTradeoffs, basePriority - 10, text, 1);
  pushTyped(candidates, domainId, "risk", summary.riskPatterns, basePriority - 12, text, 1);
  pushTyped(candidates, domainId, "experiment", summary.experiments, basePriority - 14, text, 1);
  pushTyped(
    candidates,
    domainId,
    "option",
    summary.optionPatterns.map(String),
    basePriority - 2,
    text,
    2,
  );
  pushTyped(candidates, domainId, "handoff", summary.handoffBoundaries, basePriority - 20, text, 1);

  const budget =
    role === "primary" ? PRIMARY_CONTRIBUTION_BUDGET : SECONDARY_CONTRIBUTION_BUDGET;

  return [...candidates]
    .sort((a, b) => b.priority - a.priority)
    .slice(0, budget);
}
