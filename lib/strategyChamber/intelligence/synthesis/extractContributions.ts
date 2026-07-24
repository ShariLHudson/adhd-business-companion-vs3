/**
 * Extract typed contributions from a Strategy domain pack.
 * Content is for synthesis merge — not “Domain says…” member reports.
 */

import { getDomainIntelligence } from "../domainIntelligence";
import { summarizeDomainContributions } from "../domainIntelligence/contributions";
import type { StrategyTypeId } from "../types";
import type { StrategyDomainContribution } from "./types";

export function extractDomainContributions(
  domainId: StrategyTypeId,
  role: "primary" | "secondary",
): StrategyDomainContribution[] {
  const domain = getDomainIntelligence(domainId);
  if (!domain) return [];
  const summary = summarizeDomainContributions(domain);
  const basePriority = role === "primary" ? 100 : 60;
  const out: StrategyDomainContribution[] = [];
  let i = 0;

  for (const q of summary.hiddenUnderlyingQuestions.slice(0, 4)) {
    out.push({
      domainId,
      contributionType: "question",
      id: `${domainId}-q-${i++}`,
      content: q,
      priority: basePriority - i,
      userFacing: false,
    });
  }
  for (const e of summary.evidenceNeeded.slice(0, 3)) {
    out.push({
      domainId,
      contributionType: "evidence",
      id: `${domainId}-e-${i++}`,
      content: e,
      priority: basePriority - 10 - i,
    });
  }
  for (const a of summary.commonFalseAssumptions.slice(0, 3)) {
    out.push({
      domainId,
      contributionType: "assumption",
      id: `${domainId}-a-${i++}`,
      content: a,
      priority: basePriority - 20 - i,
    });
  }
  for (const c of summary.capacityChecks.slice(0, 3)) {
    out.push({
      domainId,
      contributionType: "capacity",
      id: `${domainId}-c-${i++}`,
      content: c,
      priority: basePriority - 15 - i,
    });
  }
  for (const t of summary.materialTradeoffs.slice(0, 4)) {
    out.push({
      domainId,
      contributionType: "tradeoff",
      id: `${domainId}-t-${i++}`,
      content: t,
      priority: basePriority - 25 - i,
    });
  }
  for (const r of summary.riskPatterns.slice(0, 4)) {
    out.push({
      domainId,
      contributionType: "risk",
      id: `${domainId}-r-${i++}`,
      content: r,
      priority: basePriority - 30 - i,
    });
  }
  for (const x of summary.experiments.slice(0, 3)) {
    out.push({
      domainId,
      contributionType: "experiment",
      id: `${domainId}-x-${i++}`,
      content: x,
      priority: basePriority - 35 - i,
    });
  }
  for (const p of summary.optionPatterns.slice(0, 8)) {
    out.push({
      domainId,
      contributionType: "option",
      id: `${domainId}-o-${p}`,
      content: p,
      priority: basePriority - 5,
    });
  }
  for (const h of summary.handoffBoundaries.slice(0, 2)) {
    out.push({
      domainId,
      contributionType: "handoff",
      id: `${domainId}-h-${i++}`,
      content: h,
      priority: basePriority - 40 - i,
    });
  }

  // Constraint-flavored guiding principles
  for (const g of (domain.guidingPrinciples ?? []).slice(0, 3)) {
    out.push({
      domainId,
      contributionType: "constraint",
      id: `${domainId}-g-${i++}`,
      content: g,
      priority: basePriority - 8 - i,
    });
  }

  return out;
}
