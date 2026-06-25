import type { ShariImageState } from "@/lib/shariImageState";
import type { CompanionPresenceExpression } from "./types";

/** Map organic Shari image state to a human companion moment. */
export function expressionFromShariState(
  state: ShariImageState,
): CompanionPresenceExpression {
  switch (state) {
    case "birthday":
    case "celebration":
    case "app_anniversary":
    case "anniversary":
      return "celebrating";
    case "recovery":
    case "support":
    case "overwhelmed_support":
      return "calm_reassurance";
    case "encouragement":
      return "encouraging";
    case "focus":
      return "focused";
    case "morning":
    case "afternoon":
      return "planning_together";
    case "evening":
      return "quiet_presence";
    case "seasonal_spring":
    case "seasonal_summer":
    case "seasonal_fall":
    case "seasonal_winter":
      return "thoughtful";
    default:
      return "warm_welcome";
  }
}
