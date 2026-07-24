/**
 * Pricing Strategy Intelligence helpers — Phase 4B.
 * Shared engine calls these when strategyTypeId === "pricing".
 * Not a separate pricing engine.
 */

import type { ContinueJourneyDestinationId } from "../../../types";
import type { OptionPatternId } from "../../types";
import type { Reversibility } from "../../../domainModel";
import { pricingDomainIntelligence } from "./pricingDomain";
import type {
  PricingExperimentBlueprint,
  PricingOfferShape,
  PricingProblemDistinctionId,
  PricingRoutingBoundary,
} from "./pricingDomainContract";

/** Epistemic categories for pricing evidence discipline. */
export type PricingEvidenceKind =
  | "confirmed_price"
  | "actual_sales_results"
  | "inquiry_volume"
  | "conversion"
  | "retention"
  | "churn"
  | "delivery_cost"
  | "delivery_time"
  | "customer_outcomes"
  | "customer_feedback"
  | "willingness_to_pay_signals"
  | "competitor_observations"
  | "founder_fear"
  | "assumption_affordability"
  | "assumption_churn"
  | "assumption_value";

export function isPricingStrategyLanguage(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  return pricingDomainIntelligence.entrySignals.some((re) => re.test(t));
}

export function getPricingUnderlyingQuestions(): string[] {
  return [...pricingDomainIntelligence.possibleUnderlyingQuestions];
}

export function getPricingHeuristics(): string[] {
  return [...pricingDomainIntelligence.heuristics];
}

export function getPricingExperimentBlueprints(): PricingExperimentBlueprint[] {
  return [...pricingDomainIntelligence.experimentBlueprints];
}

export function getPricingRoutingBoundaries(): PricingRoutingBoundary[] {
  return [...pricingDomainIntelligence.routingBoundaries];
}

export function getPricingStrategicOptionPatterns(): string[] {
  return [...pricingDomainIntelligence.strategicOptionPatterns];
}

/** Infer offer shape from language — soft signal only. */
export function detectPricingOfferShape(text: string): PricingOfferShape[] {
  const t = text.toLowerCase();
  const hits: PricingOfferShape[] = [];
  if (/membership|member/.test(t)) hits.push("membership");
  if (/subscription|subscribe/.test(t)) hits.push("subscription");
  if (/retainer/.test(t)) hits.push("retainer");
  if (/consult(ing|ant)/.test(t)) hits.push("consulting");
  if (/coach(ing)?/.test(t)) hits.push("coaching");
  if (/program|course/.test(t)) hits.push("program");
  if (/workshop/.test(t)) hits.push("workshop");
  if (/event|retreat/.test(t)) hits.push("event");
  if (/digital|download|template/.test(t)) hits.push("digital_offer");
  if (/productiz/.test(t)) hits.push("productized_service");
  if (/package|packaged/.test(t)) hits.push("package");
  if (/hourly|by the hour|hour(ly)? rate/.test(t)) hits.push("hourly");
  if (/project (fee|price|rate)|fixed.?fee project/.test(t)) hits.push("project");
  if (/new (program|offer|membership|package)|launching|before launching/.test(t)) {
    hits.push("new_offer");
  }
  if (/existing|current (members|customers|clients)/.test(t)) {
    hits.push("existing_offer");
  }
  if (/service/.test(t) && !hits.includes("consulting") && !hits.includes("coaching")) {
    hits.push("service");
  }
  return [...new Set(hits)];
}

/**
 * Surface question → possible deeper questions.
 * Caps at three for conversation; never assumes raise/lower is the answer.
 */
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
  if (
    /\blower\b|\bdiscount\b|\bnot buying\b|\bnot converting\b|\bwon't buy\b|\bwill not buy\b/.test(
      lower,
    )
  ) {
    out.push(
      "Is the offer clear enough?",
      "Is the audience correct?",
      "Is pricing being used to solve a positioning or conversion problem?",
      "Is the price genuinely misaligned?",
      "Is there enough evidence to diagnose the problem?",
    );
  }
  if (/\btoo much\b|\bdoing too much\b|\bunderpaid\b|\bfor what i charge\b/.test(lower)) {
    out.push(
      "Is the offer over-scoped?",
      "Are boundaries unclear?",
      "Has delivery become more demanding without a matching promise change?",
      "Should the package be simplified?",
      "Should the price increase — or should scope shrink?",
    );
  }
  // Prefer evidence questions when the member names weak evidence (before capping).
  if (
    /not much evidence|don't have (much )?evidence|do not have (much )?evidence|without (much )?evidence/.test(
      lower,
    )
  ) {
    out.unshift(
      "Is there enough evidence to change anything yet?",
      "Would a limited new-customer test teach more than a broad change?",
      "Is maintaining the current price wisest until evidence improves?",
    );
  } else if (/\bunderpriced\b/.test(lower)) {
    out.push(
      "Is there enough evidence to change anything yet?",
      "Would a limited new-customer test teach more than a broad change?",
      "Is maintaining the current price wisest until evidence improves?",
    );
  }
  if (/\bleave\b|\bchurn\b|\bupset\b|\bresen|\bgrandfather/.test(lower)) {
    out.push(
      "Should only new customers receive the new price?",
      "Is a new tier better than changing the base price?",
      "Would a limited grandfather period protect trust without permanent complexity?",
    );
  }
  if (/competitor|half as much|charge less than me|cheaper than/.test(lower)) {
    out.push(
      "Are the offers actually comparable?",
      "Are the customers comparable?",
      "Is the positioning different?",
      "Is competitor pricing relevant enough to drive this decision?",
    );
  }
  if (/premium tier|add a (premium )?tier|higher tier/.test(lower)) {
    out.push(
      "Are the tier differences meaningful and understandable?",
      "Would a premium tier confuse the base offer?",
      "Is the base price fine while a different promise needs a different price?",
    );
  }
  if (/hourly|packages?|retainer|subscription|annual|monthly/.test(lower)) {
    out.push(
      "Does the pricing structure match how value is delivered?",
      "Would packaging or boundaries fix sustainability without a number change?",
      "Is cash timing or accessibility the real tension?",
    );
  }
  if (/new (program|offer|membership)|what should i charge|founding/.test(lower)) {
    out.push(
      "Is there enough validation to set a lasting price?",
      "Would a founding or pilot price with a clear end condition help?",
      "Is scope still too uncertain for a permanent number?",
    );
  }
  if (/always (have to )?discount|stop discounting/.test(lower)) {
    out.push(
      "Is discounting solving the real issue — or training people to wait?",
      "Would a payment plan, annual incentive, or clearer package replace the discount?",
      "Does the discount have a clear audience, duration, and end condition?",
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

/** Competitor price mentioned — observation, not proof. */
export function pricingTreatsCompetitorAsObservation(text: string): boolean {
  return /competitor|half as much|charge less than|cheaper than (me|mine)/i.test(
    text,
  );
}

export function classifyPricingEvidenceHints(text: string): PricingEvidenceKind[] {
  const t = text.toLowerCase();
  const kinds: PricingEvidenceKind[] = [];
  if (/current price|we charge|\$|fee is|priced at/.test(t)) {
    kinds.push("confirmed_price");
  }
  if (/sold|sales|closed|revenue/.test(t)) kinds.push("actual_sales_results");
  if (/inquir|leads?|people ask/.test(t)) kinds.push("inquiry_volume");
  if (/convert|conversion|close rate/.test(t)) kinds.push("conversion");
  if (/retain|renew|retention/.test(t)) kinds.push("retention");
  if (/churn|cancel|left|leaving/.test(t)) kinds.push("churn");
  if (/cost to deliver|delivery cost|margin/.test(t)) kinds.push("delivery_cost");
  if (/hours? (per|to deliver)|takes me .* hours/.test(t)) {
    kinds.push("delivery_time");
  }
  if (/outcome|results for (them|clients|customers)/.test(t)) {
    kinds.push("customer_outcomes");
  }
  if (/said|feedback|told me|compliment/.test(t)) kinds.push("customer_feedback");
  if (/would pay|willing to pay|paid without/.test(t)) {
    kinds.push("willingness_to_pay_signals");
  }
  if (/competitor/.test(t)) kinds.push("competitor_observations");
  if (/afraid|fear|worry|scared|upset me/.test(t)) kinds.push("founder_fear");
  if (/can't afford|cannot afford|too expensive for/.test(t)) {
    kinds.push("assumption_affordability");
  }
  if (/will leave|would leave|they'll leave/.test(t)) kinds.push("assumption_churn");
  if (/worth more|underpriced|must be worth/.test(t) && /i (think|feel)/.test(t)) {
    kinds.push("assumption_value");
  }
  return [...new Set(kinds)];
}

/** Evidence discipline rejects — what must not be treated as proof. */
export function pricingEvidenceDisciplineRejects(claim: string): string[] {
  const c = claim.toLowerCase();
  const rejects: string[] = [];
  if (/competitor.*(prove|proof|right price|correct price)/.test(c)) {
    rejects.push("competitor_price_as_proof");
  }
  if (/compliment.*(willingness|will pay|proves)/.test(c)) {
    rejects.push("compliments_as_willingness");
  }
  if (/(my|founder) (effort|work).*(equals|means|is) (customer )?value/.test(c)) {
    rejects.push("effort_as_value");
  }
  if (/one objection.*(market|prove)/.test(c)) {
    rejects.push("one_objection_as_market");
  }
  if (/one sale.*(validat|prove|demand)/.test(c)) {
    rejects.push("one_sale_as_demand");
  }
  if (/fear.*(predict|means) churn|upset.*(equals|means) churn/.test(c)) {
    rejects.push("fear_as_predicted_churn");
  }
  if (/low sales.*(prove|means).*(too high|price)/.test(c)) {
    rejects.push("low_sales_as_price_proof");
  }
  return rejects;
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
  newOffer?: boolean;
  discountDependence?: boolean;
  competitorPressure?: boolean;
  weakEvidence?: boolean;
}): OptionPatternId[] {
  if (input.weakEvidence) {
    return ["protect_current_base", "test", "delay", "add_value"];
  }
  if (input.capacityTight || input.deliveryBurden) {
    return ["simplify", "protect_current_base", "add_value", "test", "restructure_price"];
  }
  if (input.weakConversion || input.competitorPressure) {
    return ["add_value", "protect_current_base", "test", "delay", "restructure_price"];
  }
  if (input.discountDependence) {
    return ["protect_current_base", "restructure_price", "add_value", "test"];
  }
  if (input.newOffer) {
    return ["test", "protect_current_base", "delay", "add_value", "restructure_price"];
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

/** Pick experiment blueprints that fit the situation (max 2). */
export function selectPricingExperimentBlueprints(input: {
  fearChurn?: boolean;
  weakConversion?: boolean;
  deliveryBurden?: boolean;
  newOffer?: boolean;
  discountDependence?: boolean;
  wantPremiumTier?: boolean;
  wantAnnual?: boolean;
}): PricingExperimentBlueprint[] {
  const all = getPricingExperimentBlueprints();
  const byId = (id: string) => all.find((b) => b.id === id)!;
  const picked: PricingExperimentBlueprint[] = [];
  if (input.wantPremiumTier) picked.push(byId("premium_tier_test"));
  if (input.wantAnnual) picked.push(byId("annual_option_test"));
  if (input.discountDependence) picked.push(byId("discount_removal_test"));
  if (input.deliveryBurden) picked.push(byId("scope_hold_price_test"));
  if (input.newOffer || input.fearChurn || input.weakConversion) {
    picked.push(byId("new_customer_price_test"));
  }
  if (input.weakConversion && picked.length < 2) {
    picked.push(byId("value_interview"));
  }
  if (picked.length === 0) {
    picked.push(byId("new_customer_price_test"), byId("value_interview"));
  }
  return [...new Map(picked.map((b) => [b.id, b])).values()].slice(0, 2);
}

export function pricingReversibilityForPattern(
  pattern: OptionPatternId,
): Reversibility {
  if (pattern === "test" || pattern === "delay") return "easily_reversible";
  if (
    pattern === "protect_current_base" ||
    pattern === "maintain_current_direction" ||
    pattern === "add_value"
  ) {
    return "easily_reversible";
  }
  if (
    pattern === "staged_transition" ||
    pattern === "restructure_price" ||
    pattern === "simplify" ||
    pattern === "reduce_scope"
  ) {
    return "moderately_reversible";
  }
  if (pattern === "increase_price" || pattern === "stop") {
    return "difficult_to_reverse";
  }
  return "unknown";
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

/** Warm presentation examples — presentation only; not a canned response library. */
export const PRICING_SHARI_VOICE_NOTES = [
  "Before we decide that the price is the problem, I want to understand what changed.",
  "There may be a value question and a sustainability question mixed together here.",
  "Your members leaving is a real concern, but right now it is still a concern rather than evidence.",
  "We could test a higher price with new members without changing anything for current members yet.",
  "Doing more work does not always mean the customer is receiving more value. We may need to look at both price and scope.",
  "Keeping the current price is still a valid option if the evidence for changing it is weak.",
  "The strongest next move may be to learn more before making the full change.",
] as const;

export function pricingQualityRejectReasons(guidance: string): string[] {
  const g = guidance.toLowerCase();
  const rejects: string[] = [];
  if (/always (raise|increase)|higher is always|must raise/.test(g)) {
    rejects.push("assumes_higher_always_better");
  }
  if (/always lower|must lower|lowering (is|will) (always|fix)/.test(g)) {
    rejects.push("assumes_lower_always_fixes");
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
  if (/formula.*(guarantees|proves)|charge \d+x/.test(g)) {
    rejects.push("arbitrary_formula_as_certainty");
  }
  return rejects;
}

/** Cosmetic diversity check — percentage-only variants are not strategy options. */
export function pricingOptionsLookCosmetic(labels: string[]): boolean {
  const pct = labels.filter((l) => /\d+\s*%|raise \d+|lower \d+/.test(l.toLowerCase()));
  return pct.length >= 2 && pct.length === labels.length;
}
