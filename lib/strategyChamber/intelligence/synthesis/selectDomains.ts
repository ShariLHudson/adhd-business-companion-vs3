/**
 * Primary + optional secondary domain selection from full Strategy context.
 * Not keyword-only. At most one secondary. Pair registry validated.
 */

import type { StrategyWorkItem } from "../../types";
import { matchDomainsForDecision } from "../domainIntelligence";
import { resolvePrimaryStrategyType } from "../registry";
import type { StrategyTypeId } from "../types";
import { getPairRule, isPairAllowed } from "./pairRegistry";
import {
  evaluateSecondaryThreshold,
  secondaryClearsThreshold,
} from "./secondaryThreshold";
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
    item.chosenDirection,
    ...(item.constraints ?? []),
    ...(item.assumptions ?? []),
    ...(item.knownFacts ?? []),
    ...(item.optionsConsidered?.map((o) => o.title) ?? []),
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

/** Too diffuse to load several domains — clarify first. */
export function isLowConfidenceDiffuseAsk(text: string): boolean {
  return /\b(everything is wrong|nothing works|my whole business|all of it|everything sucks|fix everything)\b/i.test(
    text,
  );
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
 * Used when registry scoring is weak — not a second registry.
 */
function phrasePrimaryOverride(text: string): StrategyTypeId | null {
  const t = text.toLowerCase();
  if (
    /plenty of customers|lots of customers/.test(t) &&
    /revenue|profit|money|income/.test(t)
  ) {
    return "growth";
  }
  if (
    /too much for what i charge|doing too much for what|far too much work for what/.test(
      t,
    )
  ) {
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
    /launch .{0,20}(program|offer)|new program|new offer|idea for a program/.test(
      t,
    ) &&
    /who .{0,24}for|audience|don't know who|do not know who/.test(t)
  ) {
    return "offer";
  }
  if (
    /(virtual assistant|hire|va|hire someone).{0,40}(grow|growth|cannot keep|can't keep)|(grow|growth|cannot keep|can't keep).{0,40}(hire|va|assistant)/.test(
      t,
    ) ||
    /need to hire someone because i cannot keep up/.test(t)
  ) {
    return "hiring_delegation";
  }
  if (/posting regularly|not attracting the right customers/.test(t)) {
    return "growth";
  }
  if (/too many things to work on|too many priorities|scattered/.test(t)) {
    return "capacity_focus";
  }
  if (/change who my program is for|who (my|the) program is for/.test(t)) {
    return "market_customer";
  }
  if (/should i hire a va|hire a (va|virtual assistant)\b/.test(t)) {
    return "hiring_delegation";
  }
  if (/raise my membership price|raise (the )?price/.test(t) && !/too much/.test(t)) {
    return "pricing";
  }
  if (/need more customers|more customers/.test(t) && !/plenty|lots of customers/.test(t)) {
    return "growth";
  }
  return null;
}

export function selectStrategyDomains(
  item: StrategyWorkItem,
  opts?: { lastAnswer?: string; forcedPrimaryId?: StrategyTypeId },
): StrategyDomainSelection {
  const text = blobFromItem(item, opts?.lastAnswer);

  if (isLowConfidenceDiffuseAsk(text)) {
    return {
      primaryDomainId: "business_direction",
      primaryReason: "Ask is too broad — clarify the central decision first.",
      confidence: "low",
      needsClarification: true,
      alternativesConsidered: [],
    };
  }

  const candidates = listDomainCandidates(text);
  const primaryFromRegistry = resolvePrimaryStrategyType(text);
  const phrasePrimary = phrasePrimaryOverride(text);
  const persisted = item.strategyType as StrategyTypeId | undefined;

  const primaryId =
    opts?.forcedPrimaryId ||
    persisted ||
    phrasePrimary ||
    primaryFromRegistry?.id ||
    candidates[0]?.domainId ||
    "business_direction";

  const primaryCandidate = candidates.find((c) => c.domainId === primaryId);
  const alternatives = candidates
    .filter((c) => c.domainId !== primaryId)
    .map((c) => c.domainId)
    .slice(0, 4);

  // Pure pricing with strong framing and no capacity/growth tension → no secondary
  const purePricingNewMembers =
    primaryId === "pricing" &&
    /new members? only|for new (members|customers)/i.test(text) &&
    !/overwhelm|too much|cannot keep|can't keep|not buying|weak demand|revenue is still low/i.test(
      text,
    );

  let secondaryDomainId: StrategyTypeId | undefined;
  let secondaryReason: string | undefined;
  let secondaryThresholdReasons: StrategyDomainSelection["secondaryThresholdReasons"];
  let secondaryStatus: StrategyDomainSelection["secondaryStatus"];

  if (!purePricingNewMembers) {
    const secondaryHint = suggestSecondaryDomainForPrimary(primaryId, text);
    if (secondaryHint) {
      const pair = getPairRule(primaryId, secondaryHint.secondaryId);
      if (!pair || !isPairAllowed(primaryId, secondaryHint.secondaryId)) {
        // Invalid / unavailable pair — continue primary-only
        secondaryStatus = pair?.status ?? "unavailable";
      } else {
        secondaryStatus = pair.status;
        if (pair.status === "unavailable") {
          // skip
        } else {
          const reasons = evaluateSecondaryThreshold({
            primaryId,
            secondaryId: secondaryHint.secondaryId,
            text,
          });
          if (secondaryClearsThreshold(reasons)) {
            secondaryDomainId = secondaryHint.secondaryId;
            secondaryReason = secondaryHint.reason;
            secondaryThresholdReasons = reasons;
          }
        }
      }
    }
  }

  let confidence: SynthesisConfidence = "moderate";
  if (primaryCandidate?.relevance === "high" && !secondaryDomainId) {
    confidence = "high";
  } else if (
    (!primaryCandidate && !phrasePrimary) ||
    primaryCandidate?.relevance === "low"
  ) {
    confidence = "low";
  } else if (secondaryDomainId && (primaryCandidate?.relevance === "high" || phrasePrimary)) {
    confidence = "high";
  }

  return {
    primaryDomainId: primaryId,
    secondaryDomainId,
    primaryReason:
      primaryCandidate?.reason ||
      (phrasePrimary
        ? `Primary domain from strategic framing: ${primaryId}`
        : `Primary domain from decision language: ${primaryId}`),
    secondaryReason,
    secondaryThresholdReasons,
    secondaryStatus: secondaryDomainId ? secondaryStatus : undefined,
    confidence,
    alternativesConsidered: alternatives,
  };
}
