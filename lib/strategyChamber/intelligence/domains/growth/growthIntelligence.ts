/**
 * Growth Strategy Intelligence helpers — Phase 4C.
 * Shared engine calls these when strategyTypeId === "growth".
 * Not a separate growth engine.
 */

import type { ContinueJourneyDestinationId } from "../../../types";
import type { OptionPatternId, StrategyTypeId } from "../../types";
import type { Reversibility } from "../../../domainModel";
import { growthDomainIntelligence } from "./growthDomain";
import type {
  GrowthConstraintId,
  GrowthExperimentBlueprint,
  GrowthReadinessConclusion,
  GrowthRoutingBoundary,
  GrowthTypeId,
} from "./growthDomainContract";

export type GrowthEvidenceKind =
  | "inquiry_volume"
  | "lead_quality"
  | "conversion"
  | "retention"
  | "churn"
  | "repeat_purchases"
  | "referral_volume"
  | "waiting_lists"
  | "delivery_delays"
  | "customer_satisfaction"
  | "customer_outcomes"
  | "capacity_utilization"
  | "revenue_by_offer"
  | "profit_by_offer"
  | "channel_performance"
  | "social_engagement"
  | "founder_excitement"
  | "assumption_growth_required";

export function isGrowthStrategyLanguage(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  return growthDomainIntelligence.entrySignals.some((re) => re.test(t));
}

export function getGrowthUnderlyingQuestions(): string[] {
  return [...growthDomainIntelligence.possibleUnderlyingQuestions];
}

export function getGrowthHeuristics(): string[] {
  return [...growthDomainIntelligence.heuristics];
}

export function getGrowthExperimentBlueprints(): GrowthExperimentBlueprint[] {
  return [...growthDomainIntelligence.experimentBlueprints];
}

export function getGrowthRoutingBoundaries(): GrowthRoutingBoundary[] {
  return [...growthDomainIntelligence.routingBoundaries];
}

export function getGrowthStrategicOptionPatterns(): string[] {
  return [...growthDomainIntelligence.strategicOptionPatterns];
}

/** Infer relevant growth types — soft signals, never a forced menu. */
export function detectGrowthTypes(text: string): GrowthTypeId[] {
  const t = text.toLowerCase();
  const hits: GrowthTypeId[] = [];
  if (/more customers|acquire|acquisition|new clients?/.test(t)) {
    hits.push("customer_growth");
  }
  if (/more revenue|increase revenue|make more money/.test(t)) {
    hits.push("revenue_growth");
  }
  if (/profit|margin/.test(t)) hits.push("profit_growth");
  if (/retention|stay|churn|renew/.test(t)) hits.push("retention_growth");
  if (/repeat|buy again/.test(t)) hits.push("repeat_purchase_growth");
  if (/referral|word of mouth/.test(t)) hits.push("referral_growth");
  if (/social|audience|followers|engagement/.test(t)) hits.push("audience_growth");
  if (/another market|new market|geographic|expand into/.test(t)) {
    hits.push("geographic_expansion", "market_share_growth");
  }
  if (/another offer|new offer|launch .*offer|three new offers/.test(t)) {
    hits.push("offer_expansion");
  }
  if (/channel|ads?|advertising|content/.test(t)) hits.push("channel_expansion");
  if (/hire|team|delegate/.test(t)) hits.push("team_growth", "capacity_growth");
  if (/partner(ship)?/.test(t)) hits.push("partnership_led_growth");
  if (/recurring|subscription|retainer/.test(t)) {
    hits.push("recurring_revenue_growth");
  }
  if (/value per customer|higher value|charge more/.test(t)) {
    hits.push("customer_value_growth");
  }
  if (/stabilize|systems|process|operational/.test(t)) {
    hits.push("operational_maturity");
  }
  if (/narrow|simplify|focus|stay small/.test(t)) {
    hits.push("strategic_simplification");
  }
  if (hits.length === 0 && isGrowthStrategyLanguage(text)) {
    hits.push("customer_growth");
  }
  return [...new Set(hits)];
}

/**
 * Surface → deeper questions (max 3). Never assume acquisition is the answer.
 */
export function growthUnderlyingQuestionsForSurface(text: string): string[] {
  const lower = text.toLowerCase();
  const out: string[] = [];

  if (/more customers|need customers|get more clients/.test(lower)) {
    out.push(
      "Is awareness too low — or is the audience poorly defined?",
      "Are qualified leads failing to convert?",
      "Does the business have capacity for more demand?",
      "Would fewer higher-value customers fit better?",
    );
  }
  if (/more revenue|need revenue|make more money/.test(lower)) {
    out.push(
      "Does the business need more customers — or higher prices, retention, or value?",
      "Is cash timing the real issue disguised as a growth ask?",
      "Is revenue growing while profit or capacity worsens?",
    );
  }
  if (/stopped growing|not growing|growth stalled|plateau/.test(lower)) {
    out.push(
      "Is this a normal plateau rather than failure?",
      "Has the founder reached a delivery ceiling?",
      "Does the business need refinement rather than expansion?",
    );
  }
  if (/cannot keep up|can't keep up|lots of inquir|overwhelmed|burned out/.test(lower)) {
    out.push(
      "Does the business have capacity for more demand?",
      "Would raising prices, boundaries, or simplification help more than acquisition?",
      "Would not growing yet be the honest answer this season?",
    );
  }
  if (/three new offers|many offers|launch .*offers|another offer/.test(lower)) {
    out.push(
      "Would strengthening one offer outperform launching several?",
      "What maintenance burden would each new offer create?",
      "Is focus the real constraint?",
    );
  }
  if (/another market|new market|expand into/.test(lower)) {
    out.push(
      "Is the current market still strong enough to deepen first?",
      "Is there enough evidence for a pilot before a full expansion?",
      "Can delivery and attention support a second market?",
    );
  }
  if (/grow fast|grow quickly|scale fast/.test(lower)) {
    out.push(
      "Why does speed matter right now?",
      "Is the business ready — or is urgency coming from comparison?",
      "Would staged growth protect quality better?",
    );
  }
  if (/stay small|don't want (a )?bigger|do not want (a )?bigger|feel like i should/.test(lower)) {
    out.push(
      "Would maintaining the current size serve the founder better?",
      "Where is the pressure to grow coming from?",
      "Is growth still the right goal this season?",
    );
  }
  if (/hire.*(grow|growth)|grow.*hire|before i can grow/.test(lower)) {
    out.push(
      "Is hiring required — or would simplification free capacity?",
      "Would a contractor trial teach more than a permanent hire?",
      "Is delivery process the constraint rather than headcount?",
    );
  }
  if (/don't stay|do not stay|churn|retention|leave (too )?quickly/.test(lower)) {
    out.push(
      "Are current customers leaving too quickly?",
      "Would retention repair outperform more acquisition?",
      "Is offer fit or customer experience the leak?",
    );
  }
  if (/social media|followers|engagement.*not|growing.*but.*business/.test(lower)) {
    out.push(
      "Is attention converting into qualified demand?",
      "Are you measuring engagement as if it were buying evidence?",
      "Is conversion or offer clarity the real gap?",
    );
  }
  if (/plenty of customers|lots of customers.*revenue|revenue is still low/.test(lower)) {
    out.push(
      "Is price, customer value, or offer mix the issue — not volume?",
      "Would fewer higher-value customers fit better?",
      "Are costs or poor-fit customers suppressing results?",
    );
  }

  if (out.length === 0) {
    return growthDomainIntelligence.possibleUnderlyingQuestions.slice(0, 3);
  }
  return [...new Set(out)].slice(0, 3);
}

/** Primary constraint + optional secondary when material. */
export function detectGrowthConstraints(text: string): {
  primary: GrowthConstraintId;
  secondary?: GrowthConstraintId;
} {
  const t = text.toLowerCase();
  const scores = new Map<GrowthConstraintId, number>();
  const bump = (id: GrowthConstraintId, n = 1) =>
    scores.set(id, (scores.get(id) ?? 0) + n);

  if (/cannot keep up|can't keep up|overwhelmed|burned out|waitlist|delivery/.test(t)) {
    bump("delivery_constraint", 3);
    bump("founder_capacity_constraint", 2);
  }
  if (/don't stay|do not stay|churn|retention|cancel/.test(t)) {
    bump("retention_constraint", 3);
  }
  if (/not converting|don't buy|do not buy|sales|pipeline/.test(t)) {
    bump("sales_constraint", 2);
  }
  if (/nobody knows|no traffic|invisible|awareness/.test(t)) {
    bump("demand_constraint", 2);
  }
  if (/positioning|confused|look the same/.test(t)) bump("positioning_constraint", 2);
  if (/offer|package|three new offers|many offers/.test(t)) {
    bump("offer_constraint", 1);
    bump("focus_constraint", 2);
  }
  if (/price|underpriced|pricing/.test(t)) bump("pricing_constraint", 2);
  if (/hire|team|delegate/.test(t)) bump("team_constraint", 2);
  if (/cash|profit|margin|revenue is still low/.test(t)) {
    bump("financial_constraint", 2);
  }
  if (/social|followers|engagement/.test(t)) bump("channel_constraint", 1);
  if (/stay small|feel like i should|don't want bigger|do not want a bigger/.test(t)) {
    bump("focus_constraint", 1);
    bump("evidence_constraint", 1);
  }
  if (/not much evidence|don't know|unsure/.test(t)) bump("evidence_constraint", 2);
  if (/more customers|need customers/.test(t) && scores.size === 0) {
    bump("demand_constraint", 1);
    bump("evidence_constraint", 1);
  }

  const ranked = [...scores.entries()].sort((a, b) => b[1] - a[1]);
  if (ranked.length === 0) {
    return { primary: "evidence_constraint" };
  }
  const primary = ranked[0]![0];
  const secondary =
    ranked[1] && ranked[1][1] >= ranked[0]![1] - 1 ? ranked[1][0] : undefined;
  return secondary ? { primary, secondary } : { primary };
}

export function assessGrowthReadinessHint(text: string): GrowthReadinessConclusion {
  const t = text.toLowerCase();
  if (/cannot keep up|can't keep up|burned out|overwhelmed/.test(t)) {
    return "ready_to_stabilize_delivery_first";
  }
  if (/don't stay|do not stay|churn|retention/.test(t)) {
    return "ready_to_improve_retention_first";
  }
  if (/three new offers|many offers|too many/.test(t)) {
    return "ready_to_simplify_before_growing";
  }
  if (/stay small|don't want (a )?bigger|do not want (a )?bigger/.test(t)) {
    return "current_scale_appropriate";
  }
  if (/not much evidence|unsure|don't know what/.test(t)) {
    return "needs_more_evidence";
  }
  if (/feel like i should|pressure to grow/.test(t)) {
    return "growth_not_immediate_priority";
  }
  if (/positioning|confused about who/.test(t)) {
    return "ready_to_strengthen_positioning_first";
  }
  if (/test|pilot|try/.test(t)) return "ready_for_limited_experiment";
  return "ready_for_focused_growth";
}

export function growthLooksLikeAssumptionNotEvidence(text: string): boolean {
  return (
    /\b(feel like i should|must grow|have to grow|everyone (is|else is) growing|should scale)\b/i.test(
      text,
    ) || /\bi (think|feel|worry|assume)\b/i.test(text)
  );
}

/** Social engagement ≠ buying demand. */
export function growthTreatsSocialAsNonProof(text: string): boolean {
  return /social media|followers|engagement|likes|views/.test(text.toLowerCase());
}

/** Do not assume acquisition is the problem. */
export function growthShouldNotAssumeAcquisition(text: string): boolean {
  return /\b(more customers|need customers|get more clients|acquisition)\b/i.test(
    text,
  );
}

export function growthEvidenceDisciplineRejects(claim: string): string[] {
  const c = claim.toLowerCase();
  const rejects: string[] = [];
  if (/social.*(prove|proof|means).*(demand|growth|sales)/.test(c)) {
    rejects.push("social_as_buying_demand");
  }
  if (/audience size.*(quality|customers)/.test(c)) {
    rejects.push("audience_size_as_quality");
  }
  if (/one (campaign|post).*(system|repeatable)/.test(c)) {
    rejects.push("one_campaign_as_system");
  }
  if (/more inquir.*(profitable|healthy)/.test(c)) {
    rejects.push("inquiries_as_profitable_growth");
  }
  if (/revenue.*(equals|means) (sustainable|healthy)/.test(c)) {
    rejects.push("revenue_as_sustainable_growth");
  }
  if (/busy.*(healthy|success)/.test(c)) rejects.push("busyness_as_health");
  if (/excitement.*(market|demand|proof)/.test(c)) {
    rejects.push("excitement_as_market_evidence");
  }
  if (/competitor.*(prove|proof).*(will work|same)/.test(c)) {
    rejects.push("competitor_success_as_proof");
  }
  return rejects;
}

export function growthOptionPatterns(input: {
  capacityTight?: boolean;
  retentionLeak?: boolean;
  focusScattered?: boolean;
  wantMaintainSize?: boolean;
  revenueNotVolume?: boolean;
  marketExpansion?: boolean;
  hireToGrow?: boolean;
  weakEvidence?: boolean;
}): OptionPatternId[] {
  if (input.wantMaintainSize) {
    return ["maintain_current_direction", "stabilize", "protect_current_base", "test"];
  }
  if (input.capacityTight) {
    return ["stabilize", "protect_current_base", "simplify", "test", "delay"];
  }
  if (input.retentionLeak) {
    return ["protect_current_base", "improve", "stabilize", "test"];
  }
  if (input.focusScattered) {
    return ["narrow", "simplify", "stabilize", "test"];
  }
  if (input.revenueNotVolume) {
    return ["add_value", "improve", "narrow", "test", "protect_current_base"];
  }
  if (input.hireToGrow) {
    return ["simplify", "delegate", "test", "delay", "stabilize"];
  }
  if (input.marketExpansion) {
    return ["test", "narrow", "delay", "improve"];
  }
  if (input.weakEvidence) {
    return ["test", "stabilize", "delay", "narrow"];
  }
  // Never acquisition-only: include focus / retention / test paths
  return ["narrow", "test", "improve", "protect_current_base", "expand", "stabilize"];
}

export function selectGrowthExperimentBlueprints(input: {
  capacityTight?: boolean;
  retentionLeak?: boolean;
  focusScattered?: boolean;
  wantReferrals?: boolean;
  marketExpansion?: boolean;
  channelTest?: boolean;
  conversionFocus?: boolean;
}): GrowthExperimentBlueprint[] {
  const all = getGrowthExperimentBlueprints();
  const byId = (id: string) => all.find((b) => b.id === id)!;
  const picked: GrowthExperimentBlueprint[] = [];
  if (input.capacityTight) picked.push(byId("capacity_experiment"));
  if (input.retentionLeak) picked.push(byId("retention_experiment"));
  if (input.focusScattered || input.marketExpansion) {
    picked.push(byId("narrow_market_experiment"));
  }
  if (input.wantReferrals) picked.push(byId("referral_experiment"));
  if (input.channelTest) picked.push(byId("channel_experiment"));
  if (input.conversionFocus) picked.push(byId("conversion_experiment"));
  if (picked.length === 0) {
    picked.push(byId("referral_experiment"), byId("conversion_experiment"));
  }
  return [...new Map(picked.map((b) => [b.id, b])).values()].slice(0, 2);
}

/** Secondary domain only when materially useful — never load all. */
export function suggestGrowthSecondaryDomain(
  text: string,
): StrategyTypeId | null {
  const t = text.toLowerCase();
  // Volume + weak revenue → Pricing before a generic capacity mention
  if (
    /plenty of customers|lots of customers/.test(t) &&
    /revenue|profit|money|income|underpriced/.test(t)
  ) {
    return "pricing";
  }
  if (/cannot keep up|can't keep up|burned out|overwhelmed|at capacity|no capacity/.test(t)) {
    return "capacity_focus";
  }
  if (
    /revenue.*(low|still)|price|underpriced|charge more|pricing/.test(t) &&
    !/more customers/.test(t)
  ) {
    return "pricing";
  }
  if (/plenty of customers.*revenue|revenue is still low/.test(t)) {
    return "pricing";
  }
  if (/three new offers|new offer|package|offer mix/.test(t)) return "offer";
  if (/another market|new market|segment|positioning|audience/.test(t)) {
    return "market_customer";
  }
  if (/hire|delegate|va|assistant/.test(t)) return "hiring_delegation";
  if (/partner(ship)?/.test(t)) return "partnership";
  return null;
}

export function growthReversibilityForPattern(
  pattern: OptionPatternId,
): Reversibility {
  if (pattern === "test" || pattern === "delay" || pattern === "pause") {
    return "easily_reversible";
  }
  if (
    pattern === "stabilize" ||
    pattern === "maintain_current_direction" ||
    pattern === "protect_current_base" ||
    pattern === "narrow" ||
    pattern === "improve"
  ) {
    return "easily_reversible";
  }
  if (
    pattern === "simplify" ||
    pattern === "add_value" ||
    pattern === "partner" ||
    pattern === "delegate"
  ) {
    return "moderately_reversible";
  }
  if (pattern === "expand" || pattern === "stop") return "difficult_to_reverse";
  return "unknown";
}

export type GrowthHandoffBoundary = {
  destinationId: ContinueJourneyDestinationId;
  when: string;
  owns: string;
};

export const GROWTH_HANDOFF_BOUNDARIES: GrowthHandoffBoundary[] = [
  {
    destinationId: "business_estate",
    when: "Detailed forecasts, cash-flow, or acquisition economics are needed",
    owns: "Finance facts — not the growth decision itself",
  },
  {
    destinationId: "create",
    when: "Pages, scripts, or offer documents after direction is clear",
    owns: "Artifacts — Strategy keeps the decision",
  },
  {
    destinationId: "project",
    when: "Coordinated implementation of a chosen growth path",
    owns: "Execution after decision",
  },
  {
    destinationId: "execution_manager",
    when: "Sequencing and follow-through on a chosen path",
    owns: "Follow-through after decision",
  },
  {
    destinationId: "board",
    when: "High-impact or difficult-to-reverse growth choice",
    owns: "Challenge perspectives",
  },
  {
    destinationId: "talk_it_out",
    when: "Pressure, comparison, or identity conflict blocks judgment",
    owns: "Emotional clarity before judgment",
  },
];

export const GROWTH_SHARI_VOICE_NOTES = [
  "Before we decide how to grow, I want to understand what you need growth to change.",
  "More customers may not be the only path to more revenue.",
  "It sounds like demand may not be the main constraint. Delivery capacity may be.",
  "Growth that leaves you exhausted and customers less supported would not really be healthy growth.",
  "We may have three different paths here: bring in more people, create more value for current customers, or simplify so the business can support growth later.",
  "You do not have to grow simply because the business could.",
  "Maintaining the size you have is still a strategic choice.",
  "We could test this with a limited audience before you build a whole new direction.",
  "The strongest move may be to improve retention before spending more energy on acquisition.",
] as const;

export function growthQualityRejectReasons(guidance: string): string[] {
  const g = guidance.toLowerCase();
  const rejects: string[] = [];
  if (/scale at all costs|must grow|every business must grow/.test(g)) {
    rejects.push("growth_always_required");
  }
  if (/you need a funnel|just (post|hire)|more leads will solve/.test(g)) {
    rejects.push("tactic_default");
  }
  if (/confirmed decision|you have decided|decision is final/.test(g)) {
    rejects.push("marks_recommendation_as_confirmed");
  }
  if (/automatically (open|go to) marketing|routing to marketing now/.test(g)) {
    rejects.push("automatic_marketing_handoff");
  }
  if (/revenue alone|only revenue matters/.test(g)) {
    rejects.push("revenue_as_sole_success");
  }
  return rejects;
}

/** Cosmetic / tactic diversity — channel posting variants are not strategies. */
export function growthOptionsLookCosmetic(labels: string[]): boolean {
  const channelPosts = labels.filter((l) =>
    /post more on (facebook|instagram|linkedin)|more ads on/i.test(l),
  );
  return channelPosts.length >= 2;
}
