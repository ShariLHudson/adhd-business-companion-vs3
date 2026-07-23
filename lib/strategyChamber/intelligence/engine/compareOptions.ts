import type { AdaptivePresentationResolved } from "@/lib/adaptiveCompanionIntelligence";
import {
  compareOptionsPlain,
  salientTradeoffDimensions,
} from "../frameworks/tradeoffs";
import type { EnrichedStrategyOption } from "../types";

export function compareStrategicOptions(
  options: EnrichedStrategyOption[],
  presentation?: AdaptivePresentationResolved,
): { dimensions: string[]; lines: string[]; style: string } {
  const dims = salientTradeoffDimensions(options);
  const style = presentation?.comparisonStyle ?? "plain_tradeoffs";
  if (style === "one_criterion" && dims[0]) {
    return {
      dimensions: [dims[0]],
      style,
      lines: options.slice(0, 3).map((o) => {
        const trade = o.mainTradeoff || o.tradeoffs?.[0] || "unclear trade-off";
        return `${o.title} — on ${dims[0]}: ${trade}`;
      }),
    };
  }
  return {
    dimensions: dims,
    style,
    lines: compareOptionsPlain(options),
  };
}
