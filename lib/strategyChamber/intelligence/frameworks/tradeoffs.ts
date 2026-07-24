import type { EnrichedStrategyOption } from "../types";
import type { StrategicOption } from "../optionContract";

export type TradeoffDimension =
  | "revenue"
  | "profit"
  | "cash"
  | "time"
  | "energy"
  | "focus"
  | "complexity"
  | "speed"
  | "quality"
  | "customer_trust"
  | "retention"
  | "reputation"
  | "team_burden"
  | "personal_fit"
  | "sustainability"
  | "learning"
  | "flexibility"
  | "future_opportunity"
  | "delivery_capacity"
  | "maintenance_burden"
  | "risk"
  // legacy aliases used in earlier Phase 3 code
  | "trust"
  | "capacity"
  | "opportunity_cost";

const DIM_PATTERNS: Array<{ dim: TradeoffDimension; re: RegExp }> = [
  { dim: "revenue", re: /\b(price|revenue|money|cash|fee|profit)\b/ },
  { dim: "customer_trust", re: /\b(trust|member|customer|churn|loyalty)\b/ },
  { dim: "speed", re: /\b(time|slow|fast|speed|urgent)\b/ },
  { dim: "delivery_capacity", re: /\b(capacity|energy|overwhelm|delivery|burn)\b/ },
  { dim: "risk", re: /\b(risk|uncertain|test|irrevers)\b/ },
  { dim: "flexibility", re: /\b(flex|revers|pilot|experiment|optional)\b/ },
  { dim: "complexity", re: /\b(complex|simple|simplify|maintenance)\b/ },
  { dim: "focus", re: /\b(focus|scatter|priority|attention)\b/ },
  { dim: "learning", re: /\b(learn|evidence|signal|test)\b/ },
  { dim: "personal_fit", re: /\b(fit|values|identity|feel)\b/ },
  { dim: "sustainability", re: /\b(sustain|long.?term|season)\b/ },
  { dim: "team_burden", re: /\b(hire|manage|team|delegate|va)\b/ },
  { dim: "future_opportunity", re: /\b(opportunity|option|future|close)\b/ },
];

/** Pick a few dimensions that matter for this option set — never all. */
export function salientTradeoffDimensions(
  options: EnrichedStrategyOption[],
): TradeoffDimension[] {
  const text = options
    .map((o) =>
      [o.title, o.whyItMayFit, ...(o.tradeoffs ?? []), o.mainTradeoff]
        .filter(Boolean)
        .join(" "),
    )
    .join(" ")
    .toLowerCase();
  const dims: TradeoffDimension[] = [];
  for (const { dim, re } of DIM_PATTERNS) {
    if (re.test(text) && !dims.includes(dim)) dims.push(dim);
    if (dims.length >= 3) break;
  }
  if (dims.length === 0) dims.push("focus", "risk", "delivery_capacity");
  return dims.slice(0, 3);
}

export function compareOptionsPlain(
  options: EnrichedStrategyOption[],
): string[] {
  return options.slice(0, 3).map((o) => {
    const benefit = o.primaryBenefit || o.benefits?.[0] || "Possible benefit";
    const trade = o.mainTradeoff || o.tradeoffs?.[0] || "Trade-off unclear";
    return `${o.title}: helps with ${benefit}; main trade-off is ${trade}.`;
  });
}

/** Concise per-option trade-off card fields for comparison / Decision Record. */
export function optionTradeoffCard(option: StrategicOption): {
  primaryBenefit: string;
  primaryTradeoff: string;
  protects: string;
  makesHarder: string;
  delaysOrPrevents: string;
  capacityBurden: string;
} {
  return {
    primaryBenefit: option.primaryBenefit || option.benefits[0] || "A clearer path",
    primaryTradeoff: option.mainTradeoff || option.tradeoffs[0] || "Something else waits",
    protects: option.protects || option.protectsList?.[0] || "What already matters",
    makesHarder:
      option.makesHarder?.[0] ||
      option.opportunityCosts[0] ||
      "Competing paths that need attention",
    delaysOrPrevents:
      option.delaysOrPrevents?.[0] || "Full commitment to other paths",
    capacityBurden:
      option.capacityBurden ||
      option.capacityRequirements[0]?.note ||
      "Some attention and follow-through",
  };
}
