/**
 * Pricing Strategy Intelligence helpers — Phase 4A.
 * Shared engine calls these when strategyTypeId === "pricing".
 */

import type { ContinueJourneyDestinationId } from "../../../types";
import type { OptionPatternId } from "../../types";
import { pricingDomainIntelligence } from "./pricingDomain";
import type { PricingProblemDistinctionId } from "./pricingDomainContract";

export function isPricingStrategyLanguage(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  return pricingDomainIntelligence.entrySignals.some((re) => re.test(t));
}

export function getPricingUnderlyingQuestions(): string[] {
  return [...pricingDomainIntelligence.possibleUnderlyingQuestions];
}

/** Surface raise ask → underlying questions (never assume raise is the decision). */
export function pricingUnderlyingQuestionsForSurface(text: string): string[] {
  const lower = text.toLowerCase();
  const out: string[] = [];
  if (/\braise\b|\bcharge more\b|\bincrease (the )?price\b/.test(lower)) {
    out.push(
      "Has customer value increased — or only founder effort?",
      "Should only new customers receive the new price?",
      "Is there enough evidence to change anything yet?",
    );
  }
  if (/\blower\b|\bdiscount\b|\bnot buying\b|\bnot converting\b/.test(lower)) {
    out.push(
      "Is pricing being used to solve a positioning or conversion problem?",
      "Is the audience wrong for the current price?",
    );
  }
  if (/\btoo much\b|\bdoing too much\b|\bunderpaid\b|\bfor what i charge\b/.test(lower)) {
    out.push(
      "Has delivery become more demanding without a matching promise change?",
      "Is the current package too broad for one price?",
    );
  }
  if (/\bleave\b|\bchurn\b|\bupset\b|\bresen/.test(lower)) {
    out.push(
      "Should only new customers receive the new price?",
      "Is a new tier better than changing the base price?",
    );
  }
  if (out.length === 0) {
    return pricingDomainIntelligence.possibleUnderlyingQuestions.slice(0, 3);
  }
  return [...new Set(out)].slice(0, 3);
}

export function pricingLooksLikeAssumptionNotEvidence(text: string): boolean {
  return (
    /\b(will leave|would leave|they'll leave|they will leave|always have to|can't afford|cannot afford|everyone will)\b/i.test(
      text,
    ) || /\bi (think|feel|worry|assume)\b/i.test(text)
  );
}

/** Weak sales → do not assume price is the cause. */
export function pricingShouldNotAssumePriceIsCause(text: string): boolean {
  return /\b(not buying|not converting|won't buy|will not buy|lower (the )?price|too expensive)\b/i.test(
    text,
  );
}

/** Delivery burden → distinguish founder effort from customer value. */
export function pricingMentionsFounderEffortAsValue(text: string): boolean {
  return /\b(too much for what i charge|doing too much|so much work|underpaid for|more than (i'm|i am) paid)\b/i.test(
    text,
  );
}

export function detectPricingProblemDistinctions(
  text: string,
): PricingProblemDistinctionId[] {
  const t = text.toLowerCase();
  const hits: PricingProblemDistinctionId[] = [];
  if (/worth|value|why so much|not sure what/.test(t)) hits.push("unclear_value");
  if (/position|look the same|confused about (what|who)/.test(t)) {
    hits.push("weak_positioning");
  }
  if (/wrong (people|audience)|not my people/.test(t)) hits.push("poor_customer_fit");
  if (/nobody knows|no traffic|invisible/.test(t)) hits.push("low_awareness");
  if (/not buying|not converting|won't buy/.test(t)) hits.push("conversion_problem");
  if (/churn|cancel|leave|retention/.test(t)) hits.push("retention_problem");
  if (/delivery|doing too much|too much for what/.test(t)) hits.push("delivery_problem");
  if (/capacity|can't keep up|burned out/.test(t)) hits.push("capacity_problem");
  if (/cash|profit|can't afford to|runway/.test(t)) hits.push("cash_flow_pressure");
  if (/too many (tiers|packages|options)|complex/.test(t)) hits.push("offer_complexity");
  if (/discount|coupon|always have to offer/.test(t)) hits.push("discount_dependence");
  if (hits.length === 0 && isPricingStrategyLanguage(text)) {
    hits.push("genuine_pricing_decision");
  }
  return hits;
}

export function pricingOptionPatterns(input: {
  capacityTight?: boolean;
  fearChurn?: boolean;
  weakConversion?: boolean;
  deliveryBurden?: boolean;
}): OptionPatternId[] {
  if (input.capacityTight || input.deliveryBurden) {
    return ["simplify", "protect_current_base", "add_value", "test", "restructure_price"];
  }
  if (input.weakConversion) {
    return ["add_value", "protect_current_base", "test", "delay", "restructure_price"];
  }
  if (input.fearChurn) {
    return ["protect_current_base", "test", "staged_transition", "restructure_price"];
  }
  // Maintain + test + one change path — never three percentages
  return [
    "protect_current_base",
    "test",
    "add_value",
    "restructure_price",
    "increase_price",
    "staged_transition",
    "delay",
  ];
}

export type PricingHandoffBoundary = {
  destinationId: ContinueJourneyDestinationId;
  when: string;
  owns: string;
};

export const PRICING_HANDOFF_BOUNDARIES: PricingHandoffBoundary[] = [
  {
    destinationId: "business_estate",
    when: "Detailed cost, margin, cash-flow, or forecast analysis is needed",
    owns: "Finance / business facts — not the pricing decision itself",
  },
  {
    destinationId: "create",
    when: "Pricing pages, notices, scripts, or offer documents after direction is clear",
    owns: "Artifacts — Strategy keeps the decision",
  },
  {
    destinationId: "project",
    when: "Coordinated implementation of a chosen pricing change",
    owns: "Execution after decision",
  },
  {
    destinationId: "calendar",
    when: "Transition dates, notice periods, and review points",
    owns: "Timing after decision",
  },
  {
    destinationId: "board",
    when: "High-impact or difficult-to-reverse pricing choice",
    owns: "Challenge perspectives",
  },
  {
    destinationId: "talk_it_out",
    when: "Fear or identity conflict is preventing clear thinking",
    owns: "Emotional clarity before judgment",
  },
];

export function pricingQualityRejectReasons(guidance: string): string[] {
  const g = guidance.toLowerCase();
  const rejects: string[] = [];
  if (/always (raise|increase)|higher is always|must raise/.test(g)) {
    rejects.push("assumes_higher_always_better");
  }
  if (/competitor(s)? (say|charge|set) the (right )?price/.test(g)) {
    rejects.push("competitor_only_pricing");
  }
  if (/because you work hard|your effort means/.test(g)) {
    rejects.push("equates_founder_effort_with_value");
  }
  if (/confirmed decision|you have decided|decision is final/.test(g)) {
    rejects.push("marks_recommendation_as_confirmed");
  }
  return rejects;
}
