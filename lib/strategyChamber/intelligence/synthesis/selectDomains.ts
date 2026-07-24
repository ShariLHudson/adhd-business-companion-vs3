/**
 * Select primary Strategy domain + at most one secondary.
 */

import type { StrategyWorkItem } from "../../types";
import { matchDomainsForDecision } from "../domainIntelligence";
import { resolvePrimaryStrategyType } from "../registry";
import type { StrategyTypeId } from "../types";
import { suggestSecondaryDomainForPrimary } from "./suggestSecondaryDomain";
import type {
  StrategyDomainCandidate,
  StrategyDomainSelection,
  SynthesisConfidence,
} from "./types";

function blobFromItem(item: StrategyWorkItem, lastAnswer?: string): string {
  return [
    item.decisionStatement,
    item.currentReality,
    item.desiredDirection,
    ...(item.memberStatements ?? []),
    lastAnswer,
  ]
    .filter(Boolean)
    .join(" ");
}

function relevanceFromScore(score: number): "low" | "moderate" | "high" {
  if (score >= 3) return "high";
  if (score >= 2) return "moderate";
  return "low";
}

export function listDomainCandidates(text: string): StrategyDomainCandidate[] {
  return matchDomainsForDecision(text).map(({ domain, score }) => ({
    domainId: domain.id,
    relevance: relevanceFromScore(score),
    reason: `Matched ${score} entry signal${score === 1 ? "" : "s"}`,
    matchedSignals: domain.entrySignals
      .filter((re) => re.test(text))
      .slice(0, 3)
      .map((re) => re.source),
    contributionTypes: [
      "question",
      "evidence",
      "assumption",
      "option",
      "tradeoff",
      "risk",
      "experiment",
    ],
  }));
}

/**
 * Phrase-level primary overrides for classic cross-domain asks.
 * Used only when registry scoring is weak or ambiguous — not a second registry.
 */
function phrasePrimaryOverride(text: string): StrategyTypeId | null {
  const t = text.toLowerCase();
  if (
    /plenty of customers|lots of customers/.test(t) &&
    /revenue|profit|money|income/.test(t)
  ) {
    return "growth";
  }
  if (/too much for what i charge|doing too much for what/.test(t)) {
    return "pricing";
  }
  if (
    /(want to grow|need to grow|grow).{0,40}(overwhelm|burned out|cannot keep|can't keep)/.test(
      t,
    ) ||
    /(overwhelm|burned out|cannot keep|can't keep).{0,40}(grow|growth)/.test(t)
  ) {
    return "growth";
  }
  if (
    /launch .{0,20}(program|offer)|new program|new offer/.test(t) &&
    /who .{0,24}for|audience|don't know who|do not know who/.test(t)
  ) {
    return "offer";
  }
  if (
    /(virtual assistant|hire|va).{0,40}(grow|growth)|(grow|growth).{0,40}(hire|va|assistant)/.test(
      t,
    )
  ) {
    return "hiring_delegation";
  }
  return null;
}

export function selectStrategyDomains(
  item: StrategyWorkItem,
  opts?: { lastAnswer?: string; forcedPrimaryId?: StrategyTypeId },
): StrategyDomainSelection {
  const text = blobFromItem(item, opts?.lastAnswer);
  const candidates = listDomainCandidates(text);
  const primaryFromRegistry = resolvePrimaryStrategyType(text);
  const phrasePrimary = phrasePrimaryOverride(text);
  const primaryId =
    opts?.forcedPrimaryId ||
    (item.strategyType as StrategyTypeId | undefined) ||
    phrasePrimary ||
    primaryFromRegistry?.id ||
    candidates[0]?.domainId ||
    "business_direction";

  const primaryCandidate = candidates.find((c) => c.domainId === primaryId);
  const alternatives = candidates
    .filter((c) => c.domainId !== primaryId)
    .map((c) => c.domainId)
    .slice(0, 4);

  const secondaryHint = suggestSecondaryDomainForPrimary(primaryId, text);

  // Only load secondary when relevance is material (hint present + not noise)
  let secondaryDomainId: StrategyTypeId | undefined;
  let secondaryReason: string | undefined;
  if (secondaryHint) {
    const secondaryInCandidates = candidates.find(
      (c) => c.domainId === secondaryHint.secondaryId,
    );
    const material =
      Boolean(secondaryInCandidates) ||
      // Allow capacity/pricing cross even if signals are weak — language-gated in suggester
      secondaryHint.secondaryId === "capacity_focus" ||
      secondaryHint.secondaryId === "pricing" ||
      secondaryHint.secondaryId === "growth";
    if (material) {
      secondaryDomainId = secondaryHint.secondaryId;
      secondaryReason = secondaryHint.reason;
    }
  }

  let confidence: SynthesisConfidence = "moderate";
  if (primaryCandidate?.relevance === "high" && !secondaryDomainId) {
    confidence = "high";
  } else if (primaryCandidate?.relevance === "low" || candidates.length === 0) {
    confidence = "low";
  } else if (secondaryDomainId && primaryCandidate?.relevance === "high") {
    confidence = "high";
  }

  return {
    primaryDomainId: primaryId,
    secondaryDomainId,
    primaryReason:
      primaryCandidate?.reason ||
      `Primary domain from decision language: ${primaryId}`,
    secondaryReason,
    confidence,
    alternativesConsidered: alternatives,
  };
}
