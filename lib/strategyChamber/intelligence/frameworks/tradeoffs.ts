import type { EnrichedStrategyOption } from "../types";

export type TradeoffDimension =
  | "revenue"
  | "cost"
  | "time"
  | "energy"
  | "focus"
  | "complexity"
  | "trust"
  | "capacity"
  | "risk"
  | "flexibility"
  | "speed"
  | "learning"
  | "opportunity_cost"
  | "personal_fit"
  | "sustainability";

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
  if (/\b(price|revenue|money|cash)\b/.test(text)) dims.push("revenue");
  if (/\b(trust|member|customer|churn)\b/.test(text)) dims.push("trust");
  if (/\b(time|slow|fast|speed)\b/.test(text)) dims.push("speed");
  if (/\b(capacity|energy|overwhelm|focus)\b/.test(text)) dims.push("capacity");
  if (/\b(risk|uncertain|test)\b/.test(text)) dims.push("risk");
  if (/\b(flex|revers|pilot|experiment)\b/.test(text)) dims.push("flexibility");
  if (dims.length === 0) dims.push("focus", "risk", "capacity");
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
